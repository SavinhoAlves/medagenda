const prisma = require('../config/database')

exports.listar = async (req, res) => {
  try {
    const convenios = await prisma.convenio.findMany({
      orderBy: { nome: 'asc' }
    })

    return res.json(convenios)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params

    const convenio = await prisma.convenio.findUnique({
      where: { id: Number(id) }
    })

    if (!convenio) {
      return res.status(404).json({ error: 'Convênio não encontrado' })
    }

    return res.json(convenio)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.criar = async (req, res) => {
  try {
    const { nome } = req.body

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'O nome do convênio é obrigatório' })
    }

    const convenio = await prisma.convenio.create({
      data: { nome: nome.trim() }
    })

    return res.status(201).json(convenio)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params
    const { nome } = req.body

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'O nome do convênio é obrigatório' })
    }

    const convenio = await prisma.convenio.update({
      where: { id: Number(id) },
      data: { nome: nome.trim() }
    })

    return res.json(convenio)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.convenio.delete({
      where: { id: Number(id) }
    })

    return res.json({ message: 'Convênio removido com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
