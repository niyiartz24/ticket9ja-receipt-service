-- AlterTable
ALTER TABLE "WalletHistory" ADD COLUMN     "collegeId" TEXT,
ADD COLUMN     "departmentId" TEXT;

-- CreateIndex
CREATE INDEX "WalletHistory_collegeId_idx" ON "WalletHistory"("collegeId");

-- CreateIndex
CREATE INDEX "WalletHistory_departmentId_idx" ON "WalletHistory"("departmentId");

-- AddForeignKey
ALTER TABLE "WalletHistory" ADD CONSTRAINT "WalletHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletHistory" ADD CONSTRAINT "WalletHistory_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletHistory" ADD CONSTRAINT "WalletHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
