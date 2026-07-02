/*
  Warnings:

  - You are about to drop the column `caseId` on the `subjects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_caseId_fkey";

-- DropIndex
DROP INDEX "subjects_caseId_idx";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "caseId";

-- CreateTable
CREATE TABLE "_CaseToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaseToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CaseToSubject_B_index" ON "_CaseToSubject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_externalId_key" ON "subjects"("externalId");

-- AddForeignKey
ALTER TABLE "_CaseToSubject" ADD CONSTRAINT "_CaseToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseToSubject" ADD CONSTRAINT "_CaseToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
