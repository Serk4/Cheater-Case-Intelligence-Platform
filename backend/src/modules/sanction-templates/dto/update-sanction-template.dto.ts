import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSanctionTemplateDto } from './create-sanction-template.dto';

export class UpdateSanctionTemplateDto extends PartialType(
  OmitType(CreateSanctionTemplateDto, ['gameId'] as const),
) {}
