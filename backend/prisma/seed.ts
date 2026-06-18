import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // -----------------------------------------------------
  // 1. GAME — The Division 2
  // -----------------------------------------------------
  const game = await prisma.game.create({
    data: {
      name: 'The Division 2',
      slug: 'the-division-2',
      logoUrl: 'https://example.com/logos/td2.png',
      metadata: {
        publisher: 'Ubisoft',
        engine: 'Snowdrop',
        regionSupport: ['NA', 'EU', 'APAC'],
      },
    },
  });

  console.log('Created Game:', game.slug);

  // -----------------------------------------------------
  // 2. USER — Basic analyst account
  // -----------------------------------------------------
  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@example.com',
      displayName: 'Analyst One',
      role: 'ANALYST',
    },
  });

  console.log('Created User:', analyst.email);

  // -----------------------------------------------------
  // 3. PLATFORM — Xbox Live
  // -----------------------------------------------------
  const xbox = await prisma.platform.create({
    data: {
      gameId: game.id,
      name: 'Xbox Live',
      slug: 'xbox-live',
      profileUrlTemplate:
        'https://account.xbox.com/en-us/profile?gamertag={{externalId}}',
    },
  });

  console.log('Created Platform:', xbox.slug);

  // -----------------------------------------------------
  // 4. VIOLATION TYPES (3)
  // -----------------------------------------------------
  const violationTypes = await prisma.violationType.createMany({
    data: [
      {
        gameId: game.id,
        name: 'Aimbot',
        slug: 'aimbot',
        description: 'Automated aiming assistance.',
        severity: 'HIGH',
      },
      {
        gameId: game.id,
        name: 'Wallhack',
        slug: 'wallhack',
        description: 'Seeing players through walls.',
        severity: 'MEDIUM',
      },
      {
        gameId: game.id,
        name: 'Exploiting',
        slug: 'exploiting',
        description: 'Abusing unintended game mechanics.',
        severity: 'LOW',
      },
    ],
  });

  console.log('Created Violation Types:', violationTypes.count);

  // -----------------------------------------------------
  // 5. SANCTION TEMPLATES (3)
  // -----------------------------------------------------
  const sanctionTemplates = await prisma.sanctionTemplate.createMany({
    data: [
      {
        gameId: game.id,
        name: 'Permanent Ban',
        slug: 'permanent-ban',
        description: 'Permanent account ban.',
        durationDays: null,
        isAppealable: false,
      },
      {
        gameId: game.id,
        name: '7-Day Suspension',
        slug: '7-day-suspension',
        description: 'Temporary suspension for moderate violations.',
        durationDays: 7,
      },
      {
        gameId: game.id,
        name: 'Warning',
        slug: 'warning',
        description: 'Non-punitive warning for minor issues.',
        durationDays: 0,
      },
    ],
  });

  console.log('Created Sanction Templates:', sanctionTemplates.count);

  // -----------------------------------------------------
  // 6. INTEGRATION SOURCE
  // -----------------------------------------------------
  const integrationSource = await prisma.integrationSource.create({
    data: {
      gameId: game.id,
      name: 'In-Game Report System',
      slug: 'in-game-report',
      webhookUrl: null,
      apiKeyHash: null,
    },
  });

  console.log('Created Integration Source:', integrationSource.slug);

  // -----------------------------------------------------
  // 7. System User (for internal processes, not human login)
  // -----------------------------------------------------
  const systemIngestUser = await prisma.user.upsert({
    where: { email: 'system-ingest@ccip.local' },
    update: {},
    create: {
      email: 'system-ingest@ccip.local',
      displayName: 'System Report Ingest',
      role: 'ANALYST',
    },
  });
  console.log('Created System-Ingest User:', systemIngestUser.email);

  // ------------------------------------------------------
  // 8. Test Case for Ingestion Testing
  // ------------------------------------------------------
  const testCase = await prisma.case.create({
    data: {
      gameId: game.id,
      caseNumber: 'TEST-CASE-001',
      title: 'Test Case: Player suspected of cheating',
      status: 'OPEN',
      priority: 'MEDIUM',
      openedById: analyst.id, // your analyst user
    },
  });
  console.log('Created Test Case:', testCase.id);

  // ------------------------------------------------------
  // 9. Test Accused Subject (the accused player in the test case)
  // ------------------------------------------------------
  const accusedSubject = await prisma.subject.create({
    data: {
      caseId: testCase.id,
      platformId: xbox.id,
      displayName: 'AccusedPlayer123',
      externalId: 'ACCUSED-PLAYER-123',
    },
  });
  console.log('Created Accused Subject:', accusedSubject.displayName);

  // ------------------------------------------------------
  // 10. Test Reporter Player
  // ------------------------------------------------------
  const reportingSubject = await prisma.subject.create({
    data: {
      caseId: testCase.id,
      platformId: xbox.id,
      displayName: 'HelpfulPlayer456',
      externalId: 'HELPFUL-PLAYER-456',
    },
  });
  console.log('Created Reporting Subject:', reportingSubject.displayName);


  // Complete seeding
  console.log('🌱 Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
