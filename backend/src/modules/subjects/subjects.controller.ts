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
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiQuery,
} from '@nestjs/swagger'
import { SubjectsService } from './subjects.service'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Controller('subjects')
@ApiTags('Subjects')
export class SubjectsController {
	constructor(private readonly subjectsService: SubjectsService) {}

	@Get('search')
	@ApiOperation({
		summary: 'Search subjects',
		description: 'Searches for players/subjects by username or ID',
	})
	@ApiQuery({
		name: 'query',
		type: String,
		description: 'Search query (username or ID)',
	})
	@ApiQuery({
		name: 'platformId',
		type: String,
		description: 'Filter by platform',
		required: false,
	})
	@ApiResponse({
		status: 200,
		description: 'Matching subjects retrieved successfully',
	})
	search(
		@Query('query') query: string,
		@Query('platformId') platformId: string,
	) {
		return this.subjectsService.search(query, platformId)
	}

	@Get()
	@ApiOperation({
		summary: 'List all subjects',
		description: 'Retrieves all players/subjects in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Subjects retrieved successfully',
	})
	findAll() {
		return this.subjectsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific subject',
		description: 'Retrieves details about a player/subject',
	})
	@ApiParam({
		name: 'id',
		description: 'The subject/player ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Subject retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Subject not found',
	})
	findOne(@Param('id') id: string) {
		return this.subjectsService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new subject',
		description: 'Registers a new player/subject in the system',
	})
	@ApiBody({ type: CreateSubjectDto })
	@ApiResponse({
		status: 201,
		description: 'Subject created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid subject data',
	})
	create(@Body() dto: CreateSubjectDto) {
		return this.subjectsService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a subject',
		description: 'Updates player/subject information',
	})
	@ApiParam({
		name: 'id',
		description: 'The subject/player ID',
	})
	@ApiBody({ type: UpdateSubjectDto })
	@ApiResponse({
		status: 200,
		description: 'Subject updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Subject not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
		return this.subjectsService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a subject',
		description: 'Removes a player/subject from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The subject/player ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Subject deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Subject not found',
	})
	remove(@Param('id') id: string) {
		return this.subjectsService.remove(id)
	}
}
