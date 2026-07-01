import { log } from "node:console"
import { prisma } from "../../lib/prisma"
import { Router } from 'express'

const router = Router()


router.get("/", async (req, res) => {
    try {
        const logs = await prisma.log.findMany({
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        })
        res.status(200).json(logs)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.get("/:id", async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const usuarioId = Number(id)

    try {
        const logs = await prisma.log.findMany({
            where: { usuarioId}
        })

        if (logs.length === 0) {
        res.status(404).json({ erro: "Não há logs registrados para este ID." })
        return
        }

        res.status(200).json(logs)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados para este usuário.", detalhes: error })
    }
})

export default router