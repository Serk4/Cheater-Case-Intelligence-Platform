import { IsNotEmpty, IsString, IsOptional, IsInt, IsUrl, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @IsOptional()
  @IsUUID()
  evidenceId?: string;

  @IsOptional()
  @IsUUID()
  noteId?: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsInt()
  sizeBytes: number;

  @IsNotEmpty()
  @IsString()
  storageKey: string;

  @IsNotEmpty()
  @IsUrl()
  storageUrl: string;
}