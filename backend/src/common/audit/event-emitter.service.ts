import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from 'eventemitter2'

/**
 * Domain event types
 */
export enum DomainEventType {
	CASE_CREATED = 'case.created',
	CASE_UPDATED = 'case.updated',
	CASE_ASSIGNED = 'case.assigned',
	CASE_STATUS_CHANGED = 'case.status.changed',
	CASE_CLOSED = 'case.closed',
	EVIDENCE_UPLOADED = 'evidence.uploaded',
	EVIDENCE_DELETED = 'evidence.deleted',
	NOTE_CREATED = 'note.created',
	NOTE_DELETED = 'note.deleted',
	VERDICT_CREATED = 'verdict.created',
}

/**
 * Base domain event
 */
export abstract class DomainEvent {
	eventType: DomainEventType
	occurredAt: Date
	aggregateId: string // Entity ID (caseId, evidenceId, etc.)

	constructor(eventType: DomainEventType, aggregateId: string) {
		this.eventType = eventType
		this.aggregateId = aggregateId
		this.occurredAt = new Date()
	}
}

/**
 * Case assignment event
 */
export class CaseAssignedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public newAssigneeId: string,
		public previousAssigneeId?: string,
		public assignedBy?: string,
	) {
		super(DomainEventType.CASE_ASSIGNED, caseId)
	}
}

/**
 * Case status change event
 */
export class CaseStatusChangedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public fromStatus: string,
		public toStatus: string,
		public changedBy?: string,
		public reason?: string,
	) {
		super(DomainEventType.CASE_STATUS_CHANGED, caseId)
	}
}

/**
 * Case created event
 */
export class CaseCreatedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public gameId: string,
		public userId: string,
	) {
		super(DomainEventType.CASE_CREATED, caseId)
	}
}

/**
 * Evidence uploaded event
 */
export class EvidenceUploadedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public evidenceId: string,
		public fileName: string,
		public uploadedBy: string,
	) {
		super(DomainEventType.EVIDENCE_UPLOADED, evidenceId)
	}
}

/**
 * Evidence deleted event
 */
export class EvidenceDeletedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public evidenceId: string,
		public deletedBy: string,
	) {
		super(DomainEventType.EVIDENCE_DELETED, evidenceId)
	}
}

/**
 * Note created event
 */
export class NoteCreatedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public noteId: string,
		public createdBy: string,
		public content?: string,
	) {
		super(DomainEventType.NOTE_CREATED, noteId)
	}
}

/**
 * Note deleted event
 */
export class NoteDeletedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public noteId: string,
		public deletedBy: string,
	) {
		super(DomainEventType.NOTE_DELETED, noteId)
	}
}

/**
 * Verdict created event
 */
export class VerdictCreatedEvent extends DomainEvent {
	constructor(
		public caseId: string,
		public verdictId: string,
		public verdict: string,
		public createdBy: string,
	) {
		super(DomainEventType.VERDICT_CREATED, verdictId)
	}
}

/**
 * Domain event emitter service
 * Enables event-driven architecture for case management
 */
@Injectable()
export class EventEmitterService {
	private eventEmitter: EventEmitter2

	constructor() {
		this.eventEmitter = new EventEmitter2({
			wildcard: false,
			maxListeners: 20,
			newListener: false,
		})
	}

	/**
	 * Emit a domain event
	 */
	async emit(event: DomainEvent): Promise<void> {
		this.eventEmitter.emit(event.eventType, event)
	}

	/**
	 * Subscribe to case assignment events
	 */
	onCaseAssigned(handler: (event: CaseAssignedEvent) => Promise<void>): void {
		this.eventEmitter.on(DomainEventType.CASE_ASSIGNED, handler)
	}

	/**
	 * Subscribe to case status change events
	 */
	onCaseStatusChanged(
		handler: (event: CaseStatusChangedEvent) => Promise<void>,
	): void {
		this.eventEmitter.on(DomainEventType.CASE_STATUS_CHANGED, handler)
	}

	/**
	 * Subscribe to case created events
	 */
	onCaseCreated(handler: (event: CaseCreatedEvent) => Promise<void>): void {
		this.eventEmitter.on(DomainEventType.CASE_CREATED, handler)
	}

	/**
	 * Subscribe to evidence uploaded events
	 */
	onEvidenceUploaded(
		handler: (event: EvidenceUploadedEvent) => Promise<void>,
	): void {
		this.eventEmitter.on(DomainEventType.EVIDENCE_UPLOADED, handler)
	}

	/**
	 * Subscribe to evidence deleted events
	 */
	onEvidenceDeleted(
		handler: (event: EvidenceDeletedEvent) => Promise<void>,
	): void {
		this.eventEmitter.on(DomainEventType.EVIDENCE_DELETED, handler)
	}

	/**
	 * Subscribe to note created events
	 */
	onNoteCreated(handler: (event: NoteCreatedEvent) => Promise<void>): void {
		this.eventEmitter.on(DomainEventType.NOTE_CREATED, handler)
	}

	/**
	 * Subscribe to note deleted events
	 */
	onNoteDeleted(handler: (event: NoteDeletedEvent) => Promise<void>): void {
		this.eventEmitter.on(DomainEventType.NOTE_DELETED, handler)
	}

	/**
	 * Subscribe to verdict created events
	 */
	onVerdictCreated(
		handler: (event: VerdictCreatedEvent) => Promise<void>,
	): void {
		this.eventEmitter.on(DomainEventType.VERDICT_CREATED, handler)
	}

	/**
	 * Remove event listener
	 */
	removeListener(
		eventType: DomainEventType,
		handler: (event: DomainEvent) => Promise<void>,
	): void {
		this.eventEmitter.removeListener(eventType, handler)
	}
}
