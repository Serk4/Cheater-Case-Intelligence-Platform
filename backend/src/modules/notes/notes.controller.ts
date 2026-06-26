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
import { NotesService } from './notes.service'
import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'
import { SYSTEM_INGEST_USER_ID, SYSTEM_INGEST_USER_ROLE } from '../../constants/system-users'

@Controller('cases/:caseId/notes')
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get()
	async getCaseNotes(@Param('caseId') caseId: string, @Req() req: any) {
		return this.notesService.getCaseNotes(caseId, req.user.role)
	}

	@Post()
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
export class SingleNoteController {
	constructor(private readonly notesService: NotesService) {}

	@Patch(':noteId')
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
	async pinNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.pinNote(noteId, role)
	}

	@Patch(':noteId/unpin')
	async unpinNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.unpinNote(noteId, role)
	}

	@Delete(':noteId')
	async deleteNote(@Param('noteId') noteId: string, @Req() req: any) {
		const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE
		return this.notesService.softDeleteNote(noteId, role)
	}
}

@Controller('cases')
export class EvidenceNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':caseId/evidence/:evidenceId/notes')
  async getEvidenceNotes(
    @Param('caseId') caseId: string,
    @Param('evidenceId') evidenceId: string,
    @Req() req: any,
  ) {
    const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE;
    return this.notesService.getEvidenceNotes(
      caseId,
      evidenceId,
      role,
    );
  }

  @Post(':caseId/evidence/:evidenceId/notes')
  async createEvidenceNote(
    @Param('caseId') caseId: string,
    @Param('evidenceId') evidenceId: string,
    @Body() dto: CreateNoteDto,
    @Req() req: any,
  ) {
    const role = req.user?.role ?? SYSTEM_INGEST_USER_ROLE;
    const authorId = req.user?.id ?? SYSTEM_INGEST_USER_ID;
    if (role === 'VIEWER') {
      throw new ForbiddenException('Viewers cannot create notes.');
    }
    return this.notesService.createEvidenceNote(
      caseId,
      evidenceId,
      authorId,
      dto,
    );
  }
}

