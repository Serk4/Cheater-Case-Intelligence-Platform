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
import { ReportsService } from './reports.service'
import { CreateReportDto } from './dto/create-report.dto'
import { UpdateReportDto } from './dto/update-report.dto'
import { ReportIngestionDto } from './dto/report-ingestion.dto'

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) {}

	@Get()
	@ApiOperation({
		summary: 'List all reports',
		description: 'Retrieves all cheating reports in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Reports retrieved successfully',
	})
	findAll() {
		return this.reportsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific report',
		description: 'Retrieves detailed information about a single report',
	})
	@ApiParam({
		name: 'id',
		description: 'The report ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Report retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Report not found',
	})
	findOne(@Param('id') id: string) {
		return this.reportsService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new report',
		description: 'Manually creates a new cheating report',
	})
	@ApiBody({ type: CreateReportDto })
	@ApiResponse({
		status: 201,
		description: 'Report created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid report data',
	})
	create(@Body() dto: CreateReportDto) {
		return this.reportsService.create(dto)
	}

	@Post('ingest')
	@ApiOperation({
		summary: 'Ingest a report from external integration',
		description:
			'Processes a cheating report from an integration source (webhook, API, etc.) and creates a case if needed',
	})
	@ApiBody({
		type: ReportIngestionDto,
		description: 'Report data from external integration source',
	})
	@ApiResponse({
		status: 201,
		description: 'Report ingested and case created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid ingestion data or unsupported integration source',
	})
	ingest(@Body() dto: ReportIngestionDto) {
		return this.reportsService.ingestFromIntegration(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a report',
		description: 'Updates report information',
	})
	@ApiParam({
		name: 'id',
		description: 'The report ID',
	})
	@ApiBody({ type: UpdateReportDto })
	@ApiResponse({
		status: 200,
		description: 'Report updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Report not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
		return this.reportsService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a report',
		description: 'Permanently removes a report from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The report ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Report deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Report not found',
	})
	remove(@Param('id') id: string) {
		return this.reportsService.remove(id)
	}
}
