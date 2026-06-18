import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVerdictDto } from './dto/create-verdict.dto';
import { UpdateVerdictDto } from './dto/update-verdict.dto';

@Injectable()
export class VerdictsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.verdict.findMany({
      include: {
        case: true,
        sanctionTemplate: true,
        renderedBy: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.verdict.findUnique({
      where: { id },
      include: {
        case: true,
        sanctionTemplate: true,
        renderedBy: true,
      },
    });
  }

  create(data: CreateVerdictDto) {
    return this.prisma.verdict.create({
      data,
      include: {
        case: true,
        sanctionTemplate: true,
        renderedBy: true,
      },
    });
  }

  update(id: string, data: UpdateVerdictDto) {
    return this.prisma.verdict.update({
      where: { id },
      data,
      include: {
        case: true,
        sanctionTemplate: true,
        renderedBy: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.verdict.delete({
      where: { id },
    });
  }
}
