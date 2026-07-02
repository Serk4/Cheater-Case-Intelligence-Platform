import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CASE_NUMBER = 'CASE-TD2-0001'
const OPENED_AT = new Date('2026-06-15T14:30:00.000Z')
const INCIDENT_AT = new Date('2026-06-15T13:42:00.000Z')
const CAPTURED_AT = new Date('2026-06-15T13:40:12.000Z')
const EFFECTIVE_AT = new Date('2026-06-16T10:00:00.000Z')
const EXPIRES_AT = new Date('2026-06-23T10:00:00.000Z')

async function main() {
	console.log('🌱 Seeding database...')

	await prisma.attachment.deleteMany()
	await prisma.auditLog.deleteMany()
	await prisma.verdict.deleteMany()
	await prisma.note.deleteMany()
	await prisma.evidence.deleteMany()
	await prisma.report.deleteMany()
	await prisma.caseViolationType.deleteMany()
	await prisma.subject.deleteMany()
	await prisma.case.deleteMany()

	// Games
	// =========================
	// Tom Clancy's The Division 2
	// =========================
	const td2 = await prisma.game.upsert({
		where: { slug: 'the-division-2' },
		update: {
			shortCode: 'TD2',
			name: "Tom Clancy's The Division 2",
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
			shortCode: 'TD2',
			name: "Tom Clancy's The Division 2",
			slug: 'the-division-2',
			logoUrl: 'https://example.com/logos/the-division-2.png',
			metadata: {
				publisher: 'Ubisoft',
				engine: 'Snowdrop',
				supportedRegions: ['NA', 'EU', 'APAC'],
				moderationTier: 'pilot',
			},
			isActive: true,
		},
	})

	console.log(`Created Game: ${td2.slug} (${td2.name})`)

	// =========================
	// Tom Clancy's Rainbow Six Siege
	// =========================
	const r6 = await prisma.game.upsert({
		where: { slug: 'rainbow-six-siege' },
		update: {
			shortCode: 'R6',
			name: "Tom Clancy's Rainbow Six Siege",
			logoUrl: 'https://example.com/logos/rainbow-six-siege.png',
			metadata: {
				publisher: 'Ubisoft',
				engine: 'AnvilNext 2.0',
				supportedRegions: ['NA', 'EU', 'LATAM', 'APAC'],
				moderationTier: 'production',
			},
			isActive: true,
		},
		create: {
			shortCode: 'R6',
			name: "Tom Clancy's Rainbow Six Siege",
			slug: 'rainbow-six-siege',
			logoUrl: 'https://example.com/logos/rainbow-six-siege.png',
			metadata: {
				publisher: 'Ubisoft',
				engine: 'AnvilNext 2.0',
				supportedRegions: ['NA', 'EU', 'LATAM', 'APAC'],
				moderationTier: 'production',
			},
			isActive: true,
		},
	})

	console.log(`Created Game: ${r6.slug} (${r6.name})`)

	// Users
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
	})

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
	})

	const systemIngestUser = await prisma.user.upsert({
		where: { email: 'system-ingest@ccip.local' },
		update: {
			displayName: 'System Report Ingest',
			role: 'ANALYST',
			isActive: true,
		},
		create: {
			id: 'system-ingest-user', // ⭐ FIXED ID
			email: 'system-ingest@ccip.local',
			displayName: 'System Report Ingest',
			role: 'ANALYST',
			isActive: true,
		},
	})

	console.log(
		`Created Users: ${analyst.email}, ${reviewer.email}, ${systemIngestUser.email}`,
	)

	// Platforms
	const ubisoftConnect = await prisma.platform.upsert({
		where: { slug: 'ubisoft-connect' },
		update: {
			gameId: td2.id,
			name: 'Ubisoft Connect',
			profileUrlTemplate:
				'https://ubisoftconnect.com/en-US/profile/{{externalId}}',
			isActive: true,
		},
		create: {
			gameId: td2.id,
			name: 'Ubisoft Connect',
			slug: 'ubisoft-connect',
			profileUrlTemplate:
				'https://ubisoftconnect.com/en-US/profile/{{externalId}}',
		},
	})

	const xboxLive = await prisma.platform.upsert({
		where: { slug: 'xbox-live' },
		update: {
			gameId: r6.id,
			name: 'Xbox Live',
			profileUrlTemplate:
				'https://account.xbox.com/en-us/profile?gamertag={{externalId}}',
			isActive: true,
		},
		create: {
			gameId: r6.id,
			name: 'Xbox Live',
			slug: 'xbox-live',
			profileUrlTemplate:
				'https://account.xbox.com/en-us/profile?gamertag={{externalId}}',
		},
	})

	const playStationNetwork = await prisma.platform.upsert({
		where: { slug: 'psn' },
		update: {
			gameId: r6.id,
			name: 'PlayStation Network',
			profileUrlTemplate: 'https://psnprofiles.com/{{externalId}}',
			isActive: true,
		},
		create: {
			gameId: r6.id,
			name: 'PlayStation Network',
			slug: 'psn',
			profileUrlTemplate: 'https://psnprofiles.com/{{externalId}}',
		},
	})

	console.log(
		`Created Platforms: ${ubisoftConnect.slug}, ${xboxLive.slug}, ${playStationNetwork.slug}`,
	)

	// Violation Types
	const aimbot = await prisma.violationType.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Aimbot',
			slug: 'aimbot',
			description: 'Automated aiming assistance.',
			severity: 'HIGH',
			color: '#DC2626',
		},
	})

	const wallhack = await prisma.violationType.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Wallhack',
			slug: 'wallhack',
			description: 'Seeing players through walls or geometry.',
			severity: 'HIGH',
			color: '#F97316',
		},
	})

	const exploiting = await prisma.violationType.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Exploiting',
			slug: 'exploiting',
			description: 'Abusing unintended game mechanics or map states.',
			severity: 'MEDIUM',
			color: '#EAB308',
		},
	})

	const lagSwitch = await prisma.violationType.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
				slug: 'lag-switch',
			},
		},
		update: {
			name: 'Lag Switch',
			description: 'Intentionally inducing latency to gain an advantage.',
			severity: 'MEDIUM',
			color: '#3B82F6', // blue-ish for network-related issues
			isActive: true,
		},
		create: {
			gameId: r6.id,
			name: 'Lag Switch',
			slug: 'lag-switch',
			description: 'Intentionally inducing latency to gain an advantage.',
			severity: 'MEDIUM',
			color: '#3B82F6',
		},
	})

	console.log(
		`Created Violation Types: ${aimbot.slug}, ${wallhack.slug}, ${lagSwitch.slug}, ${exploiting.slug}`,
	)

	// Sanction Templates
	const permanentBan = await prisma.sanctionTemplate.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Permanent Ban',
			slug: 'permanent-ban',
			description: 'Permanent account ban for confirmed severe cheating.',
			durationDays: null,
			isAppealable: false,
		},
	})

	const sevenDaySuspension = await prisma.sanctionTemplate.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: '7-Day Suspension',
			slug: '7-day-suspension',
			description: 'Temporary suspension for moderate or first-time offenses.',
			durationDays: 7,
			isAppealable: true,
		},
	})

	const warning = await prisma.sanctionTemplate.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Warning',
			slug: 'warning',
			description: 'Non-punitive warning for low-confidence or minor issues.',
			durationDays: 0,
			isAppealable: true,
		},
	})

	console.log(
		`Created Sanction Templates: ${permanentBan.slug}, ${sevenDaySuspension.slug}, ${warning.slug}`,
	)

	// Integration Sources
	const inGameReport = await prisma.integrationSource.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'In-Game Report System',
			slug: 'in-game-report',
			webhookUrl: null,
			apiKeyHash: null,
		},
	})

	const customerSupportPortal = await prisma.integrationSource.upsert({
		where: {
			gameId_slug: {
				gameId: r6.id,
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
			gameId: r6.id,
			name: 'Customer Support Portal',
			slug: 'customer-support-portal',
			webhookUrl: null,
			apiKeyHash: null,
		},
	})

	console.log(
		`Created Integration Sources: ${inGameReport.slug}, ${customerSupportPortal.slug}`,
	)

	// ─────────────────────────────────────────
	// Seeded Case Creation and Associations
	// ─────────────────────────────────────────

	const seededCase = await prisma.case.create({
		data: {
			gameId: r6.id,
			caseNumber: CASE_NUMBER,
			title: 'DZ landmark engagement flagged for precision tracking',
			description:
				'Multiple reports allege that the accused player demonstrated impossible target tracking and pre-aim behavior during a Dark Zone encounter.',
			status: 'UNDER_REVIEW',
			priority: 'HIGH',
			assignedToId: systemIngestUser.id,
			openedById: analyst.id,
			openedAt: OPENED_AT,
			metadata: {
				map: 'Dark Zone East',
				region: 'NA',
				squadSize: 2,
				confidenceBand: 'medium-high',
			},
		},
	})

	// ─────────────────────────────────────────
	// SUBJECTS
	// ─────────────────────────────────────────

	const accusedSubject = await prisma.subject.create({
		data: {
			platformId: xboxLive.id,
			displayName: 'AccusedPlayer123',
			externalId: 'UCONN-001-ACCUSED',
			profileUrl: 'https://account.xbox.com/en-us/profile?gamertag=UCONN-001-ACCUSED',
			metadata: {
				roleInCase: 'accused',
				clanTag: 'RGE',
			},
		},
	})

	await prisma.subject.create({
		data: {
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
	})

	// ─────────────────────────────────────────
	// VIOLATION TYPES (CASE ↔ VIOLATION)
	// ─────────────────────────────────────────

	await prisma.caseViolationType.createMany({
		data: [
			{ caseId: seededCase.id, violationTypeId: aimbot.id },
			{ caseId: seededCase.id, violationTypeId: wallhack.id },
			{ caseId: seededCase.id, violationTypeId: lagSwitch.id }, // NEW
		],
	})

	// ─────────────────────────────────────────
	// REPORTS
	// ─────────────────────────────────────────

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
	})

	await prisma.report.create({
		data: {
			caseId: seededCase.id,
			reportedById: analyst.id,
			summary:
				'Manual analyst follow-up created after reviewing the initial evidence bundle.',
			detail:
				'Reporter supplied timestamps and described repeated instant snapping between targets during a Dark Zone extraction fight.',
			incidentAt: INCIDENT_AT,
		},
	})

	// ─────────────────────────────────────────
	// EVIDENCE + ATTACHMENTS
	// ─────────────────────────────────────────

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
	})

	await prisma.attachment.create({
		data: {
			evidenceId: evidence.id,
			fileName: 'dz-extraction-fight.mp4',
			mimeType: 'video/mp4',
			sizeBytes: 24873912,
			storageKey: `seed/evidence/${evidence.id}/dz-extraction-fight.mp4`,
			storageUrl: `/uploads/evidence/${evidence.id}/dz-extraction-fight.mp4`,
		},
	})

	// ─────────────────────────────────────────
	// NOTES (Case-level, Evidence-level, Pinned, Restricted)
	// ─────────────────────────────────────────

	// Pinned case note
	const pinnedCaseNote = await prisma.note.create({
		data: {
			caseId: seededCase.id,
			authorId: reviewer.id,
			body: 'Initial review: clip quality is sufficient for manual verification. Keep this note pinned until verdict is finalized.',
			isPinned: true,
			visibility: 'INTERNAL',
		},
	})

	// Case-level note
	await prisma.note.create({
		data: {
			caseId: seededCase.id,
			authorId: reviewer.id,
			body: 'Initial triage complete. Evidence appears valid and relevant.',
			visibility: 'INTERNAL',
		},
	})

	// Restricted note
	await prisma.note.create({
		data: {
			caseId: seededCase.id,
			evidenceId: evidence.id,
			authorId: systemIngestUser.id,
			body: 'Possible repeat offender. Cross-reference with Case #TD2-0042.',
			visibility: 'RESTRICTED',
		},
	})

	// Evidence-level note with attachment
	await prisma.note.create({
		data: {
			caseId: seededCase.id,
			evidenceId: evidence.id,
			authorId: analyst.id,
			body: 'Screenshot shows unusual player movement at timestamp 00:14.',
			visibility: 'INTERNAL',
			attachments: {
				create: [
					{
						fileName: 'movement-analysis.txt',
						mimeType: 'text/plain',
						sizeBytes: 42,
						storageKey: `seed/notes/movement-analysis.txt`,
						storageUrl: `/uploads/notes/movement-analysis.txt`,
					},
				],
			},
		},
	})

	// Attachment for pinned note
	await prisma.attachment.create({
		data: {
			noteId: pinnedCaseNote.id,
			fileName: 'review-checklist.txt',
			mimeType: 'text/plain',
			sizeBytes: 812,
			storageKey: `seed/notes/${pinnedCaseNote.id}/review-checklist.txt`,
			storageUrl: `/uploads/notes/${pinnedCaseNote.id}/review-checklist.txt`,
		},
	})

	// ─────────────────────────────────────────
	// VERDICT
	// ─────────────────────────────────────────

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
	})

	console.log(
		`Created Case: ${seededCase.caseNumber}
   openedBy=${analyst.id}
   assignedTo=${systemIngestUser.id}
   report=${automatedReport.id}
   evidence=${evidence.id}
   verdict=${verdict.id}`,
	)

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
				entityId: automatedReport.id,
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
				entityId: verdict.id,
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
	})

	console.log('🌱 Seed completed successfully.')
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
