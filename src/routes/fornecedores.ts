import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { z } from 'zod'
import { VerificaHorario } from "../middlewares/verificaHorario"
import { VerificaToken } from "../middlewares/verificaToken"

const router = Router()

const fornecedorSchema = z.object({
    razao_social: z.string()
    .min(3, 'Razão Social deve possuir no mínimo com 3 caracteres')
    .max(40, 'Razão Social deve ter no máximo 40 caracteres')
})

router.get("/", VerificaToken, async (req, res) => {
    try {
        const fornecedores = await prisma.fornecedor.findMany()
        res.status(200).json(fornecedores)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", VerificaToken, VerificaHorario, async (req, res) => {
    const valida = fornecedorSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const razao_social = valida.data

    try {
        const fornec = await prisma.fornecedor.create({
            data: razao_social 
        })
        res.status(201).json(fornec)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const valida = fornecedorSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const razao_social = valida.data

    try {
        const fornecedor = await prisma.fornecedor.update({
            where: { id: Number(id) },
            data: razao_social
        })
        res.status(200).json(fornecedor)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // realiza a exclusão da seleção
    try {
        const fornecedor = await prisma.fornecedor.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(fornecedor)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const fornecedorId = Number(id)

    try {
        const fornecedor = await prisma.fornecedor.findUnique({
            where: { id: fornecedorId}
        })

        if (!fornecedor) {
        res.status(404).json({ erro: "Fornecedor não encontrado" })
        return
        }

        res.status(200).json(fornecedor)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados deste fornecedor", detalhes: error })
    }
})

export default router
