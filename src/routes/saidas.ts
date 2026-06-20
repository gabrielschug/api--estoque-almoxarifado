import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import { error } from "node:console"
import { z } from 'zod'

const router = Router()

const saidaSchema = z.object({
  data: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD")
    .transform((value) => new Date(value))
    .refine((date) => !isNaN(date.getTime()), 
    {message: "Data inválida"}),
  secretariaId: z.number().positive(),
  produtoId: z.number().positive(),
  quant: z.number().positive({ message: "Quantidade deve ser positiva" }),
  observacoes: z.string().optional()
})

router.get("/", async (req, res) => {
  try {
    const saidas = await prisma.saida.findMany({
      include:{
        secretaria: true,
        produto: true
      }
    })
    res.status(200).json(saidas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = saidaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { data, secretariaId, produtoId, quant, observacoes } = valida.data

  // pesquisa para validar a secretaria (recebe-se apenas id)
  const dadoSecretaria = await prisma.secretaria.findUnique({
    where: { id: secretariaId }
  })

  if (!dadoSecretaria) {
    res.status(400).json({ erro: "Erro... Código da Secretaria inválido" })
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

  // verifica a quantidade em estoque 
  if (dadoProduto.quant < quant) {
    res.status(400).json({ erro: `Erro... Tem apenas ${dadoProduto.quant} unidades em estoque` })
    return
  }

  try {
    const [saida, produto] = await prisma.$transaction([
      prisma.saida.create({
        data: { data, secretariaId, produtoId, quant, observacoes  }
      }),
      prisma.produto.update({
        where: { id: produtoId },
        data: { quant: { decrement: quant } }
      })
    ])
    res.status(201).json({ saida, produto })
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.put("/:id", async (req, res) => {
  // VALIDAÇÃO DE FORMATO (zod)
  const { id } = req.params
  const valida = saidaSchema.safeParse(req.body)
  
  if (!valida.success) {
      res.status(400).json({ erro: valida.error })
      return
  }
  const { data, secretariaId, produtoId, quant, observacoes } = valida.data

  // VALIDAÇÃO DE RELACIONAMENTOS
  const dadoSecretaria = await prisma.secretaria.findUnique({
    where: { id: secretariaId }
  })
  if (!dadoSecretaria) {
    res.status(400).json({ erro: "Erro... codigo da Secretaria inválido" })
    return
  }
  const dadoProduto = await prisma.produto.findUnique({
    where: { id: produtoId }
  })
  if (!dadoProduto) {
    res.status(400).json({ erro: "Erro... Código do produto inválido" })
    return
  }

  const saidaOriginal = await prisma.saida.findUnique({
    where: {id: Number(id)}
  }) 
  if (!saidaOriginal) {
    res.status(400).json({ erro: "Saída não encontrada no sistema"})
    return
  }

  const novaQuantSaida = valida.data.quant
  const antigaQuantSaida = saidaOriginal.quant
  const estoqueAtual = dadoProduto.quant


  // EXECUÇÃO DA TRANSACTION
  try {
    
    if (saidaOriginal.produtoId !== valida.data.produtoId) {
      
      if (estoqueAtual - novaQuantSaida < 0) {
        res.status(400).json({erro: "Não há estoque suficiente para permitir esta alteraçao."})
        return
      }

      const [saidaAtualizada, produtoAntigoAtualizado, produtoNovoAtualizado] = await prisma.$transaction([
        prisma.saida.update({
            where: { id: Number(id) },
            data: valida.data
        }),
        prisma.produto.update({
          where: { id: saidaOriginal.produtoId },
          data: { quant: {increment: antigaQuantSaida} }
        }),
        prisma.produto.update({
          where: {id: produtoId},
          data: {quant: {decrement: novaQuantSaida}}
        })
      ])
      res.status(200).json([saidaAtualizada, produtoAntigoAtualizado, produtoNovoAtualizado])
    } else {
      // Produto não alterado
        const diferenca = novaQuantSaida - antigaQuantSaida

      // Validação para não aceitar saldo negativo
      const saldoFinal = estoqueAtual - diferenca 
      if (saldoFinal < 0) {
        res.status(400).json({erro: "Não há estoque suficiente para permitir esta alteraçao."})
        return
      }

      const [saidaAtualizada, produtoAtualizado] = await prisma.$transaction([
        prisma.saida.update({
            where: { id: Number(id) },
            data: valida.data
        }),
        prisma.produto.update({
          where: { id: produtoId },
          data: { quant: {decrement: diferenca} }
        })
      ])
      res.status(200).json([saidaAtualizada, produtoAtualizado])
    }
      
  } catch (error) {
      res.status(500).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const {id} =req.params
  
  const saidaExcluida = await prisma.saida.findUnique({
    where: {id: Number(id)}
  })

  if (!saidaExcluida) {
    res.status(404).json({erro: "Registro de Saída não encontrada"})
    return
  }

  try {
    const [saida, produto] = await prisma.$transaction([
      prisma.saida.delete({
        where: {id: Number(id)}
      }),
      prisma.produto.update({
        where:{id: saidaExcluida.produtoId},
        data:{quant:{increment: saidaExcluida.quant}}
      })
    ])

    res.status(200).json({saida, produto})
  } catch (error) {
    res.status(500).json({error})
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const saidaId = Number(id)

  try {
    const saida = await prisma.saida.findUnique({
      where: { id: saidaId },
      include:{
        secretaria: true,
        produto: true
      }
    })

    if (!saida) {
      res.status(404).json({ erro: "Saída não encontrada" })
      return
    }


    res.status(200).json(saida)
    
  } catch (error) {
    res.status(500).json({ erro: "Erro interno ao  buscar estes dados de saída", detalhes: error })
  }
})

export default router
