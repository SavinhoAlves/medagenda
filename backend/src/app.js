require('dotenv').config()

const express = require('express')
const cors = require('cors')

// Importações das rotas
const authRoutes = require('./routes/authRoutes')
const pacienteRoutes = require('./routes/pacienteRoutes')
const especialidadeRoutes = require('./routes/especialidadeRoutes')
const profissionalRoutes = require('./routes/profissionalRoutes')
const consultaRoutes = require('./routes/consultaRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()

// 1. LEITOR DE JSON (Deve ser o primeiro middleware para o req.body não vir undefined)
app.use(express.json())

// 2. CONFIGURAÇÃO GLOBAL DO CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// 3. INTERCEPTOR MANUAL DE PREFLIGHT (OPTIONS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// 4. ROTAS DA API
app.use('/auth', authRoutes)
app.use('/pacientes', pacienteRoutes)
app.use('/especialidades', especialidadeRoutes)
app.use('/profissionais', profissionalRoutes)
app.use('/consultas', consultaRoutes)
app.use('/dashboard', dashboardRoutes)

// Rota raiz para verificação rápida
app.get('/', (req, res) => {
  return res.json({
    message: 'API funcionando 🚀'
  })
})

// Middleware de erro 404 (Rota não encontrada)
app.use((req, res) => {
  return res.status(404).json({
    error: 'Rota não encontrada'
  })
})

// Middleware Global de Erros (Garante que respostas de erro também incluam cabeçalhos CORS)
app.use((err, req, res, next) => {
  console.error('❌ Erro interno no servidor:', err)
  
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  return res.status(500).json({
    error: 'Erro interno no servidor',
    details: err.message
  })
})

module.exports = app