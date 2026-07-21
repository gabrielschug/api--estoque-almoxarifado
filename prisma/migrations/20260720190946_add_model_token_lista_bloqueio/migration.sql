/*
  Warnings:

  - You are about to drop the `TokenListaBloqueio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TokenListaBloqueio";

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);
