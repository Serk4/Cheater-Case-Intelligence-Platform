import {
	Req,
	Body,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Query,
	UsePipes,
	ValidationPipe,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiQuery,
	ApiConsumes,
	ApiBearerAuth,
} from '@nestjs/swagger'
import { CasesService } from './cases.service'
import { CreateCaseDto } from './dto/create-case.dto'
import { UpdateCaseDto } from './dto/update-case.dto'
import { CaseListQueryDto } from './dto/case-list.query.dto'
import { CreateNoteDto } from './dto/create-note.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
	UploadedFiles,
	BadRequestException,
} from '@nestjs/common'
import { CreateEvidenceDto } from './dto/create-evidence.dto'
import { AuditInterceptor } from '../../common/audit/audit.interceptor'
import { Auth, CurrentUser } from '../auth'
import * as path from 'path'

@Controller('cases')
@ApiTags('Cases')
@ApiBearerAuth()
@Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseInterceptors(AuditInterceptor)
export class CasesController {
	constructor(private readonly casesService: CasesService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a new case',
		description: 'Creates a new cheating case in the system',
	})
	@ApiBody({ type: CreateCaseDto })
	@ApiResponse({
		status: 201,
		description: 'Case created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid case data',
	})
	create(@Body() dto: CreateCaseDto) {
		return this.casesService.create(dto)
	}

	@Post(':caseId/evidence')
	@ApiOperation({
		summary: 'Upload evidence files to a case',
		description:
			'Uploads one or more evidence files (images, videos, documents) to a case',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description:
						'Evidence files (PNG, JPEG, WebP, MP4, WebM, TXT, JSON - max 500MB)',
				},
				description: {
					type: 'string',
					description: 'Description of the evidence',
				},
				evidenceType: { type: 'string', description: 'Type of evidence' },
			},
			required: ['files'],
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Evidence uploaded successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid file or unsupported file type',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
			fileFilter: (req, file, callback) => {
				const allowedMimeTypes = [
					'image/png',
					'image/jpeg',
					'image/webp',
					'video/mp4',
					'video/webm',
					'text/plain',
					'application/json',
				]

				const allowedExtensions = [
					'.png',
					'.jpg',
					'.jpeg',
					'.webp',
					'.mp4',
					'.webm',
					'.txt',
					'.json',
				]

				const ext = path.extname(file.originalname).toLowerCase()

				if (!allowedMimeTypes.includes(file.mimetype)) {
					return callback(
						new BadRequestException(`Unsupported file type: ${file.mimetype}`),
						false,
					)
				}

				if (!allowedExtensions.includes(ext)) {
					return callback(
						new BadRequestException(`Unsupported file extension: ${ext}`),
						false,
					)
				}

				callback(null, true)
			},
		}),
	)
	async createEvidence(
		@UploadedFiles() files: Express.Multer.File[],
		@Param('caseId') caseId: string,
		@Body() dto: CreateEvidenceDto,
		@Req() req: any,
	) {
		return this.casesService.createEvidence({ ...dto, caseId }, files)
	}

	@Get('search')
	@ApiOperation({
		summary: 'Search and list cases',
		description:
			'Retrieves a list of cases with optional filtering and pagination',
	})
	@ApiQuery({ type: CaseListQueryDto, required: false })
	@ApiResponse({
		status: 200,
		description: 'Cases retrieved successfully',
	})
	async listCases(@Query() query: CaseListQueryDto) {
		return this.casesService.listCases(query)
	}

	@Get()
	@ApiOperation({
		summary: 'List all cases',
		description: 'Retrieves a list of all cases in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Cases retrieved successfully',
	})
	findAll() {
		return this.casesService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get case details',
		description: 'Retrieves detailed information about a specific case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Case retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseById(@Param('id') id: string) {
		return this.casesService.getCaseById(id)
	}

	@Get(':id/subjects')
	@ApiOperation({
		summary: 'Get case subjects (accused players)',
		description:
			'Retrieves all subjects (accused players) associated with a case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Subjects retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseSubjects(@Param('id') id: string) {
		return this.casesService.getCaseSubjects(id)
	}

	@Get(':id/reports')
	@ApiOperation({
		summary: 'Get case reports',
		description: 'Retrieves all reports associated with a case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Reports retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseReports(@Param('id') id: string) {
		return this.casesService.getCaseReports(id)
	}

	@Get(':id/evidence')
	@ApiOperation({
		summary: 'Get case evidence',
		description: 'Retrieves all evidence files associated with a case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Evidence retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseEvidence(@Param('id') id: string) {
		return this.casesService.getCaseEvidence(id)
	}

	@Get(':id/notes')
	@ApiOperation({
		summary: 'Get case notes',
		description: 'Retrieves all notes and comments associated with a case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Notes retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseNotes(@Param('id') id: string) {
		return this.casesService.getCaseNotes(id)
	}

	@Get(':id/verdict')
	@ApiOperation({
		summary: 'Get case verdict',
		description: 'Retrieves the verdict and decision for a case',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Verdict retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	getCaseVerdict(@Param('id') id: string) {
		return this.casesService.getCaseVerdict(id)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a case',
		description:
			'Updates case information such as status, priority, or assignment',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiBody({ type: UpdateCaseDto })
	@ApiResponse({
		status: 200,
		description: 'Case updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
		return this.casesService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a case',
		description: 'Permanently removes a case from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Case deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	remove(@Param('id') id: string) {
		return this.casesService.remove(id)
	}

	@Post('notes')
	@ApiOperation({
		summary: 'Add a note to a case',
		description: 'Creates a new note or comment on a case',
	})
	@ApiBody({ type: CreateNoteDto })
	@ApiResponse({
		status: 201,
		description: 'Note created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid note data',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	async createNote(@Body() dto: CreateNoteDto) {
		return this.casesService.createNote(dto)
	}

	@Delete('notes/:id')
	@ApiOperation({
		summary: 'Delete a note from a case',
		description:
			'Soft-deletes a note (marks as deleted but retains audit trail)',
	})
	@ApiParam({
		name: 'id',
		description: 'The note ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Note deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Note not found',
	})
	async deleteNote(@Param('id') id: string) {
		return this.casesService.softDeleteNote(id)
	}

	@Delete(':caseId/evidence/:evidenceId')
	@ApiOperation({
		summary: 'Delete evidence from a case',
		description:
			'Deletes evidence and all associated files from a case',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiParam({
		name: 'evidenceId',
		description: 'The evidence ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Evidence deleted successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid evidence ID',
	})
	@ApiResponse({
		status: 404,
		description: 'Evidence not found',
	})
	async deleteEvidence(@Param('evidenceId') evidenceId: string) {
		return this.casesService.deleteEvidence(evidenceId)
	}

	// ──────────────────────────────────────
	// WORKFLOW: ASSIGNMENT ENDPOINTS
	// ──────────────────────────────────────

	@Post(':caseId/assign')
	@ApiOperation({
		summary: 'Assign a case to a reviewer',
		description: 'Manually assign a case to an analyst or senior analyst',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				assignToId: {
					type: 'string',
					description: 'User ID to assign the case to',
				},
				reason: {
					type: 'string',
					description: 'Reason for assignment',
					example: 'Assigned based on expertise in this game',
				},
			},
			required: ['assignToId'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Case assigned successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid user or case',
	})
	@ApiResponse({
		status: 404,
		description: 'Case or user not found',
	})
	async assignCase(
		@Param('caseId') caseId: string,
		@Body() dto: any,
		@Req() req: any,
	) {
		return this.casesService.assignCase(
			caseId,
			dto.assignToId,
			dto.reason || 'Manual assignment',
			req.user?.id,
		)
	}

	@Get(':caseId/assignments')
	@ApiOperation({
		summary: 'Get assignment history for a case',
		description: 'Returns all assignment changes for a case',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Assignment history retrieved',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	async getAssignmentHistory(@Param('caseId') caseId: string) {
		return this.casesService.getAssignmentHistory(caseId)
	}

	@Get('users/:userId/workload')
	@ApiOperation({
		summary: 'Get reviewer workload',
		description: 'Returns number of assigned and in-progress cases for a user',
	})
	@ApiParam({
		name: 'userId',
		description: 'The user ID',
	})
	@ApiResponse({
		status: 200,
		description: 'User workload retrieved',
		schema: {
			type: 'object',
			properties: {
				assigned: { type: 'number' },
				inProgress: { type: 'number' },
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	async getUserWorkload(@Param('userId') userId: string) {
		return this.casesService.getUserWorkload(userId)
	}

	// ──────────────────────────────────────
	// WORKFLOW: STATUS TRANSITION ENDPOINTS
	// ──────────────────────────────────────

	@Get(':caseId/valid-statuses')
	@ApiOperation({
		summary: 'Get valid next statuses for a case',
		description: 'Returns list of valid status transitions from current status',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Valid statuses retrieved',
		schema: {
			type: 'array',
			items: { type: 'string' },
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	async getValidStatusTransitions(@Param('caseId') caseId: string) {
		return this.casesService.getValidStatusTransitions(caseId)
	}

	@Post(':caseId/transition')
	@ApiOperation({
		summary: 'Transition case to a new status',
		description: 'Move case through the workflow state machine with validation',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				newStatus: {
					type: 'string',
					enum: ['OPEN', 'UNDER_REVIEW', 'PENDING_EVIDENCE', 'ESCALATED', 'CLOSED', 'DISMISSED'],
					description: 'Target status',
				},
				reason: {
					type: 'string',
					description: 'Reason for status change',
					example: 'Ready for review by senior analyst',
				},
			},
			required: ['newStatus'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Status transitioned successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid status transition or prerequisites not met',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	async transitionStatus(
		@Param('caseId') caseId: string,
		@Body() dto: any,
		@Req() req: any,
	) {
		return this.casesService.transitionStatus(
			caseId,
			dto.newStatus,
			dto.reason || 'Status transition',
			req.user?.id,
		)
	}

	@Get(':caseId/status-history')
	@ApiOperation({
		summary: 'Get status transition history for a case',
		description: 'Returns all status changes for a case with timestamps and reasons',
	})
	@ApiParam({
		name: 'caseId',
		description: 'The case ID',
		example: 'CASE-abc-2024-001',
	})
	@ApiResponse({
		status: 200,
		description: 'Status history retrieved',
	})
	@ApiResponse({
		status: 404,
		description: 'Case not found',
	})
	async getStatusHistory(@Param('caseId') caseId: string) {
		return this.casesService.getStatusHistory(caseId)
	}
}
