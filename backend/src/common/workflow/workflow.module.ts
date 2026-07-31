import { Module } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { WorkflowRulesService } from './workflow-rules.service'
import { CaseAssignmentService } from './case-assignment.service'
import { CaseStatusValidator } from './case-status.validator'

@Module({
	providers: [
		PrismaService,
		WorkflowRulesService,
		CaseAssignmentService,
		CaseStatusValidator,
	],
	exports: [WorkflowRulesService, CaseAssignmentService, CaseStatusValidator],
})
export class WorkflowModule {}
