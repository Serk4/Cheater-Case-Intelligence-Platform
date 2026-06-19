import { EvidenceType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  caseId: string;

  @IsString()
  uploadedById: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  capturedAt?: Date;
}
