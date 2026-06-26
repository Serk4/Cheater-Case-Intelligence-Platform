import { NoteVisibility } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  body?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;
}
