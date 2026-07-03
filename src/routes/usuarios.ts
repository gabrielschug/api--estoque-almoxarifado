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
  senha: z.string()
})

router.get("/", VerificaToken, async (req, res) =>{

  try {
    const usuarios = await prisma.usuario.findMany()

    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})

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
  
  const hash = geraSenha(senha)

  try {
    const  usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({error})
  }
})

router.delete("/:id", VerificaToken, async (req, res) => {
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