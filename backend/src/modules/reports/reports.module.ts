import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../../../prisma/prisma.module';

// TODO: import PrismaModule when available

@Module({
  controllers: [ReportsController],
  imports: [PrismaModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
