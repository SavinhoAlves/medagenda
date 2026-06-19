const prisma = require('../config/database')

exports.listar = async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
      include: { especialidade: true },
      orderBy: { nome: 'asc' }
    })
    return res.json(profissionais)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params
    const profissional = await prisma.profissional.findUnique({
      where: { id: Number(id) },
      include: { especialidade: true }
    })

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' })
    }

    return res.json(profissional)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

exports.criar = async (req, res) => {
  try {
    const { nome, cpf, telefone, email, registroConselho, especialidadeId } = req.body

    if (!especialidadeId) {
      return res.status(400).json({ error: 'Especialidade é obrigatória' })
    }

    const jaExiste = await prisma.profissional.findUnique({ where: { cpf } })
    if (jaExiste) {
      return res.status(400).json({ error: 'Profissional já cadastrado com este CPF' })
    }

    const profissional = await prisma.profissional.create({
      data: {
        nome,
        cpf,
        telefone,
        email,
        registroConselho,
        especialidadeId: Number(especialidadeId)
      },
      include: { especialidade: true }
    })

    return res.status(201).json(profissional)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params
    const { nome, cpf, telefone, email, registroConselho, especialidadeId } = req.body

    const profissional = await prisma.profissional.update({
      where: { id: Number(id) },
      data: {
        nome,
        cpf,
        telefone,
        email: email || null,
        registroConselho: registroConselho || null,
        especialidadeId: Number(especialidadeId)
      },
      include: { especialidade: true }
    })

    return res.json(profissional)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.profissional.delete({
      where: { id: Number(id) }
    })

    return res.json({ message: 'Profissional removido com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
