import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Injectable()
export class SubjectsService {
	constructor(private prisma: PrismaService) {}

	async search(query: string, platformId: string) {
		if (!query || query.length < 2) return []

		return this.prisma.subject.findMany({
			where: {
        platformId: platformId,
				OR: [
					{ displayName: { contains: query, mode: 'insensitive' } },
					{ externalId: { contains: query, mode: 'insensitive' } },
				],
			},
			orderBy: { displayName: 'asc' },
		})
	}

	async create(dto: CreateSubjectDto) {
		console.log('Creating subject with DTO:', dto)
		return this.prisma.subject.create({
			data: {
				displayName: dto.displayName,
				externalId: dto.externalId,
				profileUrl: dto.profileUrl,
				platformId: dto.platformId,
				metadata: dto.metadata,
			},
		})
	}

	findAll() {
		return this.prisma.subject.findMany({
			include: {
				cases: true,
				platform: true,
			},
		})
	}

	findOne(id: string) {
		return this.prisma.subject.findUnique({
			where: { id },
			include: {
				cases: true,
				platform: true,
			},
		})
	}

	update(id: string, data: UpdateSubjectDto) {
		return this.prisma.subject.update({
			where: { id },
			data,
			include: {
				cases: true,
				platform: true,
			},
		})
	}

	remove(id: string) {
		return this.prisma.subject.delete({
			where: { id },
		})
	}
}
