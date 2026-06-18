import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';

@Injectable()
export class PlatformsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.platform.findMany({
      include: {
        game: true,
        subjects: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.platform.findUnique({
      where: { id },
      include: {
        game: true,
        subjects: true,
      },
    });
  }

  create(data: CreatePlatformDto) {
    return this.prisma.platform.create({
      data,
      include: {
        game: true,
      },
    });
  }

  update(id: string, data: UpdatePlatformDto) {
    return this.prisma.platform.update({
      where: { id },
      data,
      include: {
        game: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.platform.delete({
      where: { id },
    });
  }
}
