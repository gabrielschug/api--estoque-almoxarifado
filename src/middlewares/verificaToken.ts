import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { prisma } from "../../lib/prisma"

interface TokenInterface {
  userLogadoId: number
  userLogadoNome: string
}

// Requisições (Request) podem carregar 2 atributos (TypeScript) 
declare global {
  namespace Express {
    interface Request {
      userLogadoId?: number
      userLogadoNome?: string
    }
  }
}

export async function VerificaToken(req:Request, res:Response, next:NextFunction) {
  console.log("Solicitando Token...")

  const { authorization } = req.headers

  if (!authorization) {
    res.status(401).json({erro: "Token não informado"})
    return
  }

  const token = authorization.split(" ")[1]

  const bloqueado = await prisma.tokenListaBloqueio.findFirst({
    where: {
      token: token
    }
  })

  if (bloqueado) {
    res.status(401).json({erro: "Token revogado. Faça login novamente."})
    return
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET as string)
    const {userLogadoId, userLogadoNome} = decode as TokenInterface

    req.userLogadoId = userLogadoId
    req.userLogadoNome = userLogadoNome

    next()
  } catch (erro) {
    res.status(401).json({erro: "Token inválido"})
  }
}