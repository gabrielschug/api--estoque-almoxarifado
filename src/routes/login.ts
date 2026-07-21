import { prisma } from "../../lib/prisma"
import { Router } from "express"
import bcrypt from 'bcrypt'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { geraCodigo } from "./utils/geraCodigo"
import { enviaEmail__CodigoRecuperacao } from "./relatorios"
import { validaSenha } from "./utils/validaSenha"
import { geraSenha } from "./utils/geraSenha"
import { connect } from "node:http2"

const router = Router()

const emailSchema = z.object({
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
})
const redefinirSchema = z.object({
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
  codRecuperacao: z.string().length(4, {message: "Código, deve possuir, exatamente 4 caracteres"}),
  novaSenha: z.string().min(8, {message: "Senha, deve possuir, no mínimo, 8 caracteres"})
})

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

      // Processo UltimoLogin
      const dataUltimoAcesso = usuario.ultimoLogin
      await prisma.usuario.update({
        where: {id: usuario.id},
        data: {ultimoLogin: new Date()}
      })
      let mensagemBoasVindas = "Bem-vindo. Este é o seu primeiro acesso ao sistema."
      if (dataUltimoAcesso) {
        mensagemBoasVindas = `Bem-vindo. Seu último acesso foi em ${dataUltimoAcesso.toLocaleString('pt-BR')}`
      }
      
      // Gera Log
      const log = await prisma.log.create({
        data: {
          descricao: "Login com sucesso",
          complemento: usuario.nome,
          usuario:{ 
            connect: { id: usuario.id}}
        }
        })

      // 5. Acesso Liberado
      res.status(200).json({
        mensagemBoasVindas,
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        token
      })
    } else {
      // 5. Acesso Negado
      // Gera Log
      const log = await prisma.log.create({
        data: {
          descricao: "Senha incorreta",
          complemento: email,
          usuario: { 
            connect: { id: usuario.id}}
        }
      })
      res.status(400).json({ erro: mensagemErroLogin})
    }
  } catch (error) {
    res.status(400).json({erro: error})
  }
})

router.post("/recuperacao", async (req, res) => {
  const valida = emailSchema.safeParse(req.body)
  if(!valida.success) {
    res.status(400).json({ erro: z.flattenError(valida.error) })
    return
  }

  const emailUsuario = valida.data.email

  try {
    const dadosUsuario = await prisma.usuario.findUnique({
      where: {email: emailUsuario}
    })

    if (dadosUsuario == null) {
      res.status(400).json({ erro: "Usuário não encontrado."})
      return
    }

    const nomeUsuario = dadosUsuario.nome

    const codigo = geraCodigo()

    const salvandoCodigo = await prisma.usuario.update({
      where: { email: emailUsuario},
      data: {codRecuperacao: codigo}
    })

    const enviaEmail = await enviaEmail__CodigoRecuperacao(codigo, emailUsuario, nomeUsuario)

    res.status(200).json({msg: "Email com o código de recuperação enviado!"})
  } catch (error){
    res.status(400).json({erro: error})
  }
})

router.post("/redefinir-senha", async(req, res) => {

const valida = redefinirSchema.safeParse(req.body)
  if(!valida.success) {
    res.status(400).json({ erro: z.flattenError(valida.error) })
    return
  }

  const {email, codRecuperacao, novaSenha}  = valida.data
  console.log(email, codRecuperacao)
  const dadosUsuario = await prisma.usuario.findFirst({
  where: {
    email: email,
    codRecuperacao: codRecuperacao
  }
});
  if (!dadosUsuario) {
    res.status(404).json({ erro: "Erro... Código ou email inválidos" })
    return
  }

  const mensagemErros = validaSenha(novaSenha)
  
    if(mensagemErros.length > 0) {
      res.status(400).json({erro:mensagemErros})
      return
    }

    const hash = geraSenha(novaSenha)

    try {
      const salvandoNovosDados = await prisma.usuario.update({
      where: { email },
      data: {codRecuperacao: null, senha: hash}
    })
    res.status(200).json(salvandoNovosDados)
    } catch (error) {
      res.status(400).json({error})
    }
})

export default router