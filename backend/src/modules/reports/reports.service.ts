import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportIngestionDto } from './dto/report-ingestion.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  findAll() {
    return this.prisma.report.findMany({
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  create(data: CreateReportDto) {
    return this.prisma.report.create({
      data,
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  update(id: string, data: UpdateReportDto) {
    return this.prisma.report.update({
      where: { id },
      data,
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.report.delete({
      where: { id },
    });
  }

  /**
   * Ingest a report from an external integration or manual source.
   * Can be called from a controller, webhook handler, or message consumer.
   */
  async ingestFromIntegration(payload: ReportIngestionDto) {
    // Optional: validate that case exists
    await this.prisma.case.findUniqueOrThrow({
      where: { id: payload.caseId },
    });

    // Optional: validate that reporter exists
    await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.reportedById },
    });

    // Optional: validate integration source if provided
    if (payload.integrationSourceId) {
      await this.prisma.integrationSource.findUniqueOrThrow({
        where: { id: payload.integrationSourceId },
      });
    }

    const report = await this.prisma.report.create({
      data: {
        caseId: payload.caseId,
        reportedById: payload.reportedById,
        integrationSourceId: payload.integrationSourceId,
        summary: payload.summary,
        detail: payload.detail,
        incidentAt: payload.incidentAt,
      },
      include: {
        case: true,
        reportedBy: true,
        integrationSource: true,
      },
    });

    // Trigger AI triage asynchronously — do not block the response
    if (this.aiService.isEnabled) {
      this.aiService.analyzeCase(payload.caseId).catch((err) =>
        this.logger.warn(`AI triage failed for case ${payload.caseId}: ${err?.message}`),
      );
    }

    return report;
  }
}
