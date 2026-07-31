import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { CaseStatus } from '@prisma/client'

export class TransitionStatusDto {
	@IsEnum(CaseStatus)
	newStatus: CaseStatus

	@IsOptional()
	@IsString()
	@MinLength(10)
	reason?: string
}
