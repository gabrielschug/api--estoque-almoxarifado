import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"
import { VerificaToken } from "../middlewares/verificaToken"
import { VerificaHorario } from "../middlewares/verificaHorario"

const router = Router()


const produtoSchema = z.object({
    nome: z.string().min(4,
        { message: "Nome do produto deve possuir, no mínimo, 4 caracteres." }).max(60,
            { message: "Nome do produto deve possuir, no máximo, 60 caracteres." }),
            preco: z.number().positive({ message: "Preço deve ser um valor positivo."}),
            categoria: z.string().min(4,
                { message: "A categoria deve possuir, no mínimo, 4 caracteres." }).max(40,
                    { message: "A categoria deve possuir, no máximo, 40 caracteres." }),
})

router.get("/", VerificaToken, VerificaToken, async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
        orderBy: {id: 'asc'}
    })
    res.status(200).json(produtos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", VerificaToken, VerificaHorario, async (req, res) => {
    const valida = produtoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const {nome, preco, categoria} = valida.data

    try {
        const prod = await prisma.produto.create({
            data: {nome, quant:0, preco, categoria} 
        })
        res.status(201).json(prod)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const valida = produtoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const {nome, preco, categoria} = valida.data

    // pesquisa para validar o produto (recebe-se apenas id)
  const dadoProduto = await prisma.produto.findUnique({
    where: { id: Number(id) }
  })

    try {
        const prod = await prisma.produto.update({
            where: { id: Number(id) },
            data: {nome, quant: dadoProduto?.quant, preco, categoria}
        })
        res.status(200).json(prod)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", VerificaToken, VerificaHorario, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    // realiza a exclusão da seleção
    try {
        const produto = await prisma.produto.update({
            where: { id: Number(id) },
            data: {deleted: true, deletedAt: new Date()}
        })
        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const produtoId = Number(id)

    try {
        const produto = await prisma.produto.findUnique({
            where: { id: produtoId}
        })

        if (!produto) {
        res.status(404).json({ erro: "Produto não encontrado" })
        return
        }

        res.status(200).json(produto)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados deste produto", detalhes: error })
    }
})


export default router
