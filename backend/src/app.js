require('dotenv').config()

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const pacienteRoutes = require('./routes/pacienteRoutes')
const especialidadeRoutes = require('./routes/especialidadeRoutes')
const profissionalRoutes = require('./routes/profissionalRoutes')
const consultaRoutes = require('./routes/consultaRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const convenioRoutes = require('./routes/convenioRoutes')
const solicitacaoRoutes = require('./routes/solicitacaoRoutes')
const notificacaoRoutes = require('./routes/notificacaoRoutes')
const usuarioRoutes     = require('./routes/usuarioRoutes')

const app = express()

app.use(express.json())

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use('/auth', authRoutes)
app.use('/pacientes', pacienteRoutes)
app.use('/especialidades', especialidadeRoutes)
app.use('/profissionais', profissionalRoutes)
app.use('/consultas', consultaRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/convenios', convenioRoutes)
app.use('/solicitacoes-exclusao', solicitacaoRoutes)
app.use('/notificacoes', notificacaoRoutes)
app.use('/usuarios',    usuarioRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API MedAgenda funcionando 🚀' })
})

app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err.message)
  res.status(500).json({ error: 'Erro interno no servidor', details: err.message })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

module.exports = app
