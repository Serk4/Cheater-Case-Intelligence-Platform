import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateIntegrationSourceDto } from './create-integration-source.dto';

export class UpdateIntegrationSourceDto extends PartialType(
  OmitType(CreateIntegrationSourceDto, ['gameId'] as const),
) {}
