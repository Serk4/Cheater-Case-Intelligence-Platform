import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NoteVisibility } from '@prisma/client';

export class CreateNoteDto {
  @IsString()
  caseId: string;

  @IsString()
  authorId: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsEnum(NoteVisibility)
  visibility?: NoteVisibility;

  @IsOptional()
  isPinned?: boolean;
}
