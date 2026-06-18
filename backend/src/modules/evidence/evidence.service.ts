import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.evidence.findMany({
      include: {
        case: true,
        uploadedBy: true,
        attachments: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.evidence.findUnique({
      where: { id },
      include: {
        case: true,
        uploadedBy: true,
        attachments: true,
      },
    });
  }

  create(data: CreateEvidenceDto) {
    return this.prisma.evidence.create({
      data,
      include: {
        case: true,
        uploadedBy: true,
      },
    });
  }

  update(id: string, data: UpdateEvidenceDto) {
    return this.prisma.evidence.update({
      where: { id },
      data,
      include: {
        case: true,
        uploadedBy: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.evidence.delete({
      where: { id },
    });
  }
}
