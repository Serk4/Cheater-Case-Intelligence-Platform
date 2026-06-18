import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateViolationTypeDto } from './create-violation-type.dto';
import { CasePriority } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateViolationTypeDto extends PartialType(
  OmitType(CreateViolationTypeDto, ['gameId'] as const),
) {
  @IsEnum(CasePriority)
  @IsOptional()
  severity?: CasePriority;
}
