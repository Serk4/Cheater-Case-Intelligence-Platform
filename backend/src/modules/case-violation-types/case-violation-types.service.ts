import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCaseViolationTypeDto } from './dto/create-case-violation-type.dto';

@Injectable()
export class CaseViolationTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.caseViolationType.findMany({
      include: {
        case: true,
        violationType: true,
      },
    });
  }

  findOne(caseId: string, violationTypeId: string) {
    return this.prisma.caseViolationType.findUnique({
      where: {
        caseId_violationTypeId: { caseId, violationTypeId },
      },
      include: {
        case: true,
        violationType: true,
      },
    });
  }

  create(data: CreateCaseViolationTypeDto) {
    return this.prisma.caseViolationType.create({
      data,
      include: {
        case: true,
        violationType: true,
      },
    });
  }

  remove(caseId: string, violationTypeId: string) {
    return this.prisma.caseViolationType.delete({
      where: {
        caseId_violationTypeId: { caseId, violationTypeId },
      },
    });
  }
}
