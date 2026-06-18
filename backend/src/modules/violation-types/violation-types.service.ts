import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateViolationTypeDto } from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';

@Injectable()
export class ViolationTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.violationType.findMany({
      include: {
        game: true,
        cases: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.violationType.findUnique({
      where: { id },
      include: {
        game: true,
        cases: true,
      },
    });
  }

  create(data: CreateViolationTypeDto) {
    return this.prisma.violationType.create({
      data,
      include: { game: true},
    });
  }

  update(id: string, data: UpdateViolationTypeDto) {
    return this.prisma.violationType.update({
      where: { id },
      data,
      include: { game: true },
    });
  }

  remove(id: string) {
    return this.prisma.violationType.delete({
      where: { id },
    });
  }
}
