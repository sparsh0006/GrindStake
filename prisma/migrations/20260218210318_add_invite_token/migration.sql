/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `challenges` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "inviteToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "challenges_inviteToken_key" ON "challenges"("inviteToken");
