import {
	IsString,
	IsOptional,
	IsObject,
	IsBoolean,
	IsInt,
	Min,
	Max,
} from 'class-validator'

export class CreateWorkflowRuleDto {
	@IsString()
	name: string

	@IsOptional()
	@IsString()
	description?: string

	@IsString()
	ruleType: string // "AutoAssign", "StatusValidation", "Escalation"

	@IsObject()
	conditions: Record<string, any>

	@IsObject()
	actions: Record<string, any>

	@IsOptional()
	@IsString()
	gameId?: string

	@IsOptional()
	@IsBoolean()
	enabled?: boolean = true

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(1000)
	priority?: number = 0
}

export class UpdateWorkflowRuleDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	description?: string | null

	@IsOptional()
	@IsString()
	ruleType?: string

	@IsOptional()
	@IsObject()
	conditions?: Record<string, any>

	@IsOptional()
	@IsObject()
	actions?: Record<string, any>

	@IsOptional()
	@IsBoolean()
	enabled?: boolean

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(1000)
	priority?: number
}
