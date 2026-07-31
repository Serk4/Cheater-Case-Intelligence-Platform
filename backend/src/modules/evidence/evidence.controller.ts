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
import { EvidenceService } from './evidence.service'
import { CreateEvidenceDto } from './dto/create-evidence.dto'
import { UpdateEvidenceDto } from './dto/update-evidence.dto'

@Controller('evidence')
@ApiTags('Evidence')
export class EvidenceController {
	constructor(private readonly evidenceService: EvidenceService) {}

	@Get()
	@ApiOperation({
		summary: 'List all evidence',
		description: 'Retrieves all evidence files in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Evidence list retrieved successfully',
	})
	findAll() {
		return this.evidenceService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get specific evidence',
		description: 'Retrieves details about a single evidence file',
	})
	@ApiParam({
		name: 'id',
		description: 'The evidence ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Evidence retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Evidence not found',
	})
	findOne(@Param('id') id: string) {
		return this.evidenceService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create evidence entry',
		description:
			'Creates a new evidence record (typically called via case endpoint for file uploads)',
	})
	@ApiBody({ type: CreateEvidenceDto })
	@ApiResponse({
		status: 201,
		description: 'Evidence created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid evidence data',
	})
	create(@Body() dto: CreateEvidenceDto) {
		return this.evidenceService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update evidence',
		description: 'Updates evidence metadata',
	})
	@ApiParam({
		name: 'id',
		description: 'The evidence ID',
	})
	@ApiBody({ type: UpdateEvidenceDto })
	@ApiResponse({
		status: 200,
		description: 'Evidence updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Evidence not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateEvidenceDto) {
		return this.evidenceService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete evidence',
		description: 'Removes an evidence file from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The evidence ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Evidence deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Evidence not found',
	})
	remove(@Param('id') id: string) {
		return this.evidenceService.remove(id)
	}
}
