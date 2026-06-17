const prisma = require('../config/database')

exports.listar = async (req, res) => {

  try {

    const pacientes = await prisma.paciente.findMany({
      orderBy: {
        id: 'desc'
      }
    })

    return res.json(pacientes)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}

exports.criar = async (req, res) => {

  try {

    const {
      nome,
      cpf,
      telefone,
      email
    } = req.body

    const pacienteExiste = await prisma.paciente.findUnique({
      where: {
        cpf
      }
    })

    if (pacienteExiste) {

      return res.status(400).json({
        error: 'Paciente já cadastrado'
      })

    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf,
        telefone,
        email
      }
    })

    return res.status(201).json(paciente)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}

exports.buscarPorId = async (req, res) => {

  try {

    const { id } = req.params

    const paciente = await prisma.paciente.findUnique({
      where: {
        id: Number(id)
      }
    })

    if (!paciente) {

      return res.status(404).json({
        error: 'Paciente não encontrado'
      })

    }

    return res.json(paciente)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}

exports.atualizar = async (req, res) => {

  try {

    const { id } = req.params

    const {
      nome,
      telefone,
      email
    } = req.body

    const paciente = await prisma.paciente.update({
      where: {
        id: Number(id)
      },
      data: {
        nome,
        telefone,
        email
      }
    })

    return res.json(paciente)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}

exports.deletar = async (req, res) => {

  try {

    const { id } = req.params

    await prisma.paciente.delete({
      where: {
        id: Number(id)
      }
    })

    return res.json({
      message: 'Paciente removido'
    })

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}