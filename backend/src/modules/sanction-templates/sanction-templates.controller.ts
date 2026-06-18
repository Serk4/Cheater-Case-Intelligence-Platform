import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { SanctionTemplatesService } from './sanction-templates.service';
import { CreateSanctionTemplateDto } from './dto/create-sanction-template.dto';
import { UpdateSanctionTemplateDto } from './dto/update-sanction-template.dto';

@Controller('sanction-templates')
export class SanctionTemplatesController {
  constructor(
    private readonly sanctionTemplatesService: SanctionTemplatesService,
  ) {}

  @Get()
  findAll() {
    return this.sanctionTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sanctionTemplatesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSanctionTemplateDto) {
    return this.sanctionTemplatesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSanctionTemplateDto) {
    return this.sanctionTemplatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sanctionTemplatesService.remove(id);
  }
}
