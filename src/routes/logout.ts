import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from 'zod'
import { VerificaToken } from "../middlewares/verificaToken"

const router = Router()

const emailSchema = z.object({
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
})

router.post("/", VerificaToken, async (req, res) => {
    //EXTRAIR TOKEN DO HEADER
    const { authorization } = req.headers
    
    if (!authorization) {
    res.status(401).json({erro: "Token não informado"})
    return
    }

    if (!req.userLogadoId) {
    res.status(401).json({erro: "Usuário não autenticado"})
    return
    }
    
    const token = authorization.split(" ")[1]    

    try {
    // SALVAR O TOKEN NO BANCO DE DADOS
    await prisma.tokenListaBloqueio.create({
        data: {
            token: token,
            usuarioId: req.userLogadoId
        }
    })
    res.status(200).json({msg: "Logout realizado com sucesso!"})
  } catch (error){
    console.error("Erro ao realizar logout:", error)
    res.status(400).json({erro: error})
  }
})

export default router