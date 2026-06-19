import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseListQueryDto } from './dto/case-list.query.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { Express } from 'express';
import * as path from 'path';


@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post('evidence')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/png',
          'image/jpeg',
          'image/webp',
          'video/mp4',
          'video/webm',
          'text/plain',
          'application/json',
        ];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.webm', '.txt', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `Unsupported file type: ${file.mimetype}`,
            ),
            false,
          );
        }

        if (!allowedExtensions.includes(ext)) {
          return callback(
            new BadRequestException(
              `Unsupported file extension: ${ext}`,
            ),
            false,
          );
        }      

        callback(null, true);
      },
    }),
  )

  @Get()
  findAll() {
    return this.casesService.findAll();
  }

  //@Get(':id')
  //findOne(@Param('id') id: string) {
  //  return this.casesService.findOne(id);
  //}

  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.casesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.casesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }

  @Get(':id')
  getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }

  @Get(':id/subjects')
  getCaseSubjects(@Param('id') id: string) {
    return this.casesService.getCaseSubjects(id);
  }

  @Get(':id/reports')
  getCaseReports(@Param('id') id: string) {
    return this.casesService.getCaseReports(id);
  }

  @Get(':id/evidence')
  getCaseEvidence(@Param('id') id: string) {
    return this.casesService.getCaseEvidence(id);
  }

  @Get(':id/notes')
  getCaseNotes(@Param('id') id: string) {
    return this.casesService.getCaseNotes(id);
  }

  @Get(':id/verdict')
  getCaseVerdict(@Param('id') id: string) {
    return this.casesService.getCaseVerdict(id);
  }

  @Get('search')
  async listCases(@Query() query: CaseListQueryDto) {
    return this.casesService.listCases(query);
  }

  @Post('notes')
  async createNote(@Body() dto: CreateNoteDto) {
    return this.casesService.createNote(dto);
  }

  @Delete('notes/:id')
  async deleteNote(@Param('id') id: string) {
    return this.casesService.softDeleteNote(id);
  }

  async createEvidence(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEvidenceDto,
  ) {
    return this.casesService.createEvidence(dto, file);
  }



}
