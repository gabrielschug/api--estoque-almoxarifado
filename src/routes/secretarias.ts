import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { NOMEM } from "node:dns"
import { z } from 'zod'
import { VerificaHorario } from "../middlewares/verificaHorario"
import { VerificaToken } from "../middlewares/verificaToken"

const router = Router()

const secretariaSchema = z.object({
    nome: z.string()
    .min(3, 'Nome da Secretaria deve possuir no mínimo com 3 caracteres')
    .max(40, 'Nome da Secretaria deve ter no máximo 40 caracteres')
})

router.get("/", VerificaToken, async (req, res) => {
    try {
        const secretarias = await prisma.secretaria.findMany()
        res.status(200).json(secretarias)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", VerificaToken, VerificaHorario, async (req, res) => {
    const valida = secretariaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const nome = valida.data

    try {
        const nomeSec = await prisma.secretaria.create({
            data: nome 
        })
        res.status(201).json(nome)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const valida = secretariaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const { nome } = valida.data

    try {
        const secretaria = await prisma.secretaria.update({
            where: { id: Number(id) },
            data: { nome }
        })
        res.status(200).json(secretaria)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // realiza a exclusão da seleção
    try {
        const secretaria = await prisma.secretaria.update({
            where: { id: Number(id) },
            data: {deleted: true, deletedAt: new Date()}
        })
        res.status(200).json(secretaria)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const secretariaId = Number(id)

    try {
        const secretaria = await prisma.secretaria.findUnique({
            where: { id: secretariaId}
        })

        if (!secretaria) {
        res.status(404).json({ erro: "Secretaria não encontrada" })
        return
        }

        res.status(200).json(secretaria)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados desta secretaria", detalhes: error })
    }
})


export default router
