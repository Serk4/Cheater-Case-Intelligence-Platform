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
  const user = await prisma.user.create({
    data: {
      email: 'analyst@example.com',
      displayName: 'Analyst One',
      role: 'ANALYST',
    },
  });

  console.log('Created User:', user.email);

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
