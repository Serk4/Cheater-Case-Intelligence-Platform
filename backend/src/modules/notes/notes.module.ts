import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { EvidenceNotesController, SingleNoteController, NotesController } from './notes.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotesController, EvidenceNotesController, SingleNoteController],
  providers: [NotesService],
})
export class NotesModule {}
