const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não informado'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.usuario = decoded
    next()

  } catch (error) {
    // 🔥 ADICIONE ESTA LINHA ABAIXO PARA VER O ERRO REAL NO TERMINAL DO BACKEND:
    console.error('❌ [ERRO NO MIDDLEWARE JWT]:', error.message)

    return res.status(401).json({
      error: 'Token inválido'
    })
  }
}