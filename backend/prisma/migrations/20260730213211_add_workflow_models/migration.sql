-- CreateTable
CREATE TABLE "workflow_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "gameId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_assignments" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "previousUserId" TEXT,
    "newUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_transition_logs" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromStatus" "CaseStatus" NOT NULL,
    "toStatus" "CaseStatus" NOT NULL,
    "reason" TEXT,
    "validationMeta" JSONB,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_transition_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_rules_gameId_idx" ON "workflow_rules"("gameId");

-- CreateIndex
CREATE INDEX "workflow_rules_ruleType_idx" ON "workflow_rules"("ruleType");

-- CreateIndex
CREATE INDEX "workflow_rules_enabled_idx" ON "workflow_rules"("enabled");

-- CreateIndex
CREATE INDEX "workflow_rules_priority_idx" ON "workflow_rules"("priority");

-- CreateIndex
CREATE INDEX "case_assignments_caseId_idx" ON "case_assignments"("caseId");

-- CreateIndex
CREATE INDEX "case_assignments_newUserId_idx" ON "case_assignments"("newUserId");

-- CreateIndex
CREATE INDEX "case_assignments_changedAt_idx" ON "case_assignments"("changedAt");

-- CreateIndex
CREATE INDEX "status_transition_logs_caseId_idx" ON "status_transition_logs"("caseId");

-- CreateIndex
CREATE INDEX "status_transition_logs_toStatus_idx" ON "status_transition_logs"("toStatus");

-- CreateIndex
CREATE INDEX "status_transition_logs_changedAt_idx" ON "status_transition_logs"("changedAt");

-- AddForeignKey
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_previousUserId_fkey" FOREIGN KEY ("previousUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_newUserId_fkey" FOREIGN KEY ("newUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_transition_logs" ADD CONSTRAINT "status_transition_logs_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_transition_logs" ADD CONSTRAINT "status_transition_logs_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
