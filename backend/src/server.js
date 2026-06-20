const http = require('http')
const app = require('./app')

const PORT = process.env.PORT || 3001

const server = http.createServer(app)

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso. Encerre o processo existente e tente novamente.`)
  } else {
    console.error('❌ Erro ao iniciar servidor:', err.message)
  }
  process.exit(1)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
