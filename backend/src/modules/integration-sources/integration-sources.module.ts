import { Module } from '@nestjs/common';
import { IntegrationSourcesService } from './integration-sources.service';
import { IntegrationSourcesController } from './integration-sources.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationSourcesController],
  providers: [IntegrationSourcesService],
})
export class IntegrationSourcesModule {}
