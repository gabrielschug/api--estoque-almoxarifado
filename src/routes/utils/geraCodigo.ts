import { randomInt } from "node:crypto"

export function geraCodigo() {
  const codigo = randomInt(9999).toString().padStart(4,"0")
  return codigo
}