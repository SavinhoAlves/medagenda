const prisma = require('../config/database')

// LISTAR
exports.listar = async (req, res) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      orderBy: { nome: 'asc' }
    })

    return res.json(especialidades)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// CRIAR
exports.criar = async (req, res) => {
  try {
    const { nome, descricao } = req.body

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }

    const existe = await prisma.especialidade.findUnique({
      where: { nome }
    })

    if (existe) {
      return res.status(400).json({ error: 'Especialidade já existe' })
    }

    const especialidade = await prisma.especialidade.create({
      data: { nome, descricao }
    })

    return res.status(201).json(especialidade)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// BUSCAR
exports.buscar = async (req, res) => {
  try {
    const especialidade = await prisma.especialidade.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!especialidade) {
      return res.status(404).json({ error: 'Especialidade não encontrada' })
    }

    return res.json(especialidade)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// ATUALIZAR
exports.atualizar = async (req, res) => {
  try {
    const { nome, descricao } = req.body

    const especialidade = await prisma.especialidade.update({
      where: { id: Number(req.params.id) },
      data: { nome, descricao }
    })

    return res.json(especialidade)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// EXCLUIR
exports.excluir = async (req, res) => {
  try {
    await prisma.especialidade.delete({
      where: { id: Number(req.params.id) }
    })

    return res.json({ message: 'Especialidade removida' })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}