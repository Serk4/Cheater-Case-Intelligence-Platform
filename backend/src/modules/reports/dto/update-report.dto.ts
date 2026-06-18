import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(
  OmitType(CreateReportDto, ['caseId', 'reportedById'] as const),
) {}
