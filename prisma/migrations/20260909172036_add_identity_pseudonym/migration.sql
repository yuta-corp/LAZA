-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "identityId" TEXT;

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_fingerprint_key" ON "Identity"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_pseudo_key" ON "Identity"("pseudo");

-- CreateIndex
CREATE INDEX "Comment_identityId_idx" ON "Comment"("identityId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
