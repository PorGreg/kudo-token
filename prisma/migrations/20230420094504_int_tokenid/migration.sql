/*
  Warnings:

  - The `tokenId` column on the `MintedTokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MintedTokens" DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" INTEGER;
