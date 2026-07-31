import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	)

	// Global Exception Filters
	app.useGlobalFilters(new AllExceptionsFilter())
	app.useGlobalFilters(new HttpExceptionFilter())

	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true,
	})

	// ✅ More reliable static files for development
	const uploadsPath = join(process.cwd(), 'uploads')
	app.useStaticAssets(uploadsPath, {
		prefix: '/uploads/',
	})

	// Swagger Documentation
	const config = new DocumentBuilder()
		.setTitle('CCIP - Cheater Case Intelligence Platform')
		.setDescription(
			'REST API for managing cheating reports, cases, and evidence analysis. ' +
				'This platform helps studios triage player-submitted cheating reports with structured ingestion, evidence analysis, ' +
				'cross-report correlation, confidence scoring, and reviewer workflows.',
		)
		.setVersion('1.0.0')
		.setContact(
			'CCIP Team',
			'https://github.com/Serk4/Cheater-Case-Intelligence-Platform',
			'support@ccip.dev',
		)
		.setLicense('MIT', 'https://opensource.org/licenses/MIT')
		.addServer('http://localhost:3000', 'Development')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'JWT token for authentication (not yet implemented)',
			},
			'jwt',
		)
		.addTag('Games', 'Game management endpoints')
		.addTag('Platforms', 'Platform management endpoints')
		.addTag('Cases', 'Case management and workflow endpoints')
		.addTag('Reports', 'Cheating report ingestion and management')
		.addTag('Evidence', 'Evidence and attachment management')
		.addTag('Subjects', 'Subject (player) management')
		.addTag('Users', 'User and reviewer management')
		.addTag('Verdicts', 'Case verdict management')
		.addTag('Notes', 'Case note and comment management')
		.addTag('Violation Types', 'Violation type configuration')
		.addTag('Sanction Templates', 'Sanction template management')
		.addTag('Integration Sources', 'Integration source configuration')
		.addTag('Audit Logs', 'Activity audit trail')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
			displayOperationId: true,
			filter: true,
			showRequestHeaders: true,
			tryItOutEnabled: true,
		},
		customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
    `,
		customSiteTitle: 'CCIP API Documentation',
	})

	await app.listen(3000)
	console.log(`🚀 CCIP Backend running on http://localhost:3000`)
	console.log(`📄 Swagger UI: http://localhost:3000/api`)
}

bootstrap()
