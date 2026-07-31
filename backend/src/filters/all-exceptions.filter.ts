import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

interface ErrorResponse {
	statusCode: number
	timestamp: string
	path: string
	method: string
	message: string
	error: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger('AllExceptions')

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const status = HttpStatus.INTERNAL_SERVER_ERROR
		let message = 'Internal server error'

		if (exception instanceof Error) {
			message = exception.message
			this.logger.error(`${request.method} ${request.url}`, exception.stack)
		} else {
			this.logger.error(
				`${request.method} ${request.url}`,
				JSON.stringify(exception),
			)
		}

		const errorResponse: ErrorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			message,
			error: 'Internal Server Error',
		}

		response.status(status).json(errorResponse)
	}
}
