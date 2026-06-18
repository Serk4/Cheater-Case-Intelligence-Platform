import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        actor: true,
        case: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: true,
        case: true,
      },
    });
  }

  create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data,
      include: {
        actor: true,
        case: true,
      },
    });
  }

  update(id: string, data: UpdateAuditLogDto) {
    return this.prisma.auditLog.update({
      where: { id },
      data,
      include: {
        actor: true,
        case: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.auditLog.delete({
      where: { id },
    });
  }
}
