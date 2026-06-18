import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEvidenceDto } from './create-evidence.dto';

export class UpdateEvidenceDto extends PartialType(
  OmitType(CreateEvidenceDto, ['caseId', 'uploadedById'] as const),
) {}
