-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VIEWER', 'ANALYST', 'SENIOR_ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'PENDING_EVIDENCE', 'ESCALATED', 'CLOSED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('SCREENSHOT', 'VIDEO', 'LOG_FILE', 'REPLAY_FILE', 'EXTERNAL_REPORT', 'API_DATA', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'DISPUTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INTERNAL', 'RESTRICTED', 'CONFIDENTIAL');

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "gameId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "profileUrlTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation_types" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "severity" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_violation_types" (
    "caseId" TEXT NOT NULL,
    "violationTypeId" TEXT NOT NULL,

    CONSTRAINT "case_violation_types_pkey" PRIMARY KEY ("caseId","violationTypeId")
);

-- CreateTable
CREATE TABLE "sanction_templates" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER,
    "isAppealable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sanction_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_sources" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "apiKeyHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "openedById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "externalId" TEXT,
    "profileUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "integrationSourceId" TEXT,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "incidentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evidenceType" "EvidenceType" NOT NULL DEFAULT 'OTHER',
    "status" "EvidenceStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "metadata" JSONB,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT,
    "noteId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verdicts" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sanctionTemplateId" TEXT NOT NULL,
    "renderedById" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verdicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "caseId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_slug_key" ON "platforms"("slug");

-- CreateIndex
CREATE INDEX "platforms_gameId_idx" ON "platforms"("gameId");

-- CreateIndex
CREATE INDEX "violation_types_gameId_idx" ON "violation_types"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "violation_types_gameId_slug_key" ON "violation_types"("gameId", "slug");

-- CreateIndex
CREATE INDEX "sanction_templates_gameId_idx" ON "sanction_templates"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_templates_gameId_slug_key" ON "sanction_templates"("gameId", "slug");

-- CreateIndex
CREATE INDEX "integration_sources_gameId_idx" ON "integration_sources"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_sources_gameId_slug_key" ON "integration_sources"("gameId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cases_caseNumber_key" ON "cases"("caseNumber");

-- CreateIndex
CREATE INDEX "cases_gameId_idx" ON "cases"("gameId");

-- CreateIndex
CREATE INDEX "cases_caseNumber_idx" ON "cases"("caseNumber");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_assignedToId_idx" ON "cases"("assignedToId");

-- CreateIndex
CREATE INDEX "cases_openedById_idx" ON "cases"("openedById");

-- CreateIndex
CREATE INDEX "cases_openedAt_idx" ON "cases"("openedAt");

-- CreateIndex
CREATE INDEX "subjects_caseId_idx" ON "subjects"("caseId");

-- CreateIndex
CREATE INDEX "subjects_platformId_idx" ON "subjects"("platformId");

-- CreateIndex
CREATE INDEX "subjects_externalId_idx" ON "subjects"("externalId");

-- CreateIndex
CREATE INDEX "reports_caseId_idx" ON "reports"("caseId");

-- CreateIndex
CREATE INDEX "reports_reportedById_idx" ON "reports"("reportedById");

-- CreateIndex
CREATE INDEX "reports_integrationSourceId_idx" ON "reports"("integrationSourceId");

-- CreateIndex
CREATE INDEX "reports_incidentAt_idx" ON "reports"("incidentAt");

-- CreateIndex
CREATE INDEX "evidence_caseId_idx" ON "evidence"("caseId");

-- CreateIndex
CREATE INDEX "evidence_uploadedById_idx" ON "evidence"("uploadedById");

-- CreateIndex
CREATE INDEX "evidence_evidenceType_idx" ON "evidence"("evidenceType");

-- CreateIndex
CREATE INDEX "evidence_status_idx" ON "evidence"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storageKey_key" ON "attachments"("storageKey");

-- CreateIndex
CREATE INDEX "attachments_evidenceId_idx" ON "attachments"("evidenceId");

-- CreateIndex
CREATE INDEX "attachments_noteId_idx" ON "attachments"("noteId");

-- CreateIndex
CREATE INDEX "notes_caseId_idx" ON "notes"("caseId");

-- CreateIndex
CREATE INDEX "notes_authorId_idx" ON "notes"("authorId");

-- CreateIndex
CREATE INDEX "notes_isPinned_idx" ON "notes"("isPinned");

-- CreateIndex
CREATE UNIQUE INDEX "verdicts_caseId_key" ON "verdicts"("caseId");

-- CreateIndex
CREATE INDEX "verdicts_caseId_idx" ON "verdicts"("caseId");

-- CreateIndex
CREATE INDEX "verdicts_sanctionTemplateId_idx" ON "verdicts"("sanctionTemplateId");

-- CreateIndex
CREATE INDEX "verdicts_effectiveAt_idx" ON "verdicts"("effectiveAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_caseId_idx" ON "audit_logs"("caseId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violation_types" ADD CONSTRAINT "violation_types_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_violation_types" ADD CONSTRAINT "case_violation_types_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_violation_types" ADD CONSTRAINT "case_violation_types_violationTypeId_fkey" FOREIGN KEY ("violationTypeId") REFERENCES "violation_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_templates" ADD CONSTRAINT "sanction_templates_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_sources" ADD CONSTRAINT "integration_sources_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_integrationSourceId_fkey" FOREIGN KEY ("integrationSourceId") REFERENCES "integration_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_sanctionTemplateId_fkey" FOREIGN KEY ("sanctionTemplateId") REFERENCES "sanction_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_renderedById_fkey" FOREIGN KEY ("renderedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
