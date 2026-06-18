import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  reportedById: string;

  @IsString()
  @IsOptional()
  integrationSourceId?: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsOptional()
  detail?: string;

  @IsOptional()
  incidentAt?: Date;
}
