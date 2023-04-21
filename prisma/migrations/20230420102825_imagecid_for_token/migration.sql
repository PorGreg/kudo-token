/*
  Warnings:

  - Added the required column `imageCid` to the `MintedToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MintedToken" ADD COLUMN     "imageCid" TEXT NOT NULL;
