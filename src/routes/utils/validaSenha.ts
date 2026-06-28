
export function validaSenha(senha: string) {
  const mensagem: string[] = []

  if (senha.length  < 8) {
    mensagem.push("Erro... Senha deve possuir, no mínimo, 8 caracteres.")
  }

  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  for (const letra of senha) {
    if ((/[a-z]/).test(letra)) {
      pequenas++
    }
    if ((/[A-Z]/).test(letra)) {
      grandes++
    }
    if ((/[a-z]/).test(letra)) {
      numeros++
    }
    if ((/\W|_/).test(letra)) {
      simbolos++
    }
  }

  if (pequenas == 0) {
    mensagem.push("Erro... senha deve possuir letras(s) minúscula(s)")
  }
  if (grandes == 0) {
    mensagem.push("Erro... senha deve possuir letras(s) maiúscula(s)")
  }
  if (numeros == 0) {
    mensagem.push("Erro... senha deve possuir número(s)")
  }
  if (simbolos == 0) {
    mensagem.push("Erro... senha deve possuir símbolos(s)")
  }

  return mensagem
}