import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { CaseNumberService } from './case-number.service';

@Module({
  imports: [PrismaModule, MulterModule.register()],
  controllers: [CasesController],
  providers: [CasesService, CaseNumberService],
  exports: [CasesService, CaseNumberService],

})
export class CasesModule {}
