import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditLog } from '@prisma/client'

export interface AuditContext {
	actorId?: string
	caseId?: string
	action: string
	entityType: string
	entityId: string
	before?: Record<string, any>
	after?: Record<string, any>
	ipAddress?: string
	userAgent?: string
	changesSummary?: string
}

@Injectable()
export class AuditService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Log an action to the audit trail
	 */
	async log(context: AuditContext): Promise<AuditLog> {
		return this.prisma.auditLog.create({
			data: {
				actorId: context.actorId,
				caseId: context.caseId,
				action: context.action,
				entityType: context.entityType,
				entityId: context.entityId,
				before: context.before ? (context.before as any) : null,
				after: context.after ? (context.after as any) : null,
				ipAddress: context.ipAddress,
				userAgent: context.userAgent,
			},
		})
	}

	/**
	 * Log a case-related event with optional before/after states
	 */
	async logCaseEvent(
		caseId: string,
		action: string,
		entityType: string,
		entityId: string,
		actor: string,
		before?: Record<string, any>,
		after?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
	): Promise<AuditLog> {
		return this.log({
			caseId,
			action,
			entityType,
			entityId,
			actorId: actor,
			before,
			after,
			ipAddress,
			userAgent,
		})
	}

	/**
	 * Get complete audit trail for a case
	 */
	async getCaseAuditTrail(caseId: string): Promise<AuditLog[]> {
		return this.prisma.auditLog.findMany({
			where: { caseId },
			include: { actor: true },
			orderBy: { createdAt: 'desc' },
		})
	}

	/**
	 * Get audit logs for an entity (case, evidence, note, verdict)
	 */
	async getEntityAuditTrail(
		entityType: string,
		entityId: string,
	): Promise<AuditLog[]> {
		return this.prisma.auditLog.findMany({
			where: { entityType, entityId },
			include: { actor: true },
			orderBy: { createdAt: 'desc' },
		})
	}

	/**
	 * Get audit logs for a specific actor
	 */
	async getActorAuditTrail(actorId: string): Promise<AuditLog[]> {
		return this.prisma.auditLog.findMany({
			where: { actorId },
			include: { actor: true, case: true },
			orderBy: { createdAt: 'desc' },
			take: 100, // Limit to last 100
		})
	}

	/**
	 * Search audit logs with filters
	 */
	async searchAuditLogs(filters: {
		action?: string
		entityType?: string
		actorId?: string
		caseId?: string
		startDate?: Date
		endDate?: Date
		limit?: number
	}): Promise<AuditLog[]> {
		return this.prisma.auditLog.findMany({
			where: {
				...(filters.action && { action: filters.action }),
				...(filters.entityType && { entityType: filters.entityType }),
				...(filters.actorId && { actorId: filters.actorId }),
				...(filters.caseId && { caseId: filters.caseId }),
				...(filters.startDate && {
					createdAt: { gte: filters.startDate },
				}),
				...(filters.endDate && {
					createdAt: { lte: filters.endDate },
				}),
			},
			include: { actor: true, case: true },
			orderBy: { createdAt: 'desc' },
			take: filters.limit || 100,
		})
	}

	/**
	 * Get audit summary for a case
	 */
	async getCaseAuditSummary(caseId: string): Promise<{
		totalEvents: number
		byAction: Record<string, number>
		byActor: Record<string, number>
		lastChange: AuditLog | null
	}> {
		const logs = await this.getCaseAuditTrail(caseId)

		const byAction: Record<string, number> = {}
		const byActor: Record<string, number> = {}

		for (const log of logs) {
			byAction[log.action] = (byAction[log.action] || 0) + 1
			const actorName = log.actorId || 'System'
			byActor[actorName] = (byActor[actorName] || 0) + 1
		}

		return {
			totalEvents: logs.length,
			byAction,
			byActor,
			lastChange: logs[0] || null,
		}
	}
}
