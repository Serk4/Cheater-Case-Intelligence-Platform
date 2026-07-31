import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { AuditService } from './audit.service'

/**
 * Interceptor for automatic audit logging
 * Captures all HTTP requests and logs relevant operations
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
	constructor(private auditService: AuditService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest()
		const user = request.user
		const ip = this.getClientIp(request)
		const userAgent = request.get('user-agent')

		// Extract case ID from route params if available
		const caseId = request.params?.caseId

		// Only log to cases endpoints
		const isAuditableEndpoint = request.path.includes('/cases')

		if (!isAuditableEndpoint) {
			return next.handle()
		}

		const method = request.method
		const path = request.path
		const startTime = Date.now()

		return next.handle().pipe(
			tap((response) => {
				// Only log on successful operations (2xx)
				if (response && typeof response === 'object') {
					this.logOperation(
						method,
						path,
						caseId,
						user?.id,
						'SUCCESS',
						ip,
						userAgent,
						response,
						null,
					)
				}
			}),
			catchError((error) => {
				// Log errors too (4xx, 5xx)
				this.logOperation(
					method,
					path,
					caseId,
					user?.id,
					'ERROR',
					ip,
					userAgent,
					null,
					error,
				)
				return throwError(() => error)
			}),
		)
	}

	private getClientIp(request: any): string {
		const xForwardedFor = request.get('x-forwarded-for')
		if (xForwardedFor) {
			return xForwardedFor.split(',')[0].trim()
		}
		return request.ip || request.connection?.remoteAddress || 'unknown'
	}

	private async logOperation(
		method: string,
		path: string,
		caseId: string | undefined,
		userId: string | undefined,
		status: 'SUCCESS' | 'ERROR',
		ip: string,
		userAgent: string,
		response: any,
		error: any,
	): Promise<void> {
		try {
			// Determine action from method and path
			const action = this.determineAction(method, path)

			if (!action) {
				return // Don't log non-actionable endpoints
			}

			// Extract relevant data for audit log
			let before: Record<string, any> | undefined
			let after: Record<string, any> | undefined

			if (response) {
				after = this.extractRelevantFields(response)
			}

			// Log to audit trail
			if (caseId) {
				await this.auditService.log({
					caseId,
					actorId: userId || 'system',
					action: `${action}_${status}`,
					entityType: 'CASE',
					entityId: caseId,
					before,
					after,
					ipAddress: ip,
					userAgent,
				})
			}
		} catch (auditError) {
			// Silently fail audit logging to avoid breaking the request
			console.error('Audit logging failed:', auditError)
		}
	}

	private determineAction(method: string, path: string): string | null {
		// POST /cases/:id/assign
		if (method === 'POST' && path.includes('/assign')) {
			return 'ASSIGN_CASE'
		}

		// POST /cases/:id/transition
		if (method === 'POST' && path.includes('/transition')) {
			return 'TRANSITION_STATUS'
		}

		// POST /cases (create)
		if (method === 'POST' && path === '/cases') {
			return 'CREATE_CASE'
		}

		// PUT/PATCH /cases/:id (update)
		if (
			(method === 'PUT' || method === 'PATCH') &&
			path.match(/\/cases\/[^/]+$/)
		) {
			return 'UPDATE_CASE'
		}

		// POST /cases/:id/evidence (upload)
		if (method === 'POST' && path.includes('/evidence')) {
			return 'UPLOAD_EVIDENCE'
		}

		// DELETE /cases/:id/evidence/:evidenceId
		if (method === 'DELETE' && path.includes('/evidence')) {
			return 'DELETE_EVIDENCE'
		}

		// POST /cases/:id/notes
		if (method === 'POST' && path.includes('/notes')) {
			return 'CREATE_NOTE'
		}

		// DELETE /cases/:id/notes/:noteId
		if (method === 'DELETE' && path.includes('/notes')) {
			return 'DELETE_NOTE'
		}

		// POST /cases/:id/verdict
		if (method === 'POST' && path.includes('/verdict')) {
			return 'CREATE_VERDICT'
		}

		return null
	}

	private extractRelevantFields(data: any): Record<string, any> {
		if (!data) {
			return {}
		}

		// For case objects, extract key fields
		if (data.id) {
			return {
				id: data.id,
				status: data.status,
				assignedTo: data.assignedTo,
				verdict: data.verdict,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			}
		}

		return {}
	}
}
