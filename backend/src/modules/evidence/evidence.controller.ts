import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EvidenceService } from './evidence.service';

// TODO: add file upload support, DTOs, guards

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // TODO: implement evidence listing with filters
  @Get()
  findAll() {
    return this.evidenceService.findAll();
  }

  // TODO: implement evidence detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evidenceService.findOne(id);
  }

  // TODO: implement evidence upload (multipart form)
  @Post()
  create(@Body() body: unknown) {
    return this.evidenceService.create(body);
  }
}
