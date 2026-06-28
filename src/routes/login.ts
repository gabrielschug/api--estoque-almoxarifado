import { prisma } from "../../lib/prisma"
import { Router } from "express"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

router.post("/", async (req, res) => {
  const {email, senha} = req.body

  // 1. Mensagem Genérica de Erro
  const mensagemErroLogin = "Usuário ou senha incorretos"

  
  if (!email || !senha) {
    res.status(400).json({ erro:mensagemErroLogin})
    return
  }

  // 2. Busca e Validação Inicial
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {email}
    })

    if (usuario == null) {
      res.status(400).json({ erro: mensagemErroLogin})
      return
    }
    // 3. Comparação de Senhas (Bcrypt)
    if (bcrypt.compareSync(senha, usuario.senha)) {
      
      // 4. Geração do Token (JWT)
      const payload = { userLogadoId: usuario.id, userLogadoNome: usuario.nome }
      const secret = process.env.JWT_SECRET as string
      const options = {expiresIn: '15m'} as object
      const token = jwt.sign(payload, secret, options)

      // 5. Acesso Liberado
      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token
      })
    } else {
      // 5. Acesso Negado
      res.status(400).json({ erro: mensagemErroLogin})
    }
  } catch (error) {
    res.status(400).json({erro: error})
  }
})


router.post("/recuperacao", async (req, res) => {
const email = req.body




})

export default router