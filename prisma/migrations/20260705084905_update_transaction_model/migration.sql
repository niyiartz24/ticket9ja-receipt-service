/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "receiptSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reference" TEXT NOT NULL,
ALTER COLUMN "invoiceNumber" DROP NOT NULL,
ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "paymentDate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");
