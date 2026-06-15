import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

// TODO: add DTOs, guards, pagination

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // TODO: implement report listing with filters
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  // TODO: implement report detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  // TODO: implement report creation with validation
  @Post()
  create(@Body() body: unknown) {
    return this.reportsService.create(body);
  }
}
