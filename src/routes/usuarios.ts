import { prisma } from "../../lib/prisma";
import { Router } from "express";
import { z } from 'zod'
import { validaSenha } from "./utils/validaSenha";
import { geraSenha } from "./utils/geraSenha";
import { VerificaToken } from "../middlewares/verificaToken";

const router = Router()

const usuarioSchema = z.object({
  nome: z.string().min(10, {message: "Nome deve possuir, no mínimo 10 caracteres"}),
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
  senha: z.string(),
  nivel: z.number().min(1, {message: "Informe um nível de 1 à 3."}).max(3, {message: "Informe um nível de 1 à 3."})
})

router.get("/", VerificaToken, async (req, res) =>{

  try {
    const usuarios = await prisma.usuario.findMany({
      omit: {
        senha: true
      }
    })

    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})

router.post("/", async (req, res) => {

  const valida = usuarioSchema.safeParse(req.body)
  if(!valida.success) {
    res.status(400).json({ erro: z.flattenError(valida.error) })
    return
  }

  const { nome, email, senha, nivel } = valida.data

  const mensagemErros = validaSenha(senha)

  if(mensagemErros.length > 0) {
    res.status(400).json({erro:mensagemErros})
    return
  }
  
  const hash = geraSenha(senha)

  try {
    const  usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash, nivel }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({error})
  }
})

router.put("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const valida = usuarioSchema.partial().safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const { nome, email, senha, nivel } = valida.data
    
    let senhaCriptografada
    if (senha) {
      senhaCriptografada = geraSenha(senha)
    }

    try {
        const usuario = await prisma.usuario.update({
            where: { id: Number(id) },
            data: { nome, email, senha: senhaCriptografada, nivel}
        })
        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar o usuário." })
    }
})

router.delete("/:id", VerificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.update({
      where: {id: Number(id)},
      data: {deleted: true, deletedAt: new Date()}
    })

    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.get("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const usuarioId = Number(id)

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId}
        })

        if (!usuario) {
        res.status(404).json({ erro: "Usuário não encontrado." })
        return
        }

        res.status(200).json(usuario)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados deste usuário.", detalhes: error })
    }
})

export default router