import { Module } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from './audit.service'
import { EventEmitterService } from './event-emitter.service'

@Module({
	providers: [AuditService, EventEmitterService, PrismaService],
	exports: [AuditService, EventEmitterService],
})
export class AuditModule {}
