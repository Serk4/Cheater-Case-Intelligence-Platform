import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import OpenAI from 'openai';

export interface AiTriageResult {
  summary: string;
  confidence: number;
  suggestedViolationType: string | null;
  suggestedPriority: string | null;
  rawResponse: any;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI | null;
  private readonly model: string;

  get isEnabled(): boolean {
    return process.env.AI_ENABLED === 'true' && !!process.env.OPENAI_API_KEY;
  }

  constructor(private readonly prisma: PrismaService) {
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
      this.openai = null;
    }
  }

  /**
   * Analyze a case for auto-triage.
   * Reads the case with its reports and evidence from the database,
   * calls the AI provider (if enabled), persists the result, and returns it.
   */
  async analyzeCase(caseId: string) {
    const caseRecord = await this.prisma.case.findUniqueOrThrow({
      where: { id: caseId },
      include: {
        reports: { include: { reportedBy: true } },
        evidence: true,
        subjects: { include: { platform: true } },
        violationTypes: { include: { violationType: true } },
      },
    });

    let result: AiTriageResult;

    if (this.isEnabled && this.openai) {
      result = await this.runOpenAiAnalysis(caseRecord);
    } else {
      result = this.buildStubResult(caseRecord);
    }

    // Persist the analysis
    const analysis = await this.prisma.aiAnalysis.create({
      data: {
        caseId,
        summary: result.summary,
        confidence: result.confidence,
        suggestedViolationType: result.suggestedViolationType,
        suggestedPriority: result.suggestedPriority,
        rawResponse: result.rawResponse ?? undefined,
      },
    });

    return analysis;
  }

  /**
   * Record reviewer feedback (ACCEPTED / MODIFIED / REJECTED) on an analysis.
   */
  async recordFeedback(
    analysisId: string,
    decision: 'ACCEPTED' | 'MODIFIED' | 'REJECTED',
    note?: string,
    reviewedById?: string,
  ) {
    return this.prisma.aiAnalysis.update({
      where: { id: analysisId },
      data: {
        reviewerDecision: decision,
        reviewerNote: note ?? null,
        reviewedAt: new Date(),
        reviewedById: reviewedById ?? null,
      },
    });
  }

  /**
   * Get the latest AI analysis for a case.
   */
  async getLatestAnalysis(caseId: string) {
    return this.prisma.aiAnalysis.findFirst({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────

  private async runOpenAiAnalysis(caseRecord: any): Promise<AiTriageResult> {
    const reportsText = (caseRecord.reports ?? [])
      .map((r: any) => `- ${r.summary ?? ''}${r.detail ? ': ' + r.detail : ''}`)
      .join('\n');

    const subjectsText = (caseRecord.subjects ?? [])
      .map((s: any) => `${s.displayName} on ${s.platform?.name ?? 'unknown platform'}`)
      .join(', ');

    const prompt = `You are an anti-cheat case analyst. Analyze the following case and produce a structured triage.

Case: ${caseRecord.caseNumber} — ${caseRecord.title ?? 'Untitled'}
Subjects: ${subjectsText || 'none'}

Reports:
${reportsText || 'none'}

Known violation tags: ${(caseRecord.violationTypes ?? []).map((v: any) => v.violationType?.name).join(', ') || 'none'}

Respond ONLY with a JSON object in this exact format:
{
  "summary": "<2-4 sentence summary of the case and key evidence>",
  "confidence": <float 0.0-1.0 representing confidence that cheating occurred>,
  "suggestedViolationType": "<slug like 'aimbot' or 'wallhack' or null>",
  "suggestedPriority": "<LOW|MEDIUM|HIGH|CRITICAL>"
}`;

    try {
      const completion = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 400,
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);

      return {
        summary: parsed.summary ?? 'AI analysis could not generate a summary.',
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
        suggestedViolationType: parsed.suggestedViolationType ?? null,
        suggestedPriority: parsed.suggestedPriority ?? null,
        rawResponse: completion,
      };
    } catch (err) {
      this.logger.error('OpenAI analysis failed', err);
      return this.buildStubResult(caseRecord);
    }
  }

  private buildStubResult(caseRecord: any): AiTriageResult {
    const reportCount = caseRecord.reports?.length ?? 0;
    const violations = (caseRecord.violationTypes ?? [])
      .map((v: any) => v.violationType?.name)
      .filter(Boolean)
      .join(', ');

    return {
      summary: `Case ${caseRecord.caseNumber} has ${reportCount} report(s).${violations ? ' Potential violations: ' + violations + '.' : ''} AI analysis is disabled — enable AI_ENABLED and provide an OPENAI_API_KEY for automated triage.`,
      confidence: 0,
      suggestedViolationType: null,
      suggestedPriority: null,
      rawResponse: null,
    };
  }

  // Legacy stubs kept for backwards compatibility
  analyzeEvidence(evidenceId: string) {
    return { evidenceId, verdict: 'pending', confidence: 0 };
  }

  scoreCaseRisk(caseId: string) {
    return { caseId, riskScore: 0 };
  }
}

