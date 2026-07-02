import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';

export class UpdateCaseDto extends PartialType(
  OmitType(CreateCaseDto, ['gameId', 'openedById'] as const),
) {}
