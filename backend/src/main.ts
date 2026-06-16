import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TODO: add global pipes, interceptors, CORS config
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`CCIP backend running on port ${port}`);
}

bootstrap();
