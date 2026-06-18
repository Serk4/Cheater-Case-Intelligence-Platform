import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { ViolationTypesService } from './violation-types.service';
import { CreateViolationTypeDto } from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';

@Controller('violation-types')
export class ViolationTypesController {
  constructor(private readonly violationTypesService: ViolationTypesService) {}

  @Get()
  findAll() {
    return this.violationTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.violationTypesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateViolationTypeDto) {
    return this.violationTypesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateViolationTypeDto) {
    return this.violationTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.violationTypesService.remove(id);
  }
}
