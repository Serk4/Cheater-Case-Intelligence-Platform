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
import { SanctionTemplatesService } from './sanction-templates.service'
import { CreateSanctionTemplateDto } from './dto/create-sanction-template.dto'
import { UpdateSanctionTemplateDto } from './dto/update-sanction-template.dto'

@Controller('sanction-templates')
@ApiTags('Sanction Templates')
export class SanctionTemplatesController {
	constructor(
		private readonly sanctionTemplatesService: SanctionTemplatesService,
	) {}

	@Get()
	@ApiOperation({
		summary: 'List all sanction templates',
		description: 'Retrieves all available sanction/penalty templates',
	})
	@ApiResponse({
		status: 200,
		description: 'Sanction templates retrieved successfully',
	})
	findAll() {
		return this.sanctionTemplatesService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific sanction template',
		description: 'Retrieves details about a single sanction template',
	})
	@ApiParam({
		name: 'id',
		description: 'The sanction template ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Sanction template retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Sanction template not found',
	})
	findOne(@Param('id') id: string) {
		return this.sanctionTemplatesService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new sanction template',
		description: 'Creates a new sanction/penalty template for case verdicts',
	})
	@ApiBody({ type: CreateSanctionTemplateDto })
	@ApiResponse({
		status: 201,
		description: 'Sanction template created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid sanction template data',
	})
	create(@Body() dto: CreateSanctionTemplateDto) {
		return this.sanctionTemplatesService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a sanction template',
		description: 'Updates sanction template information',
	})
	@ApiParam({
		name: 'id',
		description: 'The sanction template ID',
	})
	@ApiBody({ type: UpdateSanctionTemplateDto })
	@ApiResponse({
		status: 200,
		description: 'Sanction template updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Sanction template not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateSanctionTemplateDto) {
		return this.sanctionTemplatesService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a sanction template',
		description: 'Removes a sanction template from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The sanction template ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Sanction template deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Sanction template not found',
	})
	remove(@Param('id') id: string) {
		return this.sanctionTemplatesService.remove(id)
	}
}
