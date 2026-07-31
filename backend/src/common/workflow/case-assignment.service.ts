import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { Case, CaseAssignment, UserRole } from '@prisma/client'
import {
	WorkflowRulesService,
	RuleConditionContext,
} from './workflow-rules.service'

@Injectable()
export class CaseAssignmentService {
	constructor(
		private prisma: PrismaService,
		private workflowRulesService: WorkflowRulesService,
	) {}

	/**
	 * Check if a user can be assigned cases based on their role and status
	 */
	async canAssign(userId: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })

		if (!user || !user.isActive) return false

		// Only ANALYST, SENIOR_ANALYST, and ADMIN can be assigned
		const assignableRoles = ['ANALYST', 'SENIOR_ANALYST', 'ADMIN']
		return assignableRoles.includes(user.role)
	}

	/**
	 * Assign a case to a user manually
	 */
	async assignCase(
		caseId: string,
		userId: string,
		reason: string,
		changedBy: string,
	): Promise<Case> {
		// Validate case exists
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
		})
		if (!caseRecord) {
			throw new NotFoundException(`Case ${caseId} not found`)
		}

		// Validate user can be assigned
		const canAssign = await this.canAssign(userId)
		if (!canAssign) {
			throw new BadRequestException(
				`User ${userId} cannot be assigned cases (must be ANALYST or higher)`,
			)
		}

		// Validate changedBy user exists
		const changedByUser = await this.prisma.user.findUnique({
			where: { id: changedBy },
		})
		if (!changedByUser) {
			throw new NotFoundException(`User ${changedBy} not found`)
		}

		const previousUserId = caseRecord.assignedToId

		// Update case and record assignment
		const updatedCase = await this.prisma.case.update({
			where: { id: caseId },
			data: { assignedToId: userId },
		})

		// Log the assignment change
		await this.prisma.caseAssignment.create({
			data: {
				caseId,
				previousUserId,
				newUserId: userId,
				reason,
				changedById: changedBy,
			},
		})

		return updatedCase
	}

	/**
	 * Auto-assign a case based on workflow rules
	 */
	async autoAssignCase(caseId: string, changedBy: string): Promise<Case> {
		const caseRecord = await this.prisma.case.findUnique({
			where: { id: caseId },
			include: {
				violationTypes: true,
			},
		})

		if (!caseRecord) {
			throw new NotFoundException(`Case ${caseId} not found`)
		}

		// Build rule evaluation context
		const context: RuleConditionContext = {
			caseId,
			priority: caseRecord.priority,
			status: caseRecord.status,
			assignedToId: caseRecord.assignedToId,
			violationTypeCount: caseRecord.violationTypes.length,
			metadata: caseRecord.metadata as Record<string, any>,
		}

		// Execute AutoAssign rules
		const results = await this.workflowRulesService.executeRules(
			'AutoAssign',
			context,
			caseRecord.gameId,
		)

		// Find first matching rule
		const matchedRule = results.find((r) => r.matched)
		if (!matchedRule) {
			// No auto-assignment rule matched
			return caseRecord
		}

		// Extract action from matched rule
		const actions = matchedRule.rule.actions as Record<string, any>
		if (actions.type === 'AssignToRole') {
			// Find a user with the required role
			const assignee = await this.prisma.user.findFirst({
				where: {
					role: actions.role,
					isActive: true,
				},
			})

			if (assignee) {
				return this.assignCase(
					caseId,
					assignee.id,
					'auto_assign_rule',
					changedBy,
				)
			}
		}

		// If no matching action found, return unchanged case
		return caseRecord
	}

	/**
	 * Get assignment history for a case
	 */
	async getAssignmentHistory(caseId: string): Promise<CaseAssignment[]> {
		return this.prisma.caseAssignment.findMany({
			where: { caseId },
			include: {
				previousUser: true,
				newUser: true,
				changedBy: true,
			},
			orderBy: { changedAt: 'desc' },
		})
	}

	/**
	 * Get current workload for a user
	 */
	async getUserWorkload(
		userId: string,
	): Promise<{ assigned: number; inProgress: number }> {
		const assigned = await this.prisma.case.count({
			where: { assignedToId: userId },
		})

		const inProgress = await this.prisma.case.count({
			where: {
				assignedToId: userId,
				status: 'UNDER_REVIEW',
			},
		})

		return { assigned, inProgress }
	}

	/**
	 * Get all users available for assignment
	 */
	async getAvailableAssignees(): Promise<
		Array<{
			id: string
			email: string
			displayName: string
			role: UserRole
			workload: { assigned: number; inProgress: number }
		}>
	> {
		const users = await this.prisma.user.findMany({
			where: {
				role: {
					in: [UserRole.ANALYST, UserRole.SENIOR_ANALYST, UserRole.ADMIN],
				},
				isActive: true,
			},
		})

		const result = await Promise.all(
			users.map(async (user) => ({
				id: user.id,
				email: user.email,
				displayName: user.displayName,
				role: user.role,
				workload: await this.getUserWorkload(user.id),
			})),
		)

		// Sort by workload (ascending)
		return result.sort((a, b) => a.workload.assigned - b.workload.assigned)
	}
}
