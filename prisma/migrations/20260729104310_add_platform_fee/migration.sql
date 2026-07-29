-- CreateTable
CREATE TABLE "PlatformFee" (
    "id" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL DEFAULT 1.50,
    "flat" DECIMAL(18,2) NOT NULL DEFAULT 50,
    "cap" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFee_pkey" PRIMARY KEY ("id")
);
