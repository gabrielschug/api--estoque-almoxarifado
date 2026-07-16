-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "bloqueado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tentativasFalhas" INTEGER NOT NULL DEFAULT 0;
