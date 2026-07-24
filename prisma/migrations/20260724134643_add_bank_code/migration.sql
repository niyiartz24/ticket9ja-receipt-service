/*
  Warnings:

  - Added the required column `bankCode` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "bankCode" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
