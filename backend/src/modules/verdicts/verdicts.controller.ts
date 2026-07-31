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
import { VerdictsService } from './verdicts.service'
import { CreateVerdictDto } from './dto/create-verdict.dto'
import { UpdateVerdictDto } from './dto/update-verdict.dto'

@Controller('verdicts')
@ApiTags('Verdicts')
export class VerdictsController {
	constructor(private readonly verdictsService: VerdictsService) {}

	@Get()
	@ApiOperation({
		summary: 'List all verdicts',
		description: 'Retrieves all case verdicts and decisions',
	})
	@ApiResponse({
		status: 200,
		description: 'Verdicts retrieved successfully',
	})
	findAll() {
		return this.verdictsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific verdict',
		description: 'Retrieves details about a single case verdict',
	})
	@ApiParam({
		name: 'id',
		description: 'The verdict ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Verdict retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Verdict not found',
	})
	findOne(@Param('id') id: string) {
		return this.verdictsService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a verdict',
		description:
			'Records the decision/verdict for a case (guilty, innocent, insufficient evidence, etc.)',
	})
	@ApiBody({ type: CreateVerdictDto })
	@ApiResponse({
		status: 201,
		description: 'Verdict created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid verdict data',
	})
	create(@Body() dto: CreateVerdictDto) {
		return this.verdictsService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a verdict',
		description: 'Modifies an existing case verdict',
	})
	@ApiParam({
		name: 'id',
		description: 'The verdict ID',
	})
	@ApiBody({ type: UpdateVerdictDto })
	@ApiResponse({
		status: 200,
		description: 'Verdict updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Verdict not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateVerdictDto) {
		return this.verdictsService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a verdict',
		description: 'Removes a verdict from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The verdict ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Verdict deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Verdict not found',
	})
	remove(@Param('id') id: string) {
		return this.verdictsService.remove(id)
	}
}
