/*
  Warnings:

  - You are about to alter the column `defaultAmount` on the `PaymentType` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `DoublePrecision`.
  - Made the column `defaultAmount` on table `PaymentType` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentType" ADD COLUMN     "allowCustomAmount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "maximumAmount" DOUBLE PRECISION,
ADD COLUMN     "minimumAmount" DOUBLE PRECISION,
ALTER COLUMN "defaultAmount" SET NOT NULL,
ALTER COLUMN "defaultAmount" SET DATA TYPE DOUBLE PRECISION;
