import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [PrismaModule, MulterModule.register()],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],

})
export class CasesModule {}
