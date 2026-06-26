import { prisma } from "../../lib/prisma";
import { Router } from "express";
import { z } from 'zod'
import bcrypt from 'bcrypt'

const router = Router()

const usuarioSchema = z.object({
  nome: z.string().min(10, {message: "Nome deve possuir, no mínimo 10 caracteres"}),
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
  senha: z.string()
})

router.get("/", async (req, res) =>{

  try {
    const usuarios = await prisma.usuario.findMany()

    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})

function validaSenha(senha: string) {
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
    if ((/[a-z]/).test(letra)) {
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

router.post("/", async (req, res) => {

  const valida = usuarioSchema.safeParse(req.body)
  if(!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, email, senha } = valida.data

  const mensagemErros = validaSenha(senha)

  if(mensagemErros.length > 0) {
    res.status(400).json({erro:mensagemErros})
    return
  }
  
  const salt= bcrypt.genSaltSync(12)

  const hash = bcrypt.hashSync(senha, salt)

  try {
    const  usuario = await prisma.usuario.create({
      data: { nome, email, senha:hash }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({error})
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.delete({
      where: {id: Number(id)}
    })

    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})


export default router