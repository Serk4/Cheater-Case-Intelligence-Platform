import { Module } from '@nestjs/common';
import { SanctionTemplatesService } from './sanction-templates.service';
import { SanctionTemplatesController } from './sanction-templates.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SanctionTemplatesController],
  providers: [SanctionTemplatesService],
})
export class SanctionTemplatesModule {}
