import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

interface ErrorResponse {
	statusCode: number
	timestamp: string
	path: string
	method: string
	message: string | string[] | object
	error?: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger('HttpException')

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()
		const exceptionResponse = exception.getResponse()

		let message: string | string[] | object = exception.message
		if (
			typeof exceptionResponse === 'object' &&
			'message' in exceptionResponse
		) {
			message = exceptionResponse['message'] as string | string[] | object
		}

		const errorResponse: ErrorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			message: message,
		}

		if (status === HttpStatus.BAD_REQUEST) {
			errorResponse.error = 'Bad Request'
		} else if (status === HttpStatus.NOT_FOUND) {
			errorResponse.error = 'Not Found'
		} else if (status === HttpStatus.UNAUTHORIZED) {
			errorResponse.error = 'Unauthorized'
		} else if (status === HttpStatus.FORBIDDEN) {
			errorResponse.error = 'Forbidden'
		} else if (status === HttpStatus.CONFLICT) {
			errorResponse.error = 'Conflict'
		}

		this.logger.error(
			`${request.method} ${request.url}`,
			JSON.stringify(errorResponse),
		)

		response.status(status).json(errorResponse)
	}
}
