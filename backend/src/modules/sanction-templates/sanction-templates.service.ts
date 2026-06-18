import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSanctionTemplateDto } from './dto/create-sanction-template.dto';
import { UpdateSanctionTemplateDto } from './dto/update-sanction-template.dto';

@Injectable()
export class SanctionTemplatesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sanctionTemplate.findMany({
      include: {
        game: true,
        verdicts: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sanctionTemplate.findUnique({
      where: { id },
      include: {
        game: true,
        verdicts: true,
      },
    });
  }

  create(data: CreateSanctionTemplateDto) {
    return this.prisma.sanctionTemplate.create({
      data,
      include: {
        game: true,
      },
    });
  }

  update(id: string, data: UpdateSanctionTemplateDto) {
    return this.prisma.sanctionTemplate.update({
      where: { id },
      data,
      include: {
        game: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.sanctionTemplate.delete({
      where: { id },
    });
  }
}
