import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.note.findMany({
      include: {
        case: true,
        author: true,
        attachments: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.note.findUnique({
      where: { id },
      include: {
        case: true,
        author: true,
        attachments: true,
      },
    });
  }

  create(data: CreateNoteDto) {
    return this.prisma.note.create({
      data,
      include: {
        case: true,
        author: true,
      },
    });
  }

  update(id: string, data: UpdateNoteDto) {
    return this.prisma.note.update({
      where: { id },
      data,
      include: {
        case: true,
        author: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
