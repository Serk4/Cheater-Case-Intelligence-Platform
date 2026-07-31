import {
	Body,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { ViolationTypesService } from './violation-types.service'
import { CreateViolationTypeDto } from './dto/create-violation-type.dto'
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto'

@Controller('violation-types')
@ApiTags('Violation Types')
export class ViolationTypesController {
	constructor(private readonly violationTypesService: ViolationTypesService) {}

	@Get()
	@ApiOperation({
		summary: 'List all violation types',
		description: 'Retrieves all types of cheating violations in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Violation types retrieved successfully',
	})
	findAll() {
		return this.violationTypesService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific violation type',
		description: 'Retrieves details about a single violation type',
	})
	@ApiParam({
		name: 'id',
		description: 'The violation type ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Violation type retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Violation type not found',
	})
	findOne(@Param('id') id: string) {
		return this.violationTypesService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new violation type',
		description: 'Defines a new type of cheating violation',
	})
	@ApiBody({ type: CreateViolationTypeDto })
	@ApiResponse({
		status: 201,
		description: 'Violation type created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid violation type data',
	})
	create(@Body() dto: CreateViolationTypeDto) {
		return this.violationTypesService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a violation type',
		description: 'Updates violation type information',
	})
	@ApiParam({
		name: 'id',
		description: 'The violation type ID',
	})
	@ApiBody({ type: UpdateViolationTypeDto })
	@ApiResponse({
		status: 200,
		description: 'Violation type updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Violation type not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateViolationTypeDto) {
		return this.violationTypesService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a violation type',
		description: 'Removes a violation type from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The violation type ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Violation type deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Violation type not found',
	})
	remove(@Param('id') id: string) {
		return this.violationTypesService.remove(id)
	}
}
