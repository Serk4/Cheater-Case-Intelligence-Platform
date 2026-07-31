-- CreateTable
CREATE TABLE "case_number_counters" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_number_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_number_counters_gameId_date_idx" ON "case_number_counters"("gameId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "case_number_counters_gameId_date_key" ON "case_number_counters"("gameId", "date");
