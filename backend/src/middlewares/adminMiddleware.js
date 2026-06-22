module.exports = (req, res, next) => {
  if (req.usuario?.cargo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' })
  }
  next()
}
