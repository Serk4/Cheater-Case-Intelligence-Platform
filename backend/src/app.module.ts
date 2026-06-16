import { Module } from '@nestjs/common';
import { ReportsModule } from './modules/reports/reports.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { CasesModule } from './modules/cases/cases.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';

// TODO: add PrismaModule, RedisModule, ConfigModule

@Module({
  imports: [
    ReportsModule,
    EvidenceModule,
    CasesModule,
    AiModule,
    UsersModule,
  ],
})
export class AppModule {}
