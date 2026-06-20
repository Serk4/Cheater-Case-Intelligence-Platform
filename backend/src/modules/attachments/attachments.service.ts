import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttachmentDto: CreateAttachmentDto) {
    // Basic validation: exactly one of evidenceId or noteId
    if ((!createAttachmentDto.evidenceId && !createAttachmentDto.noteId) ||
        (createAttachmentDto.evidenceId && createAttachmentDto.noteId)) {
      throw new Error('Exactly one of evidenceId or noteId must be provided');
    }

    return this.prisma.attachment.create({
      data: createAttachmentDto,
      include: {
        evidence: true,
        note: true,
      },
    });
  }

  async findAll() {
    return this.prisma.attachment.findMany({
      include: {
        evidence: { select: { id: true, title: true } },
        note: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        evidence: true,
        note: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto) {
    await this.findOne(id);

    return this.prisma.attachment.update({
      where: { id },
      data: updateAttachmentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}