import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { Case, CaseStatus } from '@prisma/client'

export interface ValidationResult {
	isValid: boolean
	errors: string[]
}

@Injectable()
export class CaseStatusValidator {
	constructor(private prisma: PrismaService) {}

	/**
	 * Define valid state transitions
	 */
	private validTransitions: Record<CaseStatus, CaseStatus[]> = {
		OPEN: [CaseStatus.UNDER_REVIEW, CaseStatus.DISMISSED],
		UNDER_REVIEW: [
			CaseStatus.PENDING_EVIDENCE,
			CaseStatus.ESCALATED,
			CaseStatus.CLOSED,
			CaseStatus.DISMISSED,
		],
		PENDING_EVIDENCE: [
			CaseStatus.UNDER_REVIEW,
			CaseStatus.CLOSED,
			CaseStatus.DISMISSED,
		],
		ESCALATED: [CaseStatus.CLOSED, CaseStatus.DISMISSED],
		CLOSED: [],
		DISMISSED: [],
	}

	/**
	 * Check if a status transition is valid
	 */
	isValidTransition(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
		return this.validTransitions[fromStatus]?.includes(toStatus) ?? false
	}

	/**
	 * Get all valid next statuses for a given status
	 */
	getValidNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
		return this.validTransitions[currentStatus] || []
	}

	/**
	 * Validate prerequisites for a status transition
	 */
	async validatePrerequisites(
		caseId: string,
		newStatus: CaseStatus,
	): Promise<ValidationResult> {
		const errors: string[] = []
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
		})

		if (!caseRecord) {
			return { isValid: false, errors: [`Case ${caseId} not found`] }
		}

		// OPEN → UNDER_REVIEW: requires assignment
		if (newStatus === CaseStatus.UNDER_REVIEW && !caseRecord.assignedToId) {
			errors.push(
				'Cannot transition to UNDER_REVIEW without assigning to an analyst',
			)
		}

		// UNDER_REVIEW → ESCALATED: should have audit note (optional, warn only)
		if (
			caseRecord.status === CaseStatus.UNDER_REVIEW &&
			newStatus === CaseStatus.ESCALATED
		) {
			const noteCount = await this.prisma.note.count({ where: { caseId } })
			if (noteCount === 0) {
				errors.push(
					'Escalation recommended to have at least one audit note explaining the escalation reason',
				)
			}
		}

		// CLOSED: requires verdict
		if (newStatus === CaseStatus.CLOSED) {
			const verdict = await this.prisma.verdict.findUnique({
				where: { caseId },
			})
			if (!verdict) {
				errors.push('Cannot close case without a verdict')
			}
		}

		// DISMISSED: should have reasoning in notes
		if (newStatus === CaseStatus.DISMISSED) {
			const notes = await this.prisma.note.findMany({
				where: { caseId },
			})
			if (notes.length === 0) {
				errors.push(
					'Cannot dismiss case without documented reasoning in case notes',
				)
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		}
	}

	/**
	 * Perform a status transition with full validation
	 */
	async transitionStatus(
		caseId: string,
		newStatus: CaseStatus,
		reason: string,
		changedBy: string,
	): Promise<Case> {
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
		})
		if (!caseRecord) {
			throw new NotFoundException(`Case ${caseId} not found`)
		}

		const fromStatus = caseRecord.status

		// Validate transition is allowed
		if (!this.isValidTransition(fromStatus, newStatus)) {
			const validOptions = this.getValidNextStatuses(fromStatus)
			throw new BadRequestException(
				`Invalid status transition: ${fromStatus} → ${newStatus}. Valid options: ${validOptions.join(', ')}`,
			)
		}

		// Validate prerequisites
		const validation = await this.validatePrerequisites(caseId, newStatus)
		if (!validation.isValid) {
			throw new BadRequestException(
				`Cannot transition to ${newStatus}: ${validation.errors.join('; ')}`,
			)
		}

		// Validate changedBy user exists
		const changedByUser = await this.prisma.user.findUnique({
			where: { id: changedBy },
		})
		if (!changedByUser) {
			throw new NotFoundException(`User ${changedBy} not found`)
		}

		// Apply transition
		const updatedCase = await this.prisma.case.update({
			where: { id: caseId },
			data: {
				status: newStatus,
				...(newStatus === CaseStatus.CLOSED && { closedAt: new Date() }),
			},
		})

		// Log the transition
		await this.prisma.statusTransitionLog.create({
			data: {
				caseId,
				fromStatus,
				toStatus: newStatus,
				reason,
				validationMeta: JSON.parse(
					JSON.stringify({
						prerequisites: validation,
						appliedAt: new Date().toISOString(),
					}),
				) as any,
				changedById: changedBy,
			},
		})

		return updatedCase
	}

	/**
	 * Get status transition history for a case
	 */
	async getStatusHistory(caseId: string) {
		return this.prisma.statusTransitionLog.findMany({
			where: { caseId },
			include: { changedBy: true },
			orderBy: { changedAt: 'desc' },
		})
	}
}
