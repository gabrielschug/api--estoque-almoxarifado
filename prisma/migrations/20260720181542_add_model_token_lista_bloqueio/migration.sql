-- CreateTable
CREATE TABLE "TokenListaBloqueio" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TokenListaBloqueio_pkey" PRIMARY KEY ("id")
);
