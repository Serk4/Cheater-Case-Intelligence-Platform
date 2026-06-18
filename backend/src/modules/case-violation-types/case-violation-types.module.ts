import { Module } from '@nestjs/common';
import { CaseViolationTypesService } from './case-violation-types.service';
import { CaseViolationTypesController } from './case-violation-types.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CaseViolationTypesController],
  providers: [CaseViolationTypesService],
})
export class CaseViolationTypesModule {}
