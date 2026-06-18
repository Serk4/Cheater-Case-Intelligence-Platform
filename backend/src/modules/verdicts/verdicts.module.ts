import { Module } from '@nestjs/common';
import { VerdictsService } from './verdicts.service';
import { VerdictsController } from './verdicts.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VerdictsController],
  providers: [VerdictsService],
})
export class VerdictsModule {}
