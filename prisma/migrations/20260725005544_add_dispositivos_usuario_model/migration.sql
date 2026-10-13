-- CreateTable
CREATE TABLE "DispositivosUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "dispositivo" VARCHAR(500),

    CONSTRAINT "DispositivosUsuario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DispositivosUsuario" ADD CONSTRAINT "DispositivosUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
