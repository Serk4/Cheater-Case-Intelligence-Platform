/*
  Warnings:

  - A unique constraint covering the columns `[shortCode]` on the table `games` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortCode` to the `games` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "games" ADD COLUMN "shortCode" TEXT;
UPDATE "games" SET "shortCode" = 'TEMP';
ALTER TABLE "games" ALTER COLUMN "shortCode" SET NOT NULL;
CREATE UNIQUE INDEX "games_shortCode_key" ON "games"("shortCode");

