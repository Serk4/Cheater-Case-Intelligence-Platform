import { Module } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { EventEmitterService } from '../../common/audit/event-emitter.service'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'

@Module({
	controllers: [NotificationController],
	providers: [NotificationService, EventEmitterService, PrismaService],
	exports: [NotificationService],
})
export class NotificationModule {}
