import { Injectable } from '@nestjs/common';

// TODO: inject PrismaService and a storage provider (S3 / local disk)

@Injectable()
export class EvidenceService {
  // TODO: implement findAll with pagination and type filters
  findAll() {
    return [];
  }

  // TODO: implement findOne with 404 handling
  findOne(id: string) {
    return { id };
  }

  // TODO: handle file upload, persist metadata to DB
  create(data: unknown) {
    return { created: true, data };
  }
}
