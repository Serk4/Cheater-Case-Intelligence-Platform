import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

// TODO: import external AI SDK module when available

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
