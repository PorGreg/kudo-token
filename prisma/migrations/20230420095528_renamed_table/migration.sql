/*
  Warnings:

  - You are about to drop the `MintedTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MintedTokens";

-- CreateTable
CREATE TABLE "MintedToken" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "contract" TEXT NOT NULL,
    "tokenId" INTEGER,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "dateMinted" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintedToken_pkey" PRIMARY KEY ("id")
);
