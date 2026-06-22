const prisma = require('../config/database')
const bcrypt = require('bcryptjs')

const CARGOS_VALIDOS = ['admin', 'operador', 'medico']

exports.listar = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, cargo: true, criadoEm: true },
      orderBy: { criadoEm: 'desc' },
    })
    return res.json(usuarios)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

exports.criar = async (req, res) => {
  try {
    const { nome, email, senha, cargo = 'operador' } = req.body

    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' })
    }
    if (!CARGOS_VALIDOS.includes(cargo)) {
      return res.status(400).json({ error: `Cargo inválido. Use: ${CARGOS_VALIDOS.join(', ')}.` })
    }

    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return res.status(409).json({ error: 'E-mail já cadastrado.' })

    const hash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.usuario.create({
      data: { nome: nome.trim(), email: email.trim(), senha: hash, cargo },
      select: { id: true, nome: true, email: true, cargo: true, criadoEm: true },
    })
    return res.status(201).json(usuario)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params
    const { nome, cargo } = req.body

    if (cargo && !CARGOS_VALIDOS.includes(cargo)) {
      return res.status(400).json({ error: `Cargo inválido. Use: ${CARGOS_VALIDOS.join(', ')}.` })
    }

    const data = {}
    if (nome) data.nome = nome.trim()
    if (cargo) data.cargo = cargo

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data,
      select: { id: true, nome: true, email: true, cargo: true },
    })
    return res.json(usuario)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

exports.excluir = async (req, res) => {
  try {
    const { id } = req.params
    if (Number(id) === req.usuario.id) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' })
    }
    await prisma.usuario.delete({ where: { id: Number(id) } })
    return res.json({ mensagem: 'Usuário excluído com sucesso.' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
