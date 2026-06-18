import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.case.findMany({
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
        subjects: true,
        reports: true,
        evidence: true,
        notes: true,
        verdict: true,
        violationTypes: true,
        auditLogs: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.case.findUnique({
      where: { id },
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
        subjects: true,
        reports: true,
        evidence: true,
        notes: true,
        verdict: true,
        violationTypes: true,
        auditLogs: true,
      },
    });
  }

  create(data: CreateCaseDto) {
    return this.prisma.case.create({
      data,
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
      },
    });
  }

  update(id: string, data: UpdateCaseDto) {
    return this.prisma.case.update({
      where: { id },
      data,
      include: {
        game: true,
        assignedTo: true,
        openedBy: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.case.delete({
      where: { id },
    });
  }
}
