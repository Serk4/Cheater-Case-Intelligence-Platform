import { Module } from '@nestjs/common';
import { ViolationTypesService } from './violation-types.service';
import { ViolationTypesController } from './violation-types.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ViolationTypesController],
  providers: [ViolationTypesService],
})
export class ViolationTypesModule {}
