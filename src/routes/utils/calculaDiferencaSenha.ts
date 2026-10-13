export function calculaDiferencaSenha (senhaAntiga:string, novaSenha:string) {
  
  let numDiferencas = Math.abs(senhaAntiga.length - novaSenha.length)
  const tamanhoMenor = Math.min(senhaAntiga.length, novaSenha.length)
  
  for (let i = 0; i < tamanhoMenor; i++){
    if (senhaAntiga[i] !== novaSenha[i]) numDiferencas++
  }
  return numDiferencas
}