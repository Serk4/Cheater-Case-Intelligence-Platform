import { IsNotEmpty, IsString, IsJSON, IsOptional, IsBoolean } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  logoUrl: string;

  @IsOptional()
  metadata?: any;

  @IsBoolean()
  isActive?: boolean;
}