import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { CaseViolationTypesService } from './case-violation-types.service'
import { CreateCaseViolationTypeDto } from './dto/create-case-violation-type.dto'

@Controller('case-violation-types')
@ApiTags('Cases')
export class CaseViolationTypesController {
	constructor(private readonly service: CaseViolationTypesService) {}

	@Get()
	@ApiOperation({
		summary: 'List all case violations',
		description: 'Retrieves all violation types associated with cases',
	})
	@ApiResponse({
		status: 200,
		description: 'Case violations retrieved successfully',
	})
	findAll() {
		return this.service.findAll()
	}

	@Get(':caseId/:violationTypeId')
	@ApiOperation({
		summary: 'Get a specific case violation',
		description:
			'Retrieves the relationship between a case and a violation type',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
	})
	@ApiParam({
		name: 'violationTypeId',
		description: 'The violation type ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Case violation retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case violation not found',
	})
	findOne(
		@Param('caseId') caseId: string,
		@Param('violationTypeId') violationTypeId: string,
	) {
		return this.service.findOne(caseId, violationTypeId)
	}

	@Post()
	@ApiOperation({
		summary: 'Link violation type to case',
		description: 'Associates a violation type with a specific case',
	})
	@ApiBody({ type: CreateCaseViolationTypeDto })
	@ApiResponse({
		status: 201,
		description: 'Case violation created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid case violation data',
	})
	create(@Body() dto: CreateCaseViolationTypeDto) {
		return this.service.create(dto)
	}

	@Delete(':caseId/:violationTypeId')
	@ApiOperation({
		summary: 'Remove violation type from case',
		description: 'Unlinks a violation type from a case',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
	})
	@ApiParam({
		name: 'violationTypeId',
		description: 'The violation type ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Case violation removed successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case violation not found',
	})
	remove(
		@Param('caseId') caseId: string,
		@Param('violationTypeId') violationTypeId: string,
	) {
		return this.service.remove(caseId, violationTypeId)
	}
}
