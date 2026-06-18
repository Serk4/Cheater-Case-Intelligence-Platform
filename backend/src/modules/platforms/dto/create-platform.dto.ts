import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  @IsOptional()
  gameId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  profileUrlTemplate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
