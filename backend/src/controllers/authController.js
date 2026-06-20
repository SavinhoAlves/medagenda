const prisma = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function gerarAccessToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, cargo: usuario.cargo, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function gerarRefreshToken(usuario) {
  return jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function usuarioPublico(u) {
  return { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo }
}

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const accessToken  = gerarAccessToken(usuario)
    const refreshToken = gerarRefreshToken(usuario)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data:  { refreshToken }
    })

    return res.json({
      accessToken,
      refreshToken,
      usuario: usuarioPublico(usuario)
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.me = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, cargo: true, criadoEm: true }
    })

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' })

    return res.json(usuario)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token não informado.' })
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado.' })
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id: decoded.id, refreshToken }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Refresh token revogado.' })
    }

    const novoAccessToken  = gerarAccessToken(usuario)
    const novoRefreshToken = gerarRefreshToken(usuario)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data:  { refreshToken: novoRefreshToken }
    })

    return res.json({
      accessToken:  novoAccessToken,
      refreshToken: novoRefreshToken,
      usuario: usuarioPublico(usuario)
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.logout = async (req, res) => {
  try {
    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data:  { refreshToken: null }
    })
    return res.json({ message: 'Logout realizado.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
