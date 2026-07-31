import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Auth, CurrentUser } from '../auth';

@Controller()
@ApiTags('AI')
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /** Runtime feature flag — consumed by the frontend to show/hide AI features. */
  @Get('config')
  @HttpCode(200)
  getConfig() {
    return { aiEnabled: this.aiService.isEnabled };
  }

  /** Trigger an AI analysis run for a case. */
  @Post('ai/analyze/case/:caseId')
  @Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')
  @ApiOperation({ summary: 'Run AI triage analysis on a case' })
  async analyzeCase(@Param('caseId') caseId: string) {
    return this.aiService.analyzeCase(caseId);
  }

  /** Get the latest analysis result for a case. */
  @Get('ai/analysis/case/:caseId')
  @Auth('VIEWER', 'ANALYST', 'SENIOR_ANALYST', 'ADMIN')
  @ApiOperation({ summary: 'Get latest AI analysis for a case' })
  async getAnalysis(@Param('caseId') caseId: string) {
    return this.aiService.getLatestAnalysis(caseId);
  }

  /** Submit reviewer feedback on an AI analysis. */
  @Post('ai/feedback/:analysisId')
  @Auth('ANALYST', 'SENIOR_ANALYST', 'ADMIN')
  @ApiOperation({ summary: 'Submit reviewer feedback on AI analysis' })
  async submitFeedback(
    @Param('analysisId') analysisId: string,
    @Body() body: { decision: 'ACCEPTED' | 'MODIFIED' | 'REJECTED'; note?: string },
    @CurrentUser() user: any,
  ) {
    return this.aiService.recordFeedback(analysisId, body.decision, body.note, user?.id);
  }
}
