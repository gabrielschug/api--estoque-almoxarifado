import express from 'express'
const app = express()
const port = 3000

import routesFornecedores from "./routes/fornecedores"
import routesSecretarias from "./routes/secretarias"
import routesProdutos from "./routes/produtos"
import routesEntradas from "./routes/entradas"
import routesSaidas from "./routes/saidas"
import routesRelatorios from "./routes/relatorios"
import routesUsuarios from "./routes/usuarios"


app.use(express.json())

app.use("/fornecedores", routesFornecedores)
app.use("/secretarias", routesSecretarias)
app.use("/produtos", routesProdutos)
app.use("/entradas", routesEntradas)
app.use("/saidas", routesSaidas)
app.use("/relatorios", routesRelatorios)
app.use("/usuarios", routesUsuarios)

app.get('/', (req, res) => {
  res.send('API: Sistema de Estoque')
})

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`)
})