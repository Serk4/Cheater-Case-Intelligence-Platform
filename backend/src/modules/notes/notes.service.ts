import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'
import { NoteVisibility, UserRole } from '@prisma/client/wasm'

@Injectable()
export class NotesService {
	constructor(private prisma: PrismaService) {}

	async getCaseNotes(caseId: string, userRole: UserRole) {
		const notes = await this.prisma.note.findMany({
			where: { caseId, deletedAt: null },
			orderBy: { createdAt: 'asc' },
			include: {
				author: { select: { id: true, displayName: true, role: true } },
				attachments: true,
			},
		})

		return notes.filter((note) =>
			this.canViewVisibility(userRole, note.visibility),
		)
	}

	// Viewer cannot create notes...The controller will handle that.
	createCaseNote(caseId: string, authorId: string, dto: CreateNoteDto) {
		return this.prisma.note.create({
			data: {
				caseId,
				authorId,
				body: dto.body,
				visibility: dto.visibility ?? 'INTERNAL',
				isPinned: dto.isPinned ?? false,
			},
		})
	}

	async updateNote(noteId: string, dto: UpdateNoteDto, userRole: UserRole) {
		const note = await this.prisma.note.findUnique({ where: { id: noteId } })

		if (!note) {
			throw new ForbiddenException('Note not found')
		}

		if (!this.canViewVisibility(userRole, note.visibility)) {
			throw new ForbiddenException(
				'You do not have permission to update this note',
			)
		}

		return this.prisma.note.update({
			where: { id: noteId },
			data: dto,
		})
	}

	async softDeleteNote(noteId: string, userRole: UserRole) {
		const note = await this.prisma.note.findUnique({ where: { id: noteId } })

		if (!note) {
			throw new ForbiddenException('Note not found')
		}

		if (!this.canViewVisibility(userRole, note.visibility)) {
			throw new ForbiddenException(
				'You do not have permission to delete this note',
			)
		}

		return this.prisma.note.update({
			where: { id: noteId },
			data: { deletedAt: new Date() },
		})
	}

	async pinNote(noteId: string, userRole: UserRole) {
		const note = await this.prisma.note.findUnique({ where: { id: noteId } })

		if (!note) {
			throw new ForbiddenException('Note not found.')
		}

		if (!this.canViewVisibility(userRole, note.visibility)) {
			throw new ForbiddenException(
				'You do not have permission to pin this note.',
			)
		}

		return this.prisma.note.update({
			where: { id: noteId },
			data: { isPinned: true },
		})
	}

	async unpinNote(noteId: string, userRole: UserRole) {
		const note = await this.prisma.note.findUnique({ where: { id: noteId } })

		if (!note) {
			throw new ForbiddenException('Note not found.')
		}

		if (!this.canViewVisibility(userRole, note.visibility)) {
			throw new ForbiddenException(
				'You do not have permission to unpin this note.',
			)
		}

		return this.prisma.note.update({
			where: { id: noteId },
			data: { isPinned: false },
		})
	}

	async createEvidenceNote(
		caseId: string,
		evidenceId: string,
		authorId: string,
		dto: CreateNoteDto,
	) {
		// Ensure evidence belongs to the case
		const evidence = await this.prisma.evidence.findFirst({
			where: { id: evidenceId, caseId },
		})

		if (!evidence) {
			throw new ForbiddenException('Evidence does not belong to this case.')
		}
    console.log('Service: Creating evidence note:', { caseId, evidenceId, authorId, dto });
		return this.prisma.note.create({
			data: {
				caseId,
				authorId,
				body: dto.body,
				visibility: dto.visibility ?? 'INTERNAL',
				isPinned: dto.isPinned ?? false,
				evidenceId,
			},
		})
	}

	async getEvidenceNotes(
		caseId: string,
		evidenceId: string,
		userRole: UserRole,
	) {
		const notes = await this.prisma.note.findMany({
			where: {
				caseId,
				evidenceId,
				deletedAt: null,
			},
			orderBy: { createdAt: 'asc' },
			include: {
				author: { select: { id: true, displayName: true, role: true } },
				attachments: true,
			},
		})

		return notes.filter((note) =>
			this.canViewVisibility(userRole, note.visibility),
		)
	}

	//Helper Functions
	private canViewVisibility(
		userRole: UserRole,
		visibility: NoteVisibility,
	): boolean {
		if (visibility === 'INTERNAL') {
			return (
				userRole === 'ANALYST' ||
				userRole === 'SENIOR_ANALYST' ||
				userRole === 'ADMIN'
			)
		}

		if (visibility === 'RESTRICTED') {
			return userRole === 'SENIOR_ANALYST' || userRole === 'ADMIN'
		}

		if (visibility === 'CONFIDENTIAL') {
			return userRole === 'ADMIN'
		}

		return false
	}
}
