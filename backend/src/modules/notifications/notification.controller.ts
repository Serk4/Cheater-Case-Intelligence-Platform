import {
	Controller,
	Get,
	Patch,
	Delete,
	Param,
	Query,
	HttpCode,
	HttpStatus,
	UseGuards,
	Req,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger'
import { NotificationService } from './notification.service'

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
	constructor(private notificationService: NotificationService) {}

	/**
	 * Get user notifications
	 */
	@Get()
	@ApiOperation({ summary: 'Get user notifications' })
	@ApiResponse({
		status: 200,
		description: 'Notifications retrieved successfully',
		schema: {
			properties: {
				notifications: { type: 'array' },
				total: { type: 'number' },
				unreadCount: { type: 'number' },
			},
		},
	})
	async getUserNotifications(
		@Req() req: any,
		@Query('limit') limit?: number,
		@Query('offset') offset?: number,
		@Query('read') read?: string,
	) {
		const userId = req.user?.id
		if (!userId) {
			return { notifications: [], total: 0, unreadCount: 0 }
		}

		// Parse read query param (comes as string from query)
		const readFilter =
			read !== undefined ? read === 'true' : undefined

		return this.notificationService.getUserNotifications(userId, {
			limit,
			offset,
			read: readFilter,
		})
	}

	/**
	 * Get single notification
	 */
	@Get(':notificationId')
	@ApiOperation({ summary: 'Get a single notification' })
	@ApiResponse({ status: 200, description: 'Notification retrieved' })
	@ApiResponse({ status: 404, description: 'Notification not found' })
	async getNotification(@Param('notificationId') notificationId: string) {
		return this.notificationService.getNotification(notificationId)
	}

	/**
	 * Mark notification as read
	 */
	@Patch(':notificationId/read')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Mark notification as read' })
	@ApiResponse({ status: 200, description: 'Notification marked as read' })
	async markAsRead(@Param('notificationId') notificationId: string) {
		return this.notificationService.markAsRead(notificationId)
	}

	/**
	 * Mark all notifications as read
	 */
	@Patch('read-all')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Mark all notifications as read' })
	@ApiResponse({
		status: 200,
		description: 'All notifications marked as read',
	})
	async markAllAsRead(@Req() req: any) {
		const userId = req.user?.id
		if (!userId) {
			return { count: 0 }
		}

		return this.notificationService.markAllAsRead(userId)
	}

	/**
	 * Delete notification
	 */
	@Delete(':notificationId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a notification' })
	@ApiResponse({ status: 204, description: 'Notification deleted' })
	async deleteNotification(@Param('notificationId') notificationId: string) {
		await this.notificationService.deleteNotification(notificationId)
	}

	/**
	 * Delete all notifications for user
	 */
	@Delete()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete all notifications' })
	@ApiResponse({ status: 200, description: 'All notifications deleted' })
	async deleteAllNotifications(@Req() req: any) {
		const userId = req.user?.id
		if (!userId) {
			return { count: 0 }
		}

		return this.notificationService.deleteAllNotifications(userId)
	}

	/**
	 * Get notification statistics
	 */
	@Get('stats')
	@ApiOperation({ summary: 'Get notification statistics' })
	@ApiResponse({ status: 200, description: 'Statistics retrieved' })
	async getStats(@Req() req: any) {
		const userId = req.user?.id
		if (!userId) {
			return { total: 0, unread: 0, byType: {}, recentActivity: [] }
		}

		return this.notificationService.getNotificationStats(userId)
	}
}
