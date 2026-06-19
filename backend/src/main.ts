import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // you explicitly want this for file uploads
  });

  // Restore JSON parsing (since bodyParser: false disables it)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ⭐ Serve uploaded files
  // This exposes: http://localhost:3000/uploads/<filename>
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });


  // ⭐ Global validation (DTOs, pipes)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strips unknown fields
      forbidNonWhitelisted: false,
      transform: true,          // auto-transform payloads to DTO classes
    }),
  );

  // ⭐ CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`CCIP backend running on port ${port}`);
}

bootstrap();
