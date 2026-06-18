import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIntegrationSourceDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
