import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { CasesService } from './cases.service';

// TODO: add DTOs, guards, status-transition logic

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  // TODO: implement case listing with filters
  @Get()
  findAll() {
    return this.casesService.findAll();
  }

  // TODO: implement case detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  // TODO: implement case creation (link reports/evidence)
  @Post()
  create(@Body() body: unknown) {
    return this.casesService.create(body);
  }

  // TODO: implement case status updates
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.casesService.update(id, body);
  }
}
