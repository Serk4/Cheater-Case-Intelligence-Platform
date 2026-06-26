-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "evidenceId" TEXT;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
