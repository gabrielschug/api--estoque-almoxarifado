import { prisma } from "../../lib/prisma";
import { Router } from "express";
import { z } from 'zod'
import { validaSenha } from "./utils/validaSenha";
import { geraSenha } from "./utils/geraSenha";
import { VerificaToken } from "../middlewares/verificaToken";
import { validaEmail } from "./utils/validaEmail";
import { calculaDiferencaSenha } from "./utils/calculaDiferencaSenha"; 
import bcrypt from 'bcrypt'
import { geraCodigo } from "./utils/geraCodigo";
import { enviaEmail__CodigoAtivacao} from "./relatorios"

const router = Router()

const usuarioSchema = z.object({
  nome: z.string().min(10, {message: "Nome deve possuir, no mínimo 10 caracteres"}),
  email: z.email().min(10, {message: "E-mail, deve possuir, no mínimo, 10 caracteres"}),
  senha: z.string(),
  nivel: z.number().optional()
})
const codigoSchema = z.object({
  codigo: z.string().length(4, "O código deve ter 4 caracteres.")
})

router.get("/", VerificaToken, async (req, res) =>{

  try {
    const usuarios = await prisma.usuario.findMany({
      where: { deleted: false },
      omit: {deleted: true, deletedAt: true, senha: true}
    })

    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({erro: error})
  }
})

router.post("/", async (req, res) => {

  const valida = usuarioSchema.safeParse(req.body)
  if(!valida.success) {
    res.status(400).json({ erro: z.flattenError(valida.error) })
    return
  }

  const { nome, email, senha, nivel } = valida.data

  const emailJaUtilizado = await validaEmail(email)

  if (emailJaUtilizado === true) {
    res.status(400).json({ erro: "Erro... Email de usuário já utilizado." })
    return
  }

  const mensagemErros = validaSenha(senha)

  if(mensagemErros.length > 0) {
    res.status(400).json({erro:mensagemErros})
    return
  }

  const codAtivacao = geraCodigo()
  const hash = geraSenha(senha)

  try {
    const  usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash, nivel, codAtivacao},
      select: {nome: true, email: true, ultimoLogin: true, }
    })

    const enviaEmail = await enviaEmail__CodigoAtivacao(codAtivacao, email, nome)
  
  res.status(200).json({usuario, msg: "Acesse seu email e obtenha seu codigo de ativação."})

  } catch (error) {
    res.status(400).json({error})
  }
})

router.put("/alterar-senha", VerificaToken, async (req, res) => {

  const {senhaAntiga, novaSenha} = req.body
  if (!senhaAntiga || !novaSenha) {
    res.status(400).json({erro: "Informe a senha atual e a nova senha."})
    return
  }

  const mensagemErros = validaSenha(novaSenha)
  
  if(mensagemErros.length > 0) {
  res.status(400).json({erro:mensagemErros})
  return
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {id: req.userLogadoId }
    })
    
    if (!usuario) {
      res.status(404).json({erro:"Usuário não encontrado."})
    }

    if(!bcrypt.compareSync(senhaAntiga, usuario!.senha)) {
      res.status(400).json({erro: "Senha atual incorreta."})
      return
    }

    if (calculaDiferencaSenha(senhaAntiga, novaSenha) < 2) {
      res.status(400).json({erro: "A nova senha deve ter no mínimo 2 caracteres diferentes da antiga."})
      return
    }

    const hash = geraSenha(novaSenha)

    await prisma.usuario.update({
      where: {id: req.userLogadoId},
      data: { senha: hash}
    })

    res.status(200).json({mensagem: "Senha alterada com sucesso!"})
  } catch (error) {
    console.log(error)
    res.status(500).json({erro: "Erro interno no servidor"})
  }
})

router.put("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const valida = usuarioSchema.partial().safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: z.flattenError(valida.error) })
        return
    }

    // Desestrutura os dados validados
    const { nome, email, senha, nivel } = valida.data
    
    let senhaCriptografada
    if (senha) {
      senhaCriptografada = geraSenha(senha)
    }

    try {
        const usuario = await prisma.usuario.update({
            where: { id: Number(id), deleted: false },
            data: { nome, email, senha: senhaCriptografada, nivel}
        })
        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar o usuário." })
    }
})

router.delete("/:id", VerificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.update({
      where: {id: Number(id)},
      data: {deleted: true, deletedAt: new Date()}
    })

    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.get(["/ativar", "/ativar/:codigo"], async(req, res) => {
  const valida = codigoSchema.safeParse(req.params)

  if(!valida.success) {
    res.status(400).json({ erro: "Envie um código válido de 4 dígitos."}, )
    return
  }
  
  const {codigo} = valida.data

  const dadosUsuario = await prisma.usuario.findFirst({
    where: { codAtivacao: codigo }
  })

  if (!dadosUsuario) {
    res.status(404).json({ erro: "Erro... Link inválido." })
    return
  }
  
  try {
    const salvandoNovosDados = await prisma.usuario.update({
    where: { id: dadosUsuario.id},
    data: {status: "ATIVO", codAtivacao: null}
  })
  res.status(200).json({message: `Seja bem-vindo ${dadosUsuario.nome}! Sua conta foi ativada com sucesso!`})
  } catch (error) {
    res.status(400).json({error})
  }
})

router.get("/:id", VerificaToken, async (req, res) => {
    // recebe o id passado como parâmetro
    const { id } = req.params

    const usuarioId = Number(id)

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId, deleted: false},
            omit: {deleted: true, deletedAt: true, senha: true}
        })

        if (!usuario) {
        res.status(404).json({ erro: "Usuário não encontrado." })
        return
        }

        res.status(200).json(usuario)
    
}   catch (error) {
        res.status(500).json({ erro: "Erro Interno na busca dos dados deste usuário.", detalhes: error })
    }
})


export default router
