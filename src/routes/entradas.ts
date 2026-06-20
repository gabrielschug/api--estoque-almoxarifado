import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const entradaSchema = z.object({
  data: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD")
    .transform((value) => new Date(value))
    .refine((date) => !isNaN(date.getTime()), 
    {message: "Data inválida"}),
  numDocumento: z.number().positive().optional(),
  fornecedorId: z.number().positive(),
  produtoId: z.number().positive(),
  quant: z.number().positive({ message: "Quantidade deve ser positiva" }),
  observacoes: z.string().optional()
})

router.get("/", async (req, res) => {
  try {
    const entradas = await prisma.entrada.findMany({
      include:{fornecedor: true, produto: true },
      orderBy: {id: 'desc'}
    })
    res.status(200).json(entradas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = entradaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { data, numDocumento, fornecedorId, produtoId, quant, observacoes } = valida.data

  // pesquisa para validar o fornecedor (recebe-se apenas id)
  const dadoFornecedor = await prisma.fornecedor.findUnique({
    where: { id: fornecedorId }
  })

  if (!dadoFornecedor) {
    res.status(400).json({ erro: "Erro... codigo do fornecedor inválido" })
    return
  }

  // pesquisa para validar o produto (recebe-se apenas id)
  const dadoProduto = await prisma.produto.findUnique({
    where: { id: produtoId }
  })

  if (!dadoProduto) {
    res.status(400).json({ erro: "Erro... Código do produto inválido" })
    return
  }


  try {
    const [entrada, produto] = await prisma.$transaction([
      prisma.entrada.create({
        data: { data, numDocumento, fornecedorId, produtoId, quant, observacoes }
      }),
      prisma.produto.update({
        where: { id: produtoId },
        data: { quant: { increment: quant } }
      })
    ])
    res.status(201).json({ entrada, produto })
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
  // VALIDAÇÃO DE FORMATO (zod)
  const { id } = req.params
  const valida = entradaSchema.safeParse(req.body)
  
  if (!valida.success) {
      res.status(400).json({ erro: valida.error })
      return
  }
  const { data, numDocumento, fornecedorId, produtoId, quant, observacoes } = valida.data
  
  // VALIDAÇÃO DE RELACIONAMENTOS
  const dadoFornecedor = await prisma.fornecedor.findUnique({
    where: { id: fornecedorId }
  })
  if (!dadoFornecedor) {
    res.status(400).json({ erro: "Erro... codigo do fornecedor inválido" })
    return
  }
  const dadoProduto = await prisma.produto.findUnique({
    where: { id: produtoId }
  })
  if (!dadoProduto) {
    res.status(400).json({ erro: "Erro... Código do produto inválido" })
    return
  }

  const entradaOriginal = await prisma.entrada.findUnique({
    where: {id: Number(id)}
  }) 
  if (!entradaOriginal) {
    res.status(400).json({ erro: "Entrada não encontrada no sistema"})
    return
  }

  // EXECUÇÃO DA TRANSACTION
  try {
    if (entradaOriginal.produtoId !== valida.data.produtoId) {
      // Produto alterado
      const dadoProdutoEntradaOriginal = await prisma.produto.findUnique({
      where: {id: entradaOriginal.produtoId}
      })
      if (!dadoProdutoEntradaOriginal) {
        res.status(400).json({ erro: "Produto não encontrada no sistema"})
      return
      }

      const diferencaQuantEntradaOriginal = dadoProdutoEntradaOriginal.quant - entradaOriginal.quant
      if (diferencaQuantEntradaOriginal < 0) {
      res.status(400).json({erro: "Não há estoque suficiente para permitir esta alteraçao."})
      return
      }
      
      const [entradaAtualizada, produtoAntigoAtualizado, produtoNovoAtualizado] = await prisma.$transaction([
        prisma.entrada.update({
            where: { id: Number(id) },
            data: valida.data
        }),
        prisma.produto.update({
          where: { id: entradaOriginal.produtoId },
          data: { quant: {decrement: entradaOriginal.quant} }
        }),
        prisma.produto.update({
          where: {id: produtoId},
          data: {quant: {increment: quant}}
        })
      ])
      res.status(200).json([entradaAtualizada, produtoAntigoAtualizado, produtoNovoAtualizado])
    } else {
      // Produto não alterado
        const diferencaQuant = valida.data.quant - entradaOriginal.quant 

      // Validação para não aceitar saldo negativo
      const saldoFinal = dadoProduto.quant + diferencaQuant 
      if (saldoFinal < 0) {
        res.status(400).json({erro: "Não há estoque suficiente para permitir esta alteraçao."})
        return
      }

      const [entradaAtualizada, produtoAtualizado] = await prisma.$transaction([
        prisma.entrada.update({
            where: { id: Number(id) },
            data: valida.data
        }),
        prisma.produto.update({
          where: { id: produtoId },
          data: { quant: {increment: diferencaQuant} }
        })
      ])
      res.status(200).json([entradaAtualizada, produtoAtualizado])
    }
      
  } catch (error) {
      res.status(500).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const entradaId = Number(id)

  if (isNaN(entradaId)) {
    res.status(400).json({ erro: "ID da entrada deve ser um número válido" })
    return
  }

  try {
    const entrada = await prisma.entrada.findUnique({
      where: { id: entradaId }
    })

    if (!entrada) {
      res.status(404).json({ erro: "Entrada não encontrada" })
      return
    }

    const [entradaDeletada, produtoAtualizado] = await prisma.$transaction([
      prisma.entrada.delete({
        where: { id: entradaId }
      }),
      prisma.produto.update({
        where: { id: entrada.produtoId },
        data: { quant: { decrement: entrada.quant } }
      })
    ])

    res.status(200).json({ 
      mensagem: "Transação desfeita com sucesso", 
      entradaDeletada, 
      produtoAtualizado 
    })
    
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao deletar a transação", detalhes: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const entradaId = Number(id)

  try {
    const entrada = await prisma.entrada.findUnique({
      where: { id: entradaId },
      include:{
        fornecedor: true,
        produto: true
      }
    })

    if (!entrada) {
      res.status(404).json({ erro: "Entrada não encontrada" })
      return
    }


    res.status(200).json(entrada)
    
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao  buscar a transação", detalhes: error })
  }
})

export default router
