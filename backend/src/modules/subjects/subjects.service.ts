import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.subject.findMany({
      include: {
        case: true,
        platform: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        case: true,
        platform: true,
      },
    });
  }

  create(data: CreateSubjectDto) {
    return this.prisma.subject.create({
      data,
      include: {
        case: true,
        platform: true,
      },
    });
  }

  update(id: string, data: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: { id },
      data,
      include: {
        case: true,
        platform: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
