import { Module } from '@nestjs/common';
import { ReportsModule } from './modules/reports/reports.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { CasesModule } from './modules/cases/cases.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PlatformsModule } from './modules/platforms/platforms.module';
import { ViolationTypesModule } from './modules/violation-types/violation-types.module';
import { SanctionTemplatesModule } from './modules/sanction-templates/sanction-templates.module';
import { IntegrationSourcesModule } from './modules/integration-sources/integration-sources.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { NotesModule } from './modules/notes/notes.module';
import { VerdictsModule } from './modules/verdicts/verdicts.module';
import { CaseViolationTypesModule } from './modules/case-violation-types/case-violation-types.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

// TODO: RedisModule, ConfigModule

@Module({
  imports: [
    ReportsModule,
    EvidenceModule,
    CasesModule,
    AiModule,
    UsersModule,
    PrismaModule,
    PlatformsModule,
    ViolationTypesModule,
    SanctionTemplatesModule,
    IntegrationSourcesModule,
    SubjectsModule,
    NotesModule,
    VerdictsModule,
    CaseViolationTypesModule,
    AuditLogsModule,
  ],
})
export class AppModule {}
