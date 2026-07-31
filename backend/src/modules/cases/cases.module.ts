import { Module } from '@nestjs/common'
import { CasesService } from './cases.service'
import { CasesController } from './cases.controller'
import { PrismaModule } from '../../../prisma/prisma.module'
import { MulterModule } from '@nestjs/platform-express'
import { CaseNumberService } from './case-number.service'
import { StorageModule } from '../../common/storage'
import { WorkflowModule } from '../../common/workflow'
import { AuditModule } from '../../common/audit/audit.module'

@Module({
	imports: [PrismaModule, MulterModule.register(), StorageModule, WorkflowModule, AuditModule],
	controllers: [CasesController],
	providers: [CasesService, CaseNumberService],
	exports: [CasesService, CaseNumberService],
})
export class CasesModule {}
