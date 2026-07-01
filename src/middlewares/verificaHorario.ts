import { Request, Response, NextFunction } from "express";
import { error } from "node:console";

export function VerificaHorario(req:Request, res:Response, next: NextFunction) {
  
  const horaAtual = new Date().getHours()

  if (horaAtual < 7 || horaAtual >= 22) {
    res.status(403).json({erro: "Ações de inclusão e exclusão só são permitidas entre 07h e 22h."})
    return
  }

  next()
}