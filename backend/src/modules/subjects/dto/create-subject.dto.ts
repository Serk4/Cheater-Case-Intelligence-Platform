import { IsNotEmpty, IsOptional, IsString, IsJSON } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  profileUrl?: string;

  @IsOptional()
  metadata?: any;
}
