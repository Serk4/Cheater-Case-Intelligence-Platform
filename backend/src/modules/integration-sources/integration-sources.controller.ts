import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { IntegrationSourcesService } from './integration-sources.service';
import { CreateIntegrationSourceDto } from './dto/create-integration-source.dto';
import { UpdateIntegrationSourceDto } from './dto/update-integration-source.dto';

@Controller('integration-sources')
export class IntegrationSourcesController {
  constructor(
    private readonly integrationSourcesService: IntegrationSourcesService,
  ) {}

  @Get()
  findAll() {
    return this.integrationSourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationSourcesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateIntegrationSourceDto) {
    return this.integrationSourcesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIntegrationSourceDto) {
    return this.integrationSourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationSourcesService.remove(id);
  }
}
