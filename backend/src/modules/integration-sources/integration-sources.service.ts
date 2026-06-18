import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateIntegrationSourceDto } from './dto/create-integration-source.dto';
import { UpdateIntegrationSourceDto } from './dto/update-integration-source.dto';

@Injectable()
export class IntegrationSourcesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.integrationSource.findMany({
      include: {
        game: true,
        reports: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.integrationSource.findUnique({
      where: { id },
      include: {
        game: true,
        reports: true,
      },
    });
  }

  create(data: CreateIntegrationSourceDto) {
    return this.prisma.integrationSource.create({
      data,
      include: {
        game: true,
      },
    });
  }

  update(id: string, data: UpdateIntegrationSourceDto) {
    return this.prisma.integrationSource.update({
      where: { id },
      data,
      include: {
        game: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.integrationSource.delete({
      where: { id },
    });
  }
}
