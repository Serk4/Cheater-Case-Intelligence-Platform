import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from '@nestjs/swagger'
import { GamesService } from './games.service'
import { CreateGameDto } from './dto/create-game.dto'
import { UpdateGameDto } from './dto/update-game.dto'

@Controller('games')
@ApiTags('Games')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a new game',
		description: 'Creates a new game entry in the system',
	})
	@ApiBody({ type: CreateGameDto })
	@ApiResponse({
		status: 201,
		description: 'Game created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid game data',
	})
	create(@Body() createGameDto: CreateGameDto) {
		return this.gamesService.create(createGameDto)
	}

	@Get()
	@ApiOperation({
		summary: 'List all games',
		description: 'Retrieves a list of all available games in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'List of games retrieved successfully',
	})
	findAll() {
		return this.gamesService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific game',
		description: 'Retrieves a single game by its ID',
	})
	@ApiParam({
		name: 'id',
		description: 'The game ID',
		example: 'game-1',
	})
	@ApiResponse({
		status: 200,
		description: 'Game retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Game not found',
	})
	findOne(@Param('id') id: string) {
		return this.gamesService.findOne(id)
	}

	@Patch(':id')
	@ApiOperation({
		summary: 'Update a game',
		description: 'Updates an existing game with new information',
	})
	@ApiParam({
		name: 'id',
		description: 'The game ID',
		example: 'game-1',
	})
	@ApiBody({ type: UpdateGameDto })
	@ApiResponse({
		status: 200,
		description: 'Game updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Game not found',
	})
	update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
		return this.gamesService.update(id, updateGameDto)
	}

	@Delete(':id')
	@ApiOperation({
		summary: 'Delete a game',
		description: 'Permanently removes a game from the system',
	})
	@ApiParam({
		name: 'id',
		description: 'The game ID',
		example: 'game-1',
	})
	@ApiResponse({
		status: 200,
		description: 'Game deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'Game not found',
	})
	remove(@Param('id') id: string) {
		return this.gamesService.remove(id)
	}
}
