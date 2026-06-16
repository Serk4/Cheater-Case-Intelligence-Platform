import { Injectable } from '@nestjs/common';

// TODO: inject PrismaService, ReportsService, EvidenceService

@Injectable()
export class CasesService {
  // TODO: implement findAll with pagination and status filters
  findAll() {
    return [];
  }

  // TODO: implement findOne with related reports/evidence
  findOne(id: string) {
    return { id };
  }

  // TODO: create case, link reports and evidence
  create(data: unknown) {
    return { created: true, data };
  }

  // TODO: implement status transitions with validation
  update(id: string, data: unknown) {
    return { id, updated: true, data };
  }
}
