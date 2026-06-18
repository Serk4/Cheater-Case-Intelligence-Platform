import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { CaseViolationTypesService } from './case-violation-types.service';
import { CreateCaseViolationTypeDto } from './dto/create-case-violation-type.dto';

@Controller('case-violation-types')
export class CaseViolationTypesController {
  constructor(
    private readonly service: CaseViolationTypesService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':caseId/:violationTypeId')
  findOne(
    @Param('caseId') caseId: string,
    @Param('violationTypeId') violationTypeId: string,
  ) {
    return this.service.findOne(caseId, violationTypeId);
  }

  @Post()
  create(@Body() dto: CreateCaseViolationTypeDto) {
    return this.service.create(dto);
  }

  @Delete(':caseId/:violationTypeId')
  remove(
    @Param('caseId') caseId: string,
    @Param('violationTypeId') violationTypeId: string,
  ) {
    return this.service.remove(caseId, violationTypeId);
  }
}
