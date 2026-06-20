import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CASE_NUMBER = 'CASE-TD2-0001';
const OPENED_AT = new Date('2026-06-15T14:30:00.000Z');
const INCIDENT_AT = new Date('2026-06-15T13:42:00.000Z');
const CAPTURED_AT = new Date('2026-06-15T13:40:12.000Z');
const EFFECTIVE_AT = new Date('2026-06-16T10:00:00.000Z');
const EXPIRES_AT = new Date('2026-06-23T10:00:00.000Z');

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.attachment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.verdict.deleteMany();
  await prisma.note.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.report.deleteMany();
  await prisma.caseViolationType.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.case.deleteMany();

  const game = await prisma.game.upsert({
    where: { slug: 'the-division-2' },
    update: {
      name: 'Tom Clancy’s The Division 2',
      logoUrl: 'https://example.com/logos/the-division-2.png',
      metadata: {
        publisher: 'Ubisoft',
        engine: 'Snowdrop',
        supportedRegions: ['NA', 'EU', 'APAC'],
        moderationTier: 'pilot',
      },
      isActive: true,
    },
    create: {
      name: 'Tom Clancy’s The Division 2',
      slug: 'the-division-2',
      logoUrl: 'https://example.com/logos/the-division-2.png',
      metadata: {
        publisher: 'Ubisoft',
        engine: 'Snowdrop',
        supportedRegions: ['NA', 'EU', 'APAC'],
        moderationTier: 'pilot',
      },
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst.one@ccip.local' },
    update: {
      displayName: 'Analyst One',
      role: 'ANALYST',
      isActive: true,
    },
    create: {
      email: 'analyst.one@ccip.local',
      displayName: 'Analyst One',
      role: 'ANALYST',
    },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer.one@ccip.local' },
    update: {
      displayName: 'Reviewer One',
      role: 'SENIOR_ANALYST',
      isActive: true,
    },
    create: {
      email: 'reviewer.one@ccip.local',
      displayName: 'Reviewer One',
      role: 'SENIOR_ANALYST',
    },
  });

  const systemIngestUser = await prisma.user.upsert({
    where: { email: 'system-ingest@ccip.local' },
    update: {
      displayName: 'System Report Ingest',
      role: 'ANALYST',
      isActive: true,
    },
    create: {
      email: 'system-ingest@ccip.local',
      displayName: 'System Report Ingest',
      role: 'ANALYST',
    },
  });

  const ubisoftConnect = await prisma.platform.upsert({
    where: { slug: 'ubisoft-connect' },
    update: {
      gameId: game.id,
      name: 'Ubisoft Connect',
      profileUrlTemplate: 'https://ubisoftconnect.com/en-US/profile/{{externalId}}',
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Ubisoft Connect',
      slug: 'ubisoft-connect',
      profileUrlTemplate: 'https://ubisoftconnect.com/en-US/profile/{{externalId}}',
    },
  });

  const xboxLive = await prisma.platform.upsert({
    where: { slug: 'xbox-live' },
    update: {
      gameId: game.id,
      name: 'Xbox Live',
      profileUrlTemplate:
        'https://account.xbox.com/en-us/profile?gamertag={{externalId}}',
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Xbox Live',
      slug: 'xbox-live',
      profileUrlTemplate:
        'https://account.xbox.com/en-us/profile?gamertag={{externalId}}',
    },
  });

  const aimbot = await prisma.violationType.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'aimbot',
      },
    },
    update: {
      name: 'Aimbot',
      description: 'Automated aiming assistance.',
      severity: 'HIGH',
      color: '#DC2626',
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Aimbot',
      slug: 'aimbot',
      description: 'Automated aiming assistance.',
      severity: 'HIGH',
      color: '#DC2626',
    },
  });

  const wallhack = await prisma.violationType.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'wallhack',
      },
    },
    update: {
      name: 'Wallhack',
      description: 'Seeing players through walls or geometry.',
      severity: 'HIGH',
      color: '#F97316',
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Wallhack',
      slug: 'wallhack',
      description: 'Seeing players through walls or geometry.',
      severity: 'HIGH',
      color: '#F97316',
    },
  });

  await prisma.violationType.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'exploiting',
      },
    },
    update: {
      name: 'Exploiting',
      description: 'Abusing unintended game mechanics or map states.',
      severity: 'MEDIUM',
      color: '#EAB308',
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Exploiting',
      slug: 'exploiting',
      description: 'Abusing unintended game mechanics or map states.',
      severity: 'MEDIUM',
      color: '#EAB308',
    },
  });

  const permanentBan = await prisma.sanctionTemplate.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'permanent-ban',
      },
    },
    update: {
      name: 'Permanent Ban',
      description: 'Permanent account ban for confirmed severe cheating.',
      durationDays: null,
      isAppealable: false,
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Permanent Ban',
      slug: 'permanent-ban',
      description: 'Permanent account ban for confirmed severe cheating.',
      durationDays: null,
      isAppealable: false,
    },
  });

  const sevenDaySuspension = await prisma.sanctionTemplate.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: '7-day-suspension',
      },
    },
    update: {
      name: '7-Day Suspension',
      description: 'Temporary suspension for moderate or first-time offenses.',
      durationDays: 7,
      isAppealable: true,
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: '7-Day Suspension',
      slug: '7-day-suspension',
      description: 'Temporary suspension for moderate or first-time offenses.',
      durationDays: 7,
      isAppealable: true,
    },
  });

  await prisma.sanctionTemplate.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'warning',
      },
    },
    update: {
      name: 'Warning',
      description: 'Non-punitive warning for low-confidence or minor issues.',
      durationDays: 0,
      isAppealable: true,
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Warning',
      slug: 'warning',
      description: 'Non-punitive warning for low-confidence or minor issues.',
      durationDays: 0,
      isAppealable: true,
    },
  });

  const inGameReport = await prisma.integrationSource.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'in-game-report',
      },
    },
    update: {
      name: 'In-Game Report System',
      webhookUrl: null,
      apiKeyHash: null,
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'In-Game Report System',
      slug: 'in-game-report',
      webhookUrl: null,
      apiKeyHash: null,
    },
  });

  await prisma.integrationSource.upsert({
    where: {
      gameId_slug: {
        gameId: game.id,
        slug: 'customer-support-portal',
      },
    },
    update: {
      name: 'Customer Support Portal',
      webhookUrl: null,
      apiKeyHash: null,
      isActive: true,
    },
    create: {
      gameId: game.id,
      name: 'Customer Support Portal',
      slug: 'customer-support-portal',
      webhookUrl: null,
      apiKeyHash: null,
    },
  });

  const seededCase = await prisma.case.create({
    data: {
      gameId: game.id,
      caseNumber: CASE_NUMBER,
      title: 'DZ landmark engagement flagged for precision tracking',
      description:
        'Multiple reports allege that the accused player demonstrated impossible target tracking and pre-aim behavior during a Dark Zone encounter.',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      assignedToId: reviewer.id,
      openedById: analyst.id,
      openedAt: OPENED_AT,
      metadata: {
        map: 'Dark Zone East',
        region: 'NA',
        squadSize: 2,
        confidenceBand: 'medium-high',
      },
    },
  });

  const accusedSubject = await prisma.subject.create({
    data: {
      caseId: seededCase.id,
      platformId: ubisoftConnect.id,
      displayName: 'AccusedPlayer123',
      externalId: 'UCONN-001-ACCUSED',
      profileUrl: 'https://ubisoftconnect.com/en-US/profile/UCONN-001-ACCUSED',
      metadata: {
        roleInCase: 'accused',
        clanTag: 'RGE',
      },
    },
  });

  await prisma.subject.create({
    data: {
      caseId: seededCase.id,
      platformId: xboxLive.id,
      displayName: 'HelpfulReporter456',
      externalId: 'XBL-REPORTER-456',
      profileUrl:
        'https://account.xbox.com/en-us/profile?gamertag=XBL-REPORTER-456',
      metadata: {
        roleInCase: 'reporter',
        eyewitness: true,
      },
    },
  });

  await prisma.caseViolationType.createMany({
    data: [
      {
        caseId: seededCase.id,
        violationTypeId: aimbot.id,
      },
      {
        caseId: seededCase.id,
        violationTypeId: wallhack.id,
      },
    ],
  });

  const automatedReport = await prisma.report.create({
    data: {
      caseId: seededCase.id,
      reportedById: systemIngestUser.id,
      integrationSourceId: inGameReport.id,
      summary: 'Automated escalation from in-game report queue.',
      detail:
        'Three in-game reports within a 15 minute window referenced impossible tracking and target acquisition through cover.',
      incidentAt: INCIDENT_AT,
    },
  });

  await prisma.report.create({
    data: {
      caseId: seededCase.id,
      reportedById: analyst.id,
      summary: 'Manual analyst follow-up created after reviewing the initial evidence bundle.',
      detail:
        'Reporter supplied timestamps and described repeated instant snapping between targets during a Dark Zone extraction fight.',
      incidentAt: INCIDENT_AT,
    },
  });

  const evidence = await prisma.evidence.create({
    data: {
      caseId: seededCase.id,
      uploadedById: analyst.id,
      title: 'Dark Zone clip - extraction fight',
      description:
        'Primary evidence clip covering the encounter that triggered the case.',
      evidenceType: 'VIDEO',
      status: 'PENDING_REVIEW',
      capturedAt: CAPTURED_AT,
      metadata: {
        durationSeconds: 47,
        source: 'player_upload',
        suspectedBehavior: ['snap_tracking', 'pre_aim'],
        accusedSubjectId: accusedSubject.id,
      },
    },
  });

  await prisma.attachment.create({
    data: {
      evidenceId: evidence.id,
      fileName: 'dz-extraction-fight.mp4',
      mimeType: 'video/mp4',
      sizeBytes: 24873912,
      storageKey: `seed/evidence/${evidence.id}/dz-extraction-fight.mp4`,
      storageUrl: `/uploads/evidence/${evidence.id}/dz-extraction-fight.mp4`,
    },
  });

  const pinnedNote = await prisma.note.create({
    data: {
      caseId: seededCase.id,
      authorId: reviewer.id,
      body:
        'Initial review: clip quality is sufficient for manual verification. Keep this note pinned until verdict is finalized.',
      isPinned: true,
      visibility: 'INTERNAL',
    },
  });

  await prisma.note.create({
    data: {
      caseId: seededCase.id,
      authorId: analyst.id,
      body:
        'Cross-referenced the automated report timing with the uploaded clip. The engagement timeline matches the player submission.',
      isPinned: false,
      visibility: 'RESTRICTED',
    },
  });

  await prisma.attachment.create({
    data: {
      noteId: pinnedNote.id,
      fileName: 'review-checklist.txt',
      mimeType: 'text/plain',
      sizeBytes: 812,
      storageKey: `seed/notes/${pinnedNote.id}/review-checklist.txt`,
      storageUrl: `/uploads/notes/${pinnedNote.id}/review-checklist.txt`,
    },
  });

  const verdict = await prisma.verdict.create({
    data: {
      caseId: seededCase.id,
      sanctionTemplateId: sevenDaySuspension.id,
      renderedById: reviewer.id,
      rationale:
        'Evidence supports suspicious precision and tracking, but the sample size remains limited. Applying a temporary suspension pending further monitoring.',
      effectiveAt: EFFECTIVE_AT,
      expiresAt: EXPIRES_AT,
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: analyst.id,
        caseId: seededCase.id,
        action: 'CASE_CREATED',
        entityType: 'Case',
        entityId: automatedReport.id,
        after: {
          status: 'UNDER_REVIEW',
          priority: 'HIGH',
        },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
      {
        actorId: systemIngestUser.id,
        caseId: seededCase.id,
        action: 'REPORT_INGESTED',
        entityType: 'Report',
        entityId: verdict.id,
        after: {
          source: 'in-game-report',
          incidentAt: INCIDENT_AT.toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
      {
        actorId: analyst.id,
        caseId: seededCase.id,
        action: 'EVIDENCE_UPLOADED',
        entityType: 'Evidence',
        entityId: evidence.id,
        after: {
          evidenceType: 'VIDEO',
          storageUrl: `/uploads/evidence/${evidence.id}/dz-extraction-fight.mp4`,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
      {
        actorId: reviewer.id,
        caseId: seededCase.id,
        action: 'VERDICT_RENDERED',
        entityType: 'Verdict',
        entityId: seededCase.id,
        before: {
          status: 'UNDER_REVIEW',
        },
        after: {
          sanction: sevenDaySuspension.slug,
          effectiveAt: EFFECTIVE_AT.toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
    ],
  });

  console.log(`Created Game: ${game.slug}`);
  console.log(`Created Users: ${analyst.email}, ${reviewer.email}, ${systemIngestUser.email}`);
  console.log(`Created Platforms: ${ubisoftConnect.slug}, ${xboxLive.slug}`);
  console.log(`Created Example Case: ${seededCase.caseNumber}`);
  console.log('🌱 Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
