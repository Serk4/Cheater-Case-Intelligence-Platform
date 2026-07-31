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
import { AuditLogsService } from './audit-logs.service'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { UpdateAuditLogDto } from './dto/update-audit-log.dto'

@Controller('audit-logs')
@ApiTags('Audit Logs')
export class AuditLogsController {
	constructor(private readonly auditLogsService: AuditLogsService) {}

	@Get()
	@ApiOperation({
		summary: 'List audit logs',
		description: 'Retrieves a record of all actions and changes in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Audit logs retrieved successfully',
	})
	findAll() {
		return this.auditLogsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific audit log entry',
		description: 'Retrieves details about a single audit log entry',
	})
	@ApiParam({
		name: 'id',
		description: 'The audit log entry ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Audit log retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Audit log not found',
	})
	findOne(@Param('id') id: string) {
		return this.auditLogsService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create audit log entry',
		description:
			'Records a new audit log entry (typically created automatically by the system)',
	})
	@ApiBody({ type: CreateAuditLogDto })
	@ApiResponse({
		status: 201,
		description: 'Audit log created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid audit log data',
	})
	create(@Body() dto: CreateAuditLogDto) {
		return this.auditLogsService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update audit log entry',
		description: 'Modifies an audit log entry',
	})
	@ApiParam({
		name: 'id',
		description: 'The audit log entry ID',
	})
	@ApiBody({ type: UpdateAuditLogDto })
	@ApiResponse({
		status: 200,
		description: 'Audit log updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Audit log not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateAuditLogDto) {
		return this.auditLogsService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete audit log entry',
		description: 'Removes an audit log entry from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The audit log entry ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Audit log deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Audit log not found',
	})
	remove(@Param('id') id: string) {
		return this.auditLogsService.remove(id)
	}
}
