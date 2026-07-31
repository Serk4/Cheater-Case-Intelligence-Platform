import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [ReportsController],
  imports: [PrismaModule, AiModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
