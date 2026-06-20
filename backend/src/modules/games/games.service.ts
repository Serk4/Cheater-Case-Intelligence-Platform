import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    return this.prisma.game.create({
      data: createGameDto,
    });
  }

  async findAll() {
    return this.prisma.game.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return game;
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    await this.findOne(id); // ensure exists

    return this.prisma.game.update({
      where: { id },
      data: updateGameDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.game.delete({
      where: { id },
    });
  }
}