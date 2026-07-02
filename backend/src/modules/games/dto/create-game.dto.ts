import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  shortCode: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  metadata?: any;

  @IsBoolean()
  isActive?: boolean;
}