const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// LISTAR
exports.listar = async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
      include: {
        paciente: true,
        profissional: {
          include: {
            especialidade: true
          }
        }
      },
      orderBy: {
        dataInicio: 'asc'
      }
    })

    return res.json(consultas)

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

// CRIAR
exports.criar = async (req, res) => {
  try {
    const {
      pacienteId,
      profissionalId,
      dataInicio,
      dataFim,
      observacoes,
      sala,
      convenio,
      procedimento
    } = req.body

    // 🔥 CAPTURA O ID DO USUÁRIO LOGADO (Injetado pelo seu middleware de JWT)
    // Se o seu middleware salvar em req.usuario, mude para req.usuario.id
    const usuarioId = req.user?.id ? Number(req.user.id) : null

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId: Number(pacienteId),
        profissionalId: Number(profissionalId),
        usuarioId: usuarioId, // ✅ Agora o ID deixa de ser null!
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        observacoes: observacoes || null,
        sala: sala || null,
        status: "AGENDADA",
        retorno: procedimento === "RETORNO",
        cor: procedimento === "RETORNO" ? "#e57373" : "#4fc3f7",
        descricao: convenio ? `Convênio: ${convenio}` : null
        
        // Se você alterou o schema.prisma para 'atualizadoEm DateTime?',
        // não precisa passar nada aqui. Ele nascerá como null automaticamente!
      },
      include: {
        paciente: true,
        profissional: {
          include: {
            especialidade: true
          }
        }
      }
    })

    return res.status(201).json(consulta)

  } catch (error) {
    console.error("Erro interno no Prisma:", error.message)
    return res.status(500).json({
      error: "Erro ao processar requisição no banco de dados.",
      details: error.message
    })
  }
}

// ATUALIZAR (Unificado, Seguro e atualizando a data de modificação)
exports.atualizar = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const dadosParaAtualizar = {}

    // Mapeia apenas propriedades válidas vindas do corpo da requisição
    if (req.body.dataInicio) dadosParaAtualizar.dataInicio = new Date(req.body.dataInicio)
    if (req.body.dataFim) dadosParaAtualizar.dataFim = new Date(req.body.dataFim)
    if (req.body.status) dadosParaAtualizar.status = req.body.status
    if (req.body.pacienteId) dadosParaAtualizar.pacienteId = Number(req.body.pacienteId)
    if (req.body.profissionalId) dadosParaAtualizar.profissionalId = Number(req.body.profissionalId)
    if (req.body.observacoes !== undefined) dadosParaAtualizar.observacoes = req.body.observacoes
    if (req.body.sala !== undefined) dadosParaAtualizar.sala = req.body.sala
    
    if (req.body.procedimento) {
      dadosParaAtualizar.retorno = req.body.procedimento === "RETORNO"
      dadosParaAtualizar.cor = req.body.procedimento === "RETORNO" ? "#e57373" : "#4fc3f7"
    }

    // 🔥 FORÇA O CAMPO 'atualizadoEm' A PEGAR A DATA ATUAL APENAS NO UPDATE
    dadosParaAtualizar.atualizadoEm = new Date()

    const consulta = await prisma.consulta.update({
      where: { id },
      data: dadosParaAtualizar,
      include: {
        paciente: true,
        professional: {
          include: { especialidade: true }
        }
      }
    })

    return res.json(consulta)

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

// BUSCAR
exports.buscar = async (req, res) => {
  try {
    const consulta = await prisma.consulta.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        paciente: true,
        profissional: {
          include: {
            especialidade: true
          }
        }
      }
    })

    return res.json(consulta)

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

// EXCLUIR
exports.excluir = async (req, res) => {
  try {
    await prisma.consulta.delete({
      where: {
        id: Number(req.params.id)
      }
    })

    return res.json({ message: 'Consulta removida' })

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

// ALTERAR STATUS
exports.alterarStatus = async (req, res) => {
  try {
    const { status } = req.body

    const consulta = await prisma.consulta.update({
      where: {
        id: Number(req.params.id)
      },
      data: { 
        status,
        atualizadoEm: new Date() // ✅ Garante a atualização aqui também!
      }
    })

    return res.json(consulta)

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}