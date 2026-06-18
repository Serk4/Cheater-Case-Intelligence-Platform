import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVerdictDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  sanctionTemplateId: string;

  @IsString()
  @IsNotEmpty()
  renderedById: string;

  @IsString()
  @IsNotEmpty()
  rationale: string;

  @IsOptional()
  effectiveAt?: Date;

  @IsOptional()
  expiresAt?: Date;
}
