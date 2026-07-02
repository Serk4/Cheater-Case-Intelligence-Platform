import {
	Body,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
  Query,
} from '@nestjs/common'
import { SubjectsService } from './subjects.service'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Controller('subjects')
export class SubjectsController {
	constructor(private readonly subjectsService: SubjectsService) {}

	@Get('search')
	search(@Query('query') query: string, @Query('platformId') platformId: string) {
		return this.subjectsService.search(query, platformId)
	}

	@Get()
	findAll() {
		return this.subjectsService.findAll()
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.subjectsService.findOne(id)
	}

	@Post()
	create(@Body() dto: CreateSubjectDto) {
		return this.subjectsService.create(dto)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
		return this.subjectsService.update(id, dto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.subjectsService.remove(id)
	}
}
