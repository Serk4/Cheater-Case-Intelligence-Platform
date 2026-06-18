import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EvidenceStatus, EvidenceType } from '@prisma/client';

export class CreateEvidenceDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  uploadedById: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EvidenceType)
  @IsOptional()
  evidenceType?: EvidenceType;

  @IsEnum(EvidenceStatus)
  @IsOptional()
  status?: EvidenceStatus;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  capturedAt?: Date;
}
