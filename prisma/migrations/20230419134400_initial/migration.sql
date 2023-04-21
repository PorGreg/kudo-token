-- CreateTable
CREATE TABLE "MintedTokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "dateMinted" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintedTokens_pkey" PRIMARY KEY ("id")
);
