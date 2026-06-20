import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
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
import { Req } from '@nestjs/common';
import { diskStorage } from 'multer';


@Controller('cases')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post(':caseId/evidence')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/evidence',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
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
    })
  )

  async createEvidence(
    @UploadedFile() file: Express.Multer.File,
    @Param('caseId') caseId: string,
    @Body() dto: CreateEvidenceDto,
    @Req() req: any,
  ) {
      console.log('CONTENT-TYPE:', req.headers['content-type']);
      console.log('Received file:', file);
      console.log('DTO:', dto);
      return this.casesService.createEvidence({ ...dto, caseId }, file);
  }

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
}
