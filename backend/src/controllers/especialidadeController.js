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
    const { nome, descricao, sigla, numero_conselho } = req.body

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    if (!sigla) {
      return res.status(400).json({ error: 'A sigla é obrigatória' })
    }
    if (!numero_conselho) {
      return res.status(400).json({ error: 'O número do conselho é obrigatório' })
    }

    const existe = await prisma.especialidade.findUnique({
      where: { nome }
    })

    if (existe) {
      return res.status(400).json({ error: 'Especialidade já existe' })
    }

    const especialidade = await prisma.especialidade.create({
      data: { 
        nome, 
        sigla,
        descricao,
        // Alterado de Number() para String() para bater com o seu Schema
        n_conselho: String(numero_conselho) 
      }
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
    const { nome, sigla, n_conselho, descricao } = req.body

    // Corrigido aqui: alterado de numeroConselho para n_conselho para bater com seu Schema
    const especialidade = await prisma.especialidade.update({
      where: { id: Number(req.params.id) },
      data: { 
        nome, 
        sigla,
        descricao,
        // Alterado para salvar como String se o valor existir
        n_conselho: n_conselho ? String(n_conselho) : undefined
      }
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