import { prisma } from "../../lib/prisma"
import { Router } from 'express'
import nodemailer from "nodemailer"
import { VerificaToken } from "../middlewares/verificaToken"
VerificaToken

const router = Router()


//=====< EMAIL POSIÇÃO DO ESTOQUE >===================================

function gerarTabelaHTML(produtos: any) {
  let html = `
    <div style="font-family: Helvetica, sans-serif; color: #333333; margin: 0 auto;">
  <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
    <p style="margin: 4px 0 4px 0; font-size: 16px; color: #bdc3c7;">🏦 | Gestão do Estoque Municipal</p>
    <h2 style="margin: 0; font-weight: 600; font-size: 28px;">Relatório de <span
          style="color: #5dade2;">Saldo dos Produtos</span></h2>
  </div>
  <div style="padding: 20px; background-color: #ffffff;">
    <table style="width: 100%; border-collapse: collapse; font-size: 16px; text-align: left;">
      <thead>
        <tr>
          <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Produto</th>
          <th
            style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: center;">
            Saldo Físico</th>
          <th
            style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">
            Preço Unitário</th>
          <th
            style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">
            Saldo Financeiro</th>
        </tr>
      </thead>
      <tbody>
  `
        let valorTotalEstoque = 0
        // Loop em cada produto
        produtos.forEach((produto: any) => {
          // Garantindo que os valores sejam números válidos
          const preco = Number(produto.preco) || 0;
          const quant = Number(produto.quant) || 0;
          const saldoFinanceiro = quant * preco;
          
          valorTotalEstoque += saldoFinanceiro;
          
          html += `
            <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${produto.nome}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: center;">${quant}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$
              ${preco.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$
              ${saldoFinanceiro.toFixed(2)}</td>
          </tr>
          `
        })
      html += `
        </tbody>
        </table>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eaeaea; text-align: right;">
        <h3 style="margin: 0; font-size: 18px; color: #2c3e50;"> Saldo Financeiro Total: <span style="color: #27ae60;">R$ ${valorTotalEstoque.toFixed(2)}</span>
        </h3>
        </div>
        </div>
        <p style="text-align:center; font-size:12px; margin: 5px 0 0 0; color: #555555;">O envio deste e-mail é automático, favor não responder.<br>2026 | Gabriel Schug | Todos os direitos reservados.</p>
        </div>
        `

    return html
}

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure:false,
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA
  }})

async function enviaEmail(dados: any) {
    
    const mensagem = gerarTabelaHTML(dados)

    const info = await transporter.sendMail({
        from: '"Almoxarifado" <sistema@cpl.com>',
        to: '"Diretoria" <admin@cpl.com>',
        subject: "📝 Relatório de Saldo do Estoque",
        html: mensagem
    })

    console.log("Mensagem Enviada: ", info.messageId)
}

router.get("/saldo", VerificaToken, async (req,res) => {
    try {
        const produtos = await prisma.produto.findMany()
        enviaEmail(produtos)
        
        res.status(200).json({msg: "Email enviado com sucesso!"})
    } catch (error) {
        res.status(500).json({msg: "Erro ao enviar email..."})
    }
})

//=====< EMAIL TODAS ENTRADAS >=======================================

function gerarTabelaHTML_Entradas(entradas: any) {
  let html = `
    <div style="font-family: Helvetica, sans-serif; color: #333333; margin: 0 auto;">
      <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 4px 0 4px 0; font-size: 16px; color: #bdc3c7;">🏦 | Gestão do Estoque Municipal</p>
      <h2 style="margin: 0; font-weight: 600; font-size: 28px;">Relatório de <span
            style="color: #2ecc71;">Entradas de Produtos</span></h2>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 16px; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Data</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Fornecedor</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Produto</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: center;">Quantidade</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">Preço Unitário</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">Valor Total</th>
            </tr>
          </thead>
          <tbody>
  `
  let valorTotalEntradas = 0

  // Loop em cada entrada
  entradas.forEach((entrada: any) => {
    // Puxa o preço direto da relação com a tabela produto
    const preco = Number(entrada.produto.preco) || 0;
    const quant = Number(entrada.quant) || 0;
    const saldoFinanceiro = quant * preco;
    
    // Formata a data para o padrão brasileiro (DD/MM/YYYY)
    const dataFormatada = new Date(entrada.data).toLocaleDateString('pt-BR');
    
    valorTotalEntradas += saldoFinanceiro;
    
    html += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${dataFormatada}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${entrada.fornecedor.razao_social}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${entrada.produto.nome}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: center;">${quant}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$ ${preco.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$ ${saldoFinanceiro.toFixed(2)}</td>
      </tr>
    `
  })

  html += `
          </tbody>
        </table>
        <h3 style="text-align: right; color: #2c3e50; margin-top: 20px;">Valor Total das Entradas: R$ ${valorTotalEntradas.toFixed(2)}</h3>
      </div>
      <p style="text-align:center; font-size:12px; margin: 5px 0 0 0; color: #555555;">O envio deste e-mail é automático, favor não responder.<br>2026 | Gabriel Schug | Todos os direitos reservados.</p>
    </div>
  `


    return html
}

async function enviaEmail__Entradas(dados: any) {
    
    const mensagem = gerarTabelaHTML_Entradas(dados)

    const info = await transporter.sendMail({
        from: '"Almoxarifado" <sistema@cpl.com>',
        to: '"Diretoria" <admin@cpl.com>',
        subject: "🚚 Relatório de Entradas do Estoque",
        html: mensagem
    })

    console.log("Mensagem Enviada: ", info.messageId)
}

router.get("/entradas", VerificaToken, async (req,res) => {
  try {
    const entradas = await prisma.entrada.findMany({
      include: {
        fornecedor: true,
        produto: true
      },
      orderBy: {data: 'asc'}
    })
    enviaEmail__Entradas(entradas)

    res.status(200).json({msg: "Email enviado com sucesso!"})
    } catch (error) {
        res.status(500).json({msg: "Erro ao enviar email..."})
    }
})

//=====< EMAIL TODAS SAIDAS >=========================================

function gerarTabelaHTML_Saidas(saidas: any) {
  let html = `
    <div style="font-family: Helvetica, sans-serif; color: #333333; margin: 0 auto;">
      <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 4px 0 4px 0; font-size: 16px; color: #bdc3c7;">🏦 | Gestão do Estoque Municipal</p>
      <h2 style="margin: 0; font-weight: 600; font-size: 28px;">Relatório de <span
        style="color: #f39c12;">Saídas de Produtos</span></h2>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 16px; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Data</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Secretaria</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold;">Produto</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: center;">Quantidade</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">Preço Unitário</th>
              <th style="padding: 12px; border-bottom: 2px solid #2c3e50; color: #2c3e50; font-weight: bold; text-align: right;">Valor Total</th>
            </tr>
          </thead>
          <tbody>
  `
  let valorTotalSaidas = 0

  // Loop em cada entrada
  saidas.forEach((saida: any) => {
    // Puxa o preço direto da relação com a tabela produto
    const preco = Number(saida.produto.preco) || 0;
    const quant = Number(saida.quant) || 0;
    const saldoFinanceiro = quant * preco;
    
    // Formata a data para o padrão brasileiro (DD/MM/YYYY)
    const dataFormatada = new Date(saida.data).toLocaleDateString('pt-BR');
    
    valorTotalSaidas += saldoFinanceiro;
    
    html += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${dataFormatada}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${saida.secretaria.nome}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555;">${saida.produto.nome}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: center;">${quant}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$ ${preco.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; text-align: right;">R$ ${saldoFinanceiro.toFixed(2)}</td>
      </tr>
    `
  })

  html += `
          </tbody>
        </table>
        <h3 style="text-align: right; color: #2c3e50; margin-top: 20px;">Valor Total das Saídas: R$ ${valorTotalSaidas.toFixed(2)}</h3>
      </div>
      <p style="text-align:center; font-size:12px; margin: 5px 0 0 0; color: #555555;">O envio deste e-mail é automático, favor não responder.<br>2026 | Gabriel Schug | Todos os direitos reservados.</p>
    </div>
  `


    return html
}

async function enviaEmail__Saidas(dados: any) {
    
    const mensagem = gerarTabelaHTML_Saidas(dados)

    const info = await transporter.sendMail({
        from: '"Almoxarifado" <sistema@cpl.com>',
        to: '"Diretoria" <admin@cpl.com>',
        subject: "📦 Relatório de Saídas do Estoque",
        html: mensagem
    })

    console.log("Mensagem Enviada: ", info.messageId)
}

router.get("/saidas", VerificaToken, async (req,res) => {
  try {
    const saidas = await prisma.saida.findMany({
      include: {
        secretaria: true,
        produto: true
      }
    })
    enviaEmail__Saidas(saidas)

    res.status(200).json({msg: "Email enviado com sucesso!"})
    } catch (error) {
        res.status(500).json({msg: "Erro ao enviar email..."})
    }
})

//=====< EMAIL RECUPERAÇÃO DE SENHA >=================================

function geraHTML_CodigoRecuperacao(codigo:string){
  let html =`
  <div style="font-family: Helvetica, sans-serif; color: #333333; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 4px 0 4px 0; font-size: 16px; color: #bdc3c7;">🏦 | Gestão do Estoque Municipal</p>
      <h2 style="margin: 0; font-weight: 600; font-size: 28px;">Aqui está seu <span style="color: #c9de27;">Código de Recuperação de Senha</span></h2>
    </div>
    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 16px; text-align: left;">
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; color: #555555; font-size: 28px; text-align: center;">
              Seu código é:<br><span style="font-weight: bolder;">${codigo}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <h3 style="text-align: center; color: #b51e0e; margin-top: 20px;">⚠️ ATENÇÃO: Não compartilhe este código com ninguém!</h3>
    </div>
    <div style="padding: 20px; text-align: center;">
      <p style="font-size:12px; margin: 5px 0 0 0; color: #555555;">O envio deste e-mail é automático, favor não responder.<br>2026 | Gabriel Schug | Todos os direitos reservados.</p>
    </div>
  </div>`

return html
}

export async function enviaEmail__CodigoRecuperacao(codigo:string, email:string, nome:string) {
  
  const mensagem = geraHTML_CodigoRecuperacao(codigo)
  const textoPuro = `Gestão do Estoque Municipal\n\nAqui está seu Código de Recuperação de Senha.\n\nSeu código é: ${codigo}\n\n⚠️ ATENÇÃO: Não compartilhe este código com ninguém!\n\nO envio deste e-mail é automático, favor não responder.`

  const info = await transporter.sendMail({
  from: '"Almoxarifado" <sistema@cpl.com>',
  to: `"${nome}" <${email}>`,
  subject: `🔐 Estoque | Seu código é ${codigo}`,
  text: textoPuro,
  html: mensagem
  })

  console.log("Mensagem Enviada: ", info.messageId)
}

export default router