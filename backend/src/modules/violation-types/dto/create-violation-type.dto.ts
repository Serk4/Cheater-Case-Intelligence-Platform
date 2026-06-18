import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CasePriority } from '@prisma/client';

export class CreateViolationTypeDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(CasePriority)
  severity?: CasePriority;
}
