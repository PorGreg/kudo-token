/*
  Warnings:

  - Added the required column `contract` to the `MintedTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadataUri` to the `MintedTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `MintedTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MintedTokens" ADD COLUMN     "contract" TEXT NOT NULL,
ADD COLUMN     "metadataUri" TEXT NOT NULL,
ADD COLUMN     "tokenId" TEXT NOT NULL;
