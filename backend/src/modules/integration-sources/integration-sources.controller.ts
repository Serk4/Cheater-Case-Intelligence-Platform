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
import { IntegrationSourcesService } from './integration-sources.service'
import { CreateIntegrationSourceDto } from './dto/create-integration-source.dto'
import { UpdateIntegrationSourceDto } from './dto/update-integration-source.dto'

@Controller('integration-sources')
@ApiTags('Integration Sources')
export class IntegrationSourcesController {
	constructor(
		private readonly integrationSourcesService: IntegrationSourcesService,
	) {}

	@Get()
	@ApiOperation({
		summary: 'List all integration sources',
		description:
			'Retrieves all configured integration sources for report ingestion',
	})
	@ApiResponse({
		status: 200,
		description: 'Integration sources retrieved successfully',
	})
	findAll() {
		return this.integrationSourcesService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific integration source',
		description: 'Retrieves configuration for a single integration source',
	})
	@ApiParam({
		name: 'id',
		description: 'The integration source ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Integration source retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Integration source not found',
	})
	findOne(@Param('id') id: string) {
		return this.integrationSourcesService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create an integration source',
		description:
			'Registers a new integration source (webhook endpoint, API key, etc.)',
	})
	@ApiBody({ type: CreateIntegrationSourceDto })
	@ApiResponse({
		status: 201,
		description: 'Integration source created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid integration source data',
	})
	create(@Body() dto: CreateIntegrationSourceDto) {
		return this.integrationSourcesService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update an integration source',
		description: 'Modifies integration source configuration',
	})
	@ApiParam({
		name: 'id',
		description: 'The integration source ID',
	})
	@ApiBody({ type: UpdateIntegrationSourceDto })
	@ApiResponse({
		status: 200,
		description: 'Integration source updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Integration source not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateIntegrationSourceDto) {
		return this.integrationSourcesService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete an integration source',
		description: 'Removes an integration source from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The integration source ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Integration source deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Integration source not found',
	})
	remove(@Param('id') id: string) {
		return this.integrationSourcesService.remove(id)
	}
}
