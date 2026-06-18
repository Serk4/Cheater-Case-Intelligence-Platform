import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NoteVisibility } from '@prisma/client';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;
}

