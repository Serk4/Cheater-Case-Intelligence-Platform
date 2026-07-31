import {
	Body,
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { PlatformsService } from './platforms.service'
import { CreatePlatformDto } from './dto/create-platform.dto'
import { UpdatePlatformDto } from './dto/update-platform.dto'

@Controller('platforms')
@ApiTags('Platforms')
export class PlatformsController {
	constructor(private readonly platformsService: PlatformsService) {}

	@Get()
	@ApiOperation({
		summary: 'List all platforms',
		description: 'Retrieves all gaming platforms (PC, Console, etc.)',
	})
	@ApiResponse({
		status: 200,
		description: 'Platforms retrieved successfully',
	})
	findAll() {
		return this.platformsService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific platform',
		description: 'Retrieves details about a single gaming platform',
	})
	@ApiParam({
		name: 'id',
		description: 'The platform ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Platform retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Platform not found',
	})
	findOne(@Param('id') id: string) {
		return this.platformsService.findOne(id)
	}

	@Post()
	@ApiOperation({
		summary: 'Create a new platform',
		description: 'Adds a new gaming platform to the system',
	})
	@ApiBody({ type: CreatePlatformDto })
	@ApiResponse({
		status: 201,
		description: 'Platform created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid platform data',
	})
	create(@Body() dto: CreatePlatformDto) {
		return this.platformsService.create(dto)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a platform',
		description: 'Updates platform information',
	})
	@ApiParam({
		name: 'id',
		description: 'The platform ID',
	})
	@ApiBody({ type: UpdatePlatformDto })
	@ApiResponse({
		status: 200,
		description: 'Platform updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Platform not found',
	})
	update(@Param('id') id: string, @Body() dto: UpdatePlatformDto) {
		return this.platformsService.update(id, dto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a platform',
		description: 'Removes a gaming platform from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The platform ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Platform deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Platform not found',
	})
	remove(@Param('id') id: string) {
		return this.platformsService.remove(id)
	}
}
