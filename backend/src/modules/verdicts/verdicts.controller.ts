import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { VerdictsService } from './verdicts.service';
import { CreateVerdictDto } from './dto/create-verdict.dto';
import { UpdateVerdictDto } from './dto/update-verdict.dto';

@Controller('verdicts')
export class VerdictsController {
  constructor(private readonly verdictsService: VerdictsService) {}

  @Get()
  findAll() {
    return this.verdictsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verdictsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVerdictDto) {
    return this.verdictsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVerdictDto) {
    return this.verdictsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verdictsService.remove(id);
  }
}
