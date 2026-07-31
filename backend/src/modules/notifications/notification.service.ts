import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { EventEmitterService } from '../../common/audit/event-emitter.service'
import {
  CaseAssignedEvent,
  CaseStatusChangedEvent,
  NoteCreatedEvent,
  VerdictCreatedEvent,
} from '../../common/audit/event-emitter.service'

export enum NotificationType {
  CASE_ASSIGNED = 'CASE_ASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  NOTE_ADDED = 'NOTE_ADDED',
  VERDICT_READY = 'VERDICT_READY',
  ESCALATION = 'ESCALATION',
  ASSIGNMENT_CHANGED = 'ASSIGNMENT_CHANGED',
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
  ) {
    this.setupEventListeners()
  }

  /**
   * Set up event listeners for automatic notification creation
   */
  private setupEventListeners(): void {
    // Listen for case assignment events
    this.eventEmitter.onCaseAssigned(async (event: CaseAssignedEvent) => {
      await this.handleCaseAssignment(event)
    })

    // Listen for status change events
    this.eventEmitter.onCaseStatusChanged(
      async (event: CaseStatusChangedEvent) => {
        await this.handleStatusChange(event)
      },
    )

    // Listen for note creation events
    this.eventEmitter.onNoteCreated(async (event: NoteCreatedEvent) => {
      await this.handleNoteCreated(event)
    })

    // Listen for verdict creation events
    this.eventEmitter.onVerdictCreated(async (event: VerdictCreatedEvent) => {
      await this.handleVerdictCreated(event)
    })
  }

  /**
   * Handle case assignment event
   */
  private async handleCaseAssignment(event: CaseAssignedEvent): Promise<void> {
    try {
      // Notify new assignee
      await this.createNotification({
        userId: event.newAssigneeId,
        type: NotificationType.CASE_ASSIGNED,
        title: 'Case Assigned to You',
        message: 'You have been assigned a new case.',
        caseId: event.caseId,
        data: {
          previousAssignee: event.previousAssigneeId,
          assignedBy: event.assignedBy,
        },
      })

      // Notify previous assignee if there was one
      if (event.previousAssigneeId) {
        await this.createNotification({
          userId: event.previousAssigneeId,
          type: NotificationType.ASSIGNMENT_CHANGED,
          title: 'Case Assignment Changed',
          message: 'A case has been reassigned from you.',
          caseId: event.caseId,
          data: {
            newAssignee: event.newAssigneeId,
            changedBy: event.assignedBy,
          },
        })
      }
    } catch (error) {
      console.error('Error handling case assignment notification:', error)
    }
  }

  /**
   * Handle status change event
   */
  private async handleStatusChange(event: CaseStatusChangedEvent): Promise<void> {
    try {
      // Get the case to find who's assigned
      const caseEntity = await this.prisma.case.findUnique({
        where: { id: event.caseId },
        select: { assignedToId: true },
      })

      if (caseEntity?.assignedToId) {
        await this.createNotification({
          userId: caseEntity.assignedToId,
          type: NotificationType.STATUS_CHANGED,
          title: 'Case Status Updated',
          message: `Case status changed from ${event.fromStatus} to ${event.toStatus}.`,
          caseId: event.caseId,
          data: {
            fromStatus: event.fromStatus,
            toStatus: event.toStatus,
            reason: event.reason,
          },
        })
      }
    } catch (error) {
      console.error('Error handling status change notification:', error)
    }
  }

  /**
   * Handle note creation event
   */
  private async handleNoteCreated(event: NoteCreatedEvent): Promise<void> {
    try {
      // Get the case to find who's assigned
      const caseEntity = await this.prisma.case.findUnique({
        where: { id: event.caseId },
        select: { assignedToId: true },
      })

      if (caseEntity?.assignedToId && caseEntity.assignedToId !== event.createdBy) {
        await this.createNotification({
          userId: caseEntity.assignedToId,
          type: NotificationType.NOTE_ADDED,
          title: 'New Note on Your Case',
          message: 'A new note has been added to your assigned case.',
          caseId: event.caseId,
          resourceId: event.noteId,
          data: {
            notePreview: event.content?.substring(0, 100) || 'Note added',
          },
        })
      }
    } catch (error) {
      console.error('Error handling note creation notification:', error)
    }
  }

  /**
   * Handle verdict creation event
   */
  private async handleVerdictCreated(event: VerdictCreatedEvent): Promise<void> {
    try {
      // Get the case to find who's assigned
      const caseEntity = await this.prisma.case.findUnique({
        where: { id: event.caseId },
        select: { assignedToId: true },
      })

      if (caseEntity?.assignedToId) {
        await this.createNotification({
          userId: caseEntity.assignedToId,
          type: NotificationType.VERDICT_READY,
          title: 'Verdict Added to Your Case',
          message: `A verdict has been added to your assigned case: ${event.verdict}.`,
          caseId: event.caseId,
          resourceId: event.verdictId,
          data: {
            verdict: event.verdict,
            verdictBy: event.createdBy,
          },
        })
      }
    } catch (error) {
      console.error('Error handling verdict creation notification:', error)
    }
  }

  /**
   * Create a notification
   */
  async createNotification(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    caseId?: string
    resourceId?: string
    data?: Record<string, any>
  }): Promise<any> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        caseId: data.caseId,
        resourceId: data.resourceId,
        data: data.data as any,
        read: false,
      },
    })
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      read?: boolean
    } = {},
  ): Promise<{
    notifications: any[]
    total: number
    unreadCount: number
  }> {
    const limit = options.limit || 20
    const offset = options.offset || 0

    const where: any = { userId }
    if (typeof options.read === 'boolean') {
      where.read = options.read
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { case: { select: { id: true, gameId: true, status: true } } },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, read: false } }),
    ])

    return {
      notifications,
      total,
      unreadCount,
    }
  }

  /**
   * Get single notification
   */
  async getNotification(notificationId: string): Promise<any> {
    return this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { case: { select: { id: true, gameId: true, status: true } } },
    })
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<any> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    })
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return { count: result.count }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    })

    return { count: result.count }
  }

  /**
   * Get notification statistics for user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
    recentActivity: any[]
  }> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const byType: Record<string, number> = {}
    let unread = 0

    for (const notif of notifications) {
      byType[notif.type] = (byType[notif.type] || 0) + 1
      if (!notif.read) {
        unread++
      }
    }

    return {
      total: notifications.length,
      unread,
      byType,
      recentActivity: notifications.slice(0, 10),
    }
  }
}
