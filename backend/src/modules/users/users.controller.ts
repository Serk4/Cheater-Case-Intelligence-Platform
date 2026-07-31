import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
} from '@nestjs/common'
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Auth, CurrentUser } from '../auth'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@Auth()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@ApiOperation({
		summary: 'List all reviewers',
		description: 'Retrieves all users (reviewers) in the system',
	})
	@ApiResponse({
		status: 200,
		description: 'Users retrieved successfully',
	})
	findAll() {
		return this.usersService.findAll()
	}

	@Get(':id')
	@ApiOperation({
		summary: 'Get a specific user',
		description: 'Retrieves information about a single reviewer',
	})
	@ApiParam({
		name: 'id',
		description: 'The user ID',
	})
	@ApiResponse({
		status: 200,
		description: 'User retrieved successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id)
	}

	@Post()
	@Auth('ADMIN')
	@ApiOperation({
		summary: 'Create a new reviewer',
		description: 'Creates a new user account for a reviewer (admin only)',
	})
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid user data',
	})
	@ApiResponse({
		status: 403,
		description: 'Insufficient permissions',
	})
	create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto)
	}

	@Patch(':id')
	@Auth('ADMIN')
	@ApiOperation({
		summary: 'Update a user',
		description: 'Updates reviewer information (admin only)',
	})
	@ApiParam({
		name: 'id',
		description: 'The user ID',
	})
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({
		status: 200,
		description: 'User updated successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	@ApiResponse({
		status: 403,
		description: 'Insufficient permissions',
	})
	update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
		return this.usersService.update(id, dto)
	}

	@Delete(':id')
	@Auth('ADMIN')
	@ApiOperation({
		summary: 'Delete a user',
		description: 'Removes a reviewer account from the system (admin only)',
	})
	@ApiParam({
		name: 'id',
		description: 'The user ID',
	})
	@ApiResponse({
		status: 200,
		description: 'User deleted successfully',
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
	})
	@ApiResponse({
		status: 403,
		description: 'Insufficient permissions',
	})
	remove(@Param('id') id: string) {
		return this.usersService.remove(id)
	}
}
