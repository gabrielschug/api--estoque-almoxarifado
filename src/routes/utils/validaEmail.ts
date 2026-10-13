import { prisma } from "../../../lib/prisma";
export async function validaEmail(email: string) {
  
  const validador = await prisma.usuario.findUnique({
    where: {email: email}
  })
  return !!validador
}