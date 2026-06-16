import { Injectable } from '@nestjs/common';

// TODO: inject PrismaService, add password hashing, JWT integration

@Injectable()
export class UsersService {
  // TODO: implement findAll (admin-only) with pagination
  findAll() {
    return [];
  }

  // TODO: implement findOne with 404 handling
  findOne(id: string) {
    return { id };
  }

  // TODO: hash password, persist user, return safe response
  create(data: unknown) {
    return { created: true, data };
  }
}
