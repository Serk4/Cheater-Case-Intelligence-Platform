import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.report.findMany({
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  create(data: CreateReportDto) {
    return this.prisma.report.create({
      data,
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  update(id: string, data: UpdateReportDto) {
    return this.prisma.report.update({
      where: { id },
      data,
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.report.delete({
      where: { id },
    });
  }
}
