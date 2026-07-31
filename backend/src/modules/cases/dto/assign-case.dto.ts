import { IsString, IsOptional, MinLength } from 'class-validator'

export class AssignCaseDto {
	@IsString()
	assignToId: string

	@IsOptional()
	@IsString()
	@MinLength(5)
	reason?: string
}
