import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateCaseDto } from './dto/create-case.dto'
import { UpdateCaseDto } from './dto/update-case.dto'
import { CaseListQueryDto } from './dto/case-list.query.dto'
import { CreateNoteDto } from './dto/create-note.dto'
import { CreateEvidenceDto } from './dto/create-evidence.dto'
import { CasePriority, CaseStatus } from '@prisma/client/index-browser'
import { CaseNumberService } from './case-number.service'
import { StorageService } from '../../common/storage'
import {
	CaseAssignmentService,
	CaseStatusValidator,
} from '../../common/workflow'
import { EventEmitterService, CaseAssignedEvent, CaseStatusChangedEvent } from '../../common/audit'

@Injectable()
export class CasesService {
	constructor(
		private prisma: PrismaService,
		private caseNumberService: CaseNumberService,
		private storage: StorageService,
		private assignmentService: CaseAssignmentService,
		private statusValidator: CaseStatusValidator,
		private eventEmitter: EventEmitterService,
	) {}

	findAll() {
		return this.prisma.case.findMany({
			include: {
				game: true,
				assignedTo: true,
				openedBy: true,
				subjects: true,
				reports: true,
				evidence: true,
				notes: true,
				verdict: true,
				violationTypes: true,
				auditLogs: true,
			},
		})
	}

	findOne(id: string) {
		return this.prisma.case.findUnique({
			where: { id },
			include: {
				game: true,
				assignedTo: true,
				openedBy: true,
				subjects: true,
				reports: true,
				evidence: true,
				notes: true,
				verdict: true,
				violationTypes: true,
				auditLogs: true,
			},
		})
	}

	async create(dto: CreateCaseDto) {
		const caseNumber = await this.caseNumberService.generate(dto.gameId)

		// Log the generated case number and the DTO for debugging
		console.log('Generated case number:', caseNumber)
		console.log('Creating case with DTO:', dto)

		return this.prisma.case.create({
			data: {
				caseNumber,
				title: dto.title,
				description: dto.description,
				status: dto.status ?? CaseStatus.OPEN,
				priority: dto.priority ?? CasePriority.MEDIUM,
				gameId: dto.gameId,
				openedById: dto.openedById,
				assignedToId: dto.assignedToId,
				metadata: dto.metadata,
				subjects: {
					connect: { id: dto.subjectId },
				},
			},
		})
	}

	update(id: string, data: UpdateCaseDto) {
		return this.prisma.case.update({
			where: { id },
			data,
			include: {
				game: true,
				assignedTo: true,
				openedBy: true,
			},
		})
	}

	remove(id: string) {
		return this.prisma.case.delete({
			where: { id },
		})
	}

	async getCaseById(id: string) {
		const caseRecord = await this.prisma.case.findUniqueOrThrow({
			where: { id },
			include: {
				game: true,
				openedBy: true,
				assignedTo: true,

				subjects: {
					include: { platform: true },
				},

				reports: {
					include: {
						reportedBy: true,
						integrationSource: true,
					},
					orderBy: { createdAt: 'asc' },
				},

				evidence: {
					include: {
						uploadedBy: true,
						attachments: true,
					},
					orderBy: { createdAt: 'asc' },
				},

				notes: {
					include: {
						author: true,
						attachments: true,
					},
					orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }],
				},

				verdict: {
					include: {
						sanctionTemplate: true,
						renderedBy: true,
					},
				},

				violationTypes: {
					include: {
						violationType: true,
					},
				},

				aiAnalyses: {
					orderBy: { createdAt: 'desc' },
					take: 1,
				},
			},
		})

		// Flatten join table
		const violationTypes = caseRecord.violationTypes.map((v) => v.violationType)
		const aiAnalysis = caseRecord.aiAnalyses?.[0] ?? null

		return {
			...caseRecord,
			violationTypes,
			aiAnalysis,
			aiAnalyses: undefined,
		}
	}

	async getCaseSubjects(caseId: string) {
		return this.prisma.subject.findMany({
			include: { platform: true },
		})
	}

	async getCaseReports(caseId: string) {
		return this.prisma.report.findMany({
			where: { caseId },
			include: {
				reportedBy: true,
				integrationSource: true,
			},
			orderBy: { createdAt: 'asc' },
		})
	}

	async getCaseEvidence(caseId: string) {
		return this.prisma.evidence.findMany({
			where: { caseId },
			include: {
				uploadedBy: true,
				attachments: true,
			},
			orderBy: { createdAt: 'asc' },
		})
	}

	async getCaseNotes(caseId: string) {
		return this.prisma.note.findMany({
			where: { caseId },
			include: {
				author: true,
				attachments: true,
			},
			orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }],
		})
	}

	async getCaseVerdict(caseId: string) {
		return this.prisma.verdict.findUnique({
			where: { caseId },
			include: {
				sanctionTemplate: true,
				renderedBy: true,
			},
		})
	}

	async listCases(query: CaseListQueryDto) {
		const {
			status,
			priority,
			assignedToId,
			openedFrom,
			openedTo,
			sortBy = 'openedAt',
			sortDir = 'desc',
			page = 1,
			pageSize = 20,
		} = query

		const where: any = {}

		if (status) where.status = status
		if (priority) where.priority = priority
		if (assignedToId) where.assignedToId = assignedToId

		if (openedFrom || openedTo) {
			where.openedAt = {}
			if (openedFrom) where.openedAt.gte = openedFrom
			if (openedTo) where.openedAt.lte = openedTo
		}

		const total = await this.prisma.case.count({ where })

		const data = await this.prisma.case.findMany({
			where,
			include: {
				openedBy: true,
				assignedTo: true,
			},
			orderBy: {
				[sortBy]: sortDir,
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
		})

		return {
			data,
			total,
			page,
			pageSize,
		}
	}

	async createNote(dto: CreateNoteDto) {
		const { caseId, authorId, body, visibility, isPinned } = dto

		// Ensure case exists
		await this.prisma.case.findUniqueOrThrow({
			where: { id: caseId },
		})

		// Ensure author exists
		await this.prisma.user.findUniqueOrThrow({
			where: { id: authorId },
		})

		const existingNotes = await this.prisma.note.count({ where: { caseId } })

		const note = await this.prisma.note.create({
			data: {
				caseId,
				authorId,
				body,
				visibility: visibility ?? 'INTERNAL',
				isPinned: existingNotes === 0 ? true : (isPinned ?? false), // Auto-pin if it's the first note
			},
			include: {
				author: true,
				attachments: true,
			},
		})

		return note
	}

	async softDeleteNote(id: string) {
		return this.prisma.note.update({
			where: { id },
			data: { deletedAt: new Date() },
		})
	}

	async createEvidence(dto: CreateEvidenceDto, files: Express.Multer.File[]) {
		const {
			caseId,
			uploadedById,
			title,
			description,
			evidenceType,
			metadata,
			capturedAt,
		} = dto

		if (!files || files.length === 0) {
			throw new BadRequestException('At least one file upload is required.')
		}

		// Ensure case exists
		await this.prisma.case.findUniqueOrThrow({
			where: { id: caseId },
		})

		// Ensure user exists
		await this.prisma.user.findUniqueOrThrow({
			where: { id: uploadedById },
		})

		// Upload files first and collect metadata
		let uploadedFileMetadata = []
		try {
			uploadedFileMetadata = await this.storage.uploadFiles(files, 'evidence')
		} catch (error) {
			throw new InternalServerErrorException(
				`File upload failed: ${error.message}`,
			)
		}

		// Create evidence and attachments in a transaction
		try {
			const evidence = await this.prisma.evidence.create({
				data: {
					caseId,
					uploadedById,
					title,
					description,
					evidenceType: evidenceType ?? 'OTHER',
					metadata,
					capturedAt: capturedAt ? new Date(capturedAt) : null,
					attachments: {
						createMany: {
							data: uploadedFileMetadata.map((fileData) => ({
								fileName: fileData.originalName,
								mimeType: fileData.mimeType,
								sizeBytes: fileData.size,
								storageKey: fileData.storageKey,
								storageUrl: fileData.storageUrl,
							})),
						},
					},
				},
				include: { attachments: true },
			})

			return evidence
		} catch (error) {
			// Rollback: Delete uploaded files on database transaction failure
			for (const fileData of uploadedFileMetadata) {
				try {
					await this.storage.deleteFile(fileData.storageKey)
				} catch (deleteError) {
					// Log but don't throw — we need to report the main error
					console.error(
						`Failed to clean up file ${fileData.storageKey}: ${deleteError.message}`,
					)
				}
			}
			throw new InternalServerErrorException(
				`Failed to create evidence: ${error.message}`,
			)
		}
	}

	async deleteEvidence(id: string): Promise<void> {
		// Get evidence with attachments to clean up files
		const evidence = await this.prisma.evidence.findUnique({
			where: { id },
			include: { attachments: true },
		})

		if (!evidence) {
			throw new BadRequestException(`Evidence with id ${id} not found`)
		}

		// Delete files from storage
		for (const attachment of evidence.attachments) {
			try {
				await this.storage.deleteFile(attachment.storageKey)
			} catch (error) {
				console.error(
					`Failed to delete file ${attachment.storageKey}: ${error.message}`,
				)
				// Continue deleting other files even if one fails
			}
		}

		// Delete evidence (cascades to attachments)
		await this.prisma.evidence.update({
			where: { id },
			data: { deletedAt: new Date() },
		})
	}

	// ──────────────────────────────────────
	// WORKFLOW: ASSIGNMENT METHODS
	// ──────────────────────────────────────

	async assignCase(
		caseId: string,
		assignToId: string,
		reason: string,
		changedBy: string,
	) {
		// Get previous assignment
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
			select: { assignedToId: true },
		})

		const previousAssigneeId = caseRecord?.assignedToId

		// Perform assignment
		const result = await this.assignmentService.assignCase(
			caseId,
			assignToId,
			reason,
			changedBy,
		)

		// Emit assignment event
		await this.eventEmitter.emit(
			new CaseAssignedEvent(caseId, assignToId, previousAssigneeId, changedBy),
		)

		return result
	}

	async getAssignmentHistory(caseId: string) {
		// Verify case exists
		const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } })
		if (!caseRecord) {
			throw new BadRequestException(`Case ${caseId} not found`)
		}

		return this.assignmentService.getAssignmentHistory(caseId)
	}

	async getUserWorkload(userId: string) {
		// Verify user exists
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new BadRequestException(`User ${userId} not found`)
		}

		return this.assignmentService.getUserWorkload(userId)
	}

	// ──────────────────────────────────────
	// WORKFLOW: STATUS TRANSITION METHODS
	// ──────────────────────────────────────

	async getValidStatusTransitions(caseId: string) {
		// Verify case exists
		const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } })
		if (!caseRecord) {
			throw new BadRequestException(`Case ${caseId} not found`)
		}

		return this.statusValidator.getValidNextStatuses(caseRecord.status)
	}

	async transitionStatus(
		caseId: string,
		newStatus: CaseStatus,
		reason: string,
		changedBy: string,
	) {
		// Get current status
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
			select: { status: true },
		})

		const previousStatus = caseRecord?.status

		// Perform status transition
		const result = await this.statusValidator.transitionStatus(
			caseId,
			newStatus,
			reason,
			changedBy,
		)

		// Emit status change event
		if (previousStatus) {
			await this.eventEmitter.emit(
				new CaseStatusChangedEvent(caseId, previousStatus, newStatus, changedBy, reason),
			)
		}

		return result
	}

	async getStatusHistory(caseId: string) {
		// Verify case exists
		const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } })
		if (!caseRecord) {
			throw new BadRequestException(`Case ${caseId} not found`)
		}

		return this.statusValidator.getStatusHistory(caseId)
	}
}
