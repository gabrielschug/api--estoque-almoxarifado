import bcrypt from 'bcrypt'

export function geraSenha (senha:string) {
  const salt= bcrypt.genSaltSync(12)

  const hash = bcrypt.hashSync(senha, salt)

  return hash
}