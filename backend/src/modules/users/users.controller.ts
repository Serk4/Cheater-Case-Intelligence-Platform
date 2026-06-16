import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

// TODO: add auth guards, role checks, DTOs

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: implement user listing (admin only)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // TODO: implement user profile
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // TODO: implement user creation / registration
  @Post()
  create(@Body() body: unknown) {
    return this.usersService.create(body);
  }
}
