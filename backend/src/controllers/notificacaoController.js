const prisma = require('../config/database')

exports.listar = async (req, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: [{ lida: 'asc' }, { criadoEm: 'desc' }],
      take: 20,
    })
    return res.json(notificacoes)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.contarNaoLidas = async (req, res) => {
  try {
    const count = await prisma.notificacao.count({
      where: { usuarioId: req.usuario.id, lida: false },
    })
    return res.json({ count })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.marcarLida = async (req, res) => {
  try {
    await prisma.notificacao.updateMany({
      where: { id: Number(req.params.id), usuarioId: req.usuario.id },
      data: { lida: true },
    })
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.marcarTodasLidas = async (req, res) => {
  try {
    await prisma.notificacao.updateMany({
      where: { usuarioId: req.usuario.id, lida: false },
      data: { lida: true },
    })
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.enviarParaOperadores = async (req, res) => {
  if (req.usuario.cargo !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem enviar notificações.' })
  }
  const { titulo, mensagem } = req.body
  if (!titulo?.trim() || !mensagem?.trim()) {
    return res.status(400).json({ error: 'Título e mensagem são obrigatórios.' })
  }
  try {
    const operadores = await prisma.usuario.findMany({
      where: { cargo: 'operador' },
      select: { id: true },
    })
    if (operadores.length === 0) {
      return res.status(404).json({ error: 'Nenhum operador cadastrado.' })
    }
    await prisma.notificacao.createMany({
      data: operadores.map(op => ({
        usuarioId: op.id,
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        tipo: 'GERAL',
      })),
    })
    return res.json({ ok: true, enviados: operadores.length })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
