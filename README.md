# 📦 API de Controle de Estoque e Almoxarifado Municipal

Uma API RESTful robusta desenvolvida para o gerenciamento de estoque e almoxarifado público/municipal. O projeto foi construído como um projeto paralelo para consolidar e expandir os conhecimentos adquiridos na disciplina de **Desenvolvimento de Serviços Web e APIs** do curso de **Análise e Desenvolvimento de Sistemas**.

---

## 🚀 Link da Aplicação em Produção (Deploy)

* **URL da API (Render):** [https://api-estoque-almoxarifado.onrender.com/](https://api-estoque-almoxarifado.onrender.com/)

---

## 🛠️ Tecnologias e Dependências Utilizadas

### Core & Server
* **Node.js** com **TypeScript** e suporte a ES Modules.
* **Express.js (v5)**: Framework web para roteamento e gerenciamento de requisições HTTP.
* **TSX**: Executor TypeScript para ambiente de desenvolvimento rápido em tempo real.

### Banco de Dados & ORM
* **PostgreSQL (Neon Database)**: Banco de dados relacional hospedado em nuvem.
* **Prisma ORM (v7)**: Manipulação e consultas tipadas ao banco de dados, utilizando o adaptador `@prisma/adapter-neon`.

### Segurança, Autenticação e Validação
* **Zod**: Validação e sanitização estrita de dados de entrada via schemas.
* **JWT (JSON Web Token)**: Autenticação de rotas e controle de sessão.
* **Bcrypt**: Criptografia e hashing seguro de senhas.
* **Blacklist de Tokens**: Invalidação real do token JWT no encerramento de sessão (Logout).

### Comunicação & Relatórios
* **Nodemailer**: Disparo de e-mails transacionais (ativação, recuperação de senha, alerta de novos dispositivos e relatórios em HTML estilizado).

---

## 🔥 Principais Diferenciais e Recursos Implementados

* **🔐 Autenticação e Controle de Acesso:**
  * Fluxo completo de cadastro, validação de e-mail por código de 4 dígitos e ativação de conta.
  * Recuperação de senha segura via e-mail e redefinição com validação de complexidade.
  * Detecção automática de **novos dispositivos de acesso** (`User-Agent`) com notificação imediata ao usuário.
  * Proteção contra **força bruta** (bloqueio automático da conta após tentativas falhas recorrentes).
  * Controle de permissões por **nível de acesso** (`nivel`) do usuário.

* **📦 Gestão de Estoque e Transações Atômicas:**
  * Movimentações de **Entradas** e **Saídas** integradas ao estoque de produtos utilizando **Prisma Transactions** (`$transaction`), garantindo integridade e prevenindo inconsistências de saldo.
  * Validações de estoque mínimo para impedir saldos negativos em atualizações ou estornos.
  * Trava de segurança para limitação de **exclusões diárias** por usuário (evitando ações acidentais ou maliciosas em massa).

* **🛡️ Governança e Regras Negociais:**
  * **Soft Delete Universal**: Padrão de exclusão lógica (`deleted`, `deletedAt`) aplicado a todas as entidades do banco.
  * **Middlewares Personalizados**: Validação contínua de tokens e controle de horário para operações de escrita (`VerificaHorario`).
  * **Auditoria de Logs**: Registro detalhado de ações críticas (logins, falhas de senha e deleção de transações) para rastreabilidade do sistema.

* **📊 Relatórios Automatizados:**
  * Disparo de e-mails com relatórios formatados em **tabelas HTML** contendo a posição atual do saldo físico e financeiro do estoque, além do resumo geral de entradas e saídas.

---

## 🗄️ Modelo do Banco de Dados (Prisma Schema)

O banco de dados conta com as seguintes entidades relacionais:

* `usuarios`: Cadastro de usuários, credenciais, níveis de acesso, tentativas falhas e controle de bloqueio.
* `produtos`: Cadastro de produtos do almoxarifado, preços e saldo físico em estoque.
* `fornecedores`: Razão social e vínculo com as entradas de mercadorias.
* `secretarias`: Cadastro de secretarias e departamentos municipais vinculados às saídas.
* `entradas`: Transações de adição de estoque (produto + fornecedor).
* `saidas`: Transações de distribuição de estoque (produto + secretaria).
* `logs`: Auditoria de ações executadas no sistema.
* `tokens`: Blacklist de tokens invalidos no logout.
* `dispositivos_usuarios`: Rastreamento de dispositivos previamente autorizados por usuário.

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* Gerenciador de pacotes **npm** ou **yarn**
* Instância de banco de dados **PostgreSQL** (ou conta na [Neon](https://neon.tech))

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/gabrielschug/api--estoque-almoxarifado.git
   cd api--estoque-almoxarifado
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```env
   DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
   JWT_SECRET="sua_chave_secreta_jwt"
   MAILTRAP_EMAIL="seu_usuario_mailtrap"
   MAILTRAP_SENHA="sua_senha_mailtrap"
   ```

4. **Execute as Migrações do Banco de Dados:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   A API estará rodando por padrão na porta definida no seu servidor (ex: `http://localhost:3000`).

---

## 🧑‍💻 Autor

Desenvolvido por **Gabriel Schug** como projeto de consolidação de estudos em Análise e Desenvolvimento de Sistemas.
