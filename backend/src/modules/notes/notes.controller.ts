import {
	Body,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Req,
	ForbiddenException,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { NotesService } from './notes.service'
import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'
import {
	SYSTEM_INGEST_USER_ID,
	SYSTEM_INGEST_USER_ROLE,
} from '../../constants/system-users'

@Controller('cases/:caseId/notes')
@ApiTags('Notes')
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get()
	@ApiOperation({
		summary: 'Get case notes',
		description: 'Retrieves all notes attached to a case',
	})
	@ApiParam({ name: 'caseId', description: 'The case ID' })
	@ApiResponse({
		status: 200,
		description: 'Notes retrieved successfully',
	})
	async getCaseNotes(@Param('caseId') caseId: string, @Req() req: any) {
		return this.notesService.getCaseNotes(caseId, req.user.role)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a case note',
		description: 'Adds a new note/comment to a case',
	})
	@ApiParam({ name: 'caseId', description: 'The case ID' })
	@ApiBody({ type: CreateNoteDto })
	@ApiResponse({
		status: 201,
		description: 'Note created successfully',
	})
	@ApiResponse({
		status: 403,
		description: 'Viewers cannot create notes',
	})
	async createCaseNote(
		@Param('caseId') caseId: string,
		@Body() dto: CreateNoteDto,
		@Req() req: any,
	) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE

		//VIEWER cannot create notes, so we throw a forbidden exception if they try to do so.
		if (role === 'VIEWER') {
			throw new ForbiddenException('You do not have permission to create notes')
		}
		const authorId = req.user?.id ?? SYSTEM_INGEST_USER_ID
		return this.notesService.createCaseNote(caseId, authorId, dto)
	}
}

@Controller('notes')
@ApiTags('Notes')
export class SingleNoteController {
	constructor(private readonly notesService: NotesService) {}

	@Patch(':noteId')
	@ApiOperation({
		summary: 'Update a note',
		description: 'Modifies the content of an existing note',
	})
	@ApiParam({ name: 'noteId', description: 'The note ID' })
	@ApiBody({ type: UpdateNoteDto })
	@ApiResponse({
		status: 200,
		description: 'Note updated successfully',
	})
	@ApiResponse({
		status: 403,
		description: 'Insufficient permissions to update note',
	})
	async updateNote(
		@Param('noteId') noteId: string,
		@Body() dto: UpdateNoteDto,
		@Req() req: any,
	) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		if (role === 'VIEWER') {
			throw new ForbiddenException('You do not have permission to update notes')
		}
		return this.notesService.updateNote(noteId, dto, role)
	}

	@Patch(':noteId/pin')
	@ApiOperation({
		summary: 'Pin a note',
		description: 'Marks a note as pinned to keep it visible at the top',
	})
	@ApiParam({ name: 'noteId', description: 'The note ID' })
	@ApiResponse({
		status: 200,
		description: 'Note pinned successfully',
	})
	async pinNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.pinNote(noteId, role)
	}

	@Patch(':noteId/unpin')
	@ApiOperation({
		summary: 'Unpin a note',
		description: 'Removes pin from a note',
	})
	@ApiParam({ name: 'noteId', description: 'The note ID' })
	@ApiResponse({
		status: 200,
		description: 'Note unpinned successfully',
	})
	async unpinNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.unpinNote(noteId, role)
	}

	@Delete(':noteId')
	@ApiOperation({
		summary: 'Delete a note',
		description: 'Soft-deletes a note (retains audit trail)',
	})
	@ApiParam({ name: 'noteId', description: 'The note ID' })
	@ApiResponse({
		status: 200,
		description: 'Note deleted successfully',
	})
	@ApiResponse({
		status: 403,
		description: 'Insufficient permissions to delete note',
	})
	async deleteNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.softDeleteNote(noteId, role)
	}
}

@Controller('cases')
@ApiTags('Notes')
export class EvidenceNotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get(':caseId/evidence/:evidenceId/notes')
	@ApiOperation({
		summary: 'Get evidence notes',
		description: 'Retrieves all notes attached to a specific evidence file',
	})
	@ApiParam({ name: 'caseId', description: 'The case ID' })
	@ApiParam({ name: 'evidenceId', description: 'The evidence ID' })
	@ApiResponse({
		status: 200,
		description: 'Evidence notes retrieved successfully',
	})
	async getEvidenceNotes(
		@Param('caseId') caseId: string,
		@Param('evidenceId') evidenceId: string,
		@Req() req: any,
	) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.getEvidenceNotes(caseId, evidenceId, role)
	}

	@Post(':caseId/evidence/:evidenceId/notes')
	@ApiOperation({
		summary: 'Create evidence note',
		description: 'Adds a note to a specific evidence file',
	})
	@ApiParam({ name: 'caseId', description: 'The case ID' })
	@ApiParam({ name: 'evidenceId', description: 'The evidence ID' })
	@ApiBody({ type: CreateNoteDto })
	@ApiResponse({
		status: 201,
		description: 'Evidence note created successfully',
	})
	@ApiResponse({
		status: 403,
		description: 'Viewers cannot create notes',
	})
	async createEvidenceNote(
		@Param('caseId') caseId: string,
		@Param('evidenceId') evidenceId: string,
		@Body() dto: CreateNoteDto,
		@Req() req: any,
	) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		const authorId = req.user?.id ?? SYSTEM_INGEST_USER_ID
		if (role === 'VIEWER') {
			throw new ForbiddenException('Viewers cannot create notes.')
		}
		return this.notesService.createEvidenceNote(
			caseId,
			evidenceId,
			authorId,
			dto,
		)
	}
}
