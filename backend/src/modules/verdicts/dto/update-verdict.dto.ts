import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVerdictDto } from './create-verdict.dto';

export class UpdateVerdictDto extends PartialType(
  OmitType(CreateVerdictDto, ['caseId'] as const),
) {}
