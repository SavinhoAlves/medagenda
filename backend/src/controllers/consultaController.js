const prisma = require('../config/database')

exports.listar = async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
      include: {
        paciente: true,
        profissional: { include: { especialidade: true } }
      },
      orderBy: { dataInicio: 'asc' }
    })
    return res.json(consultas)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.criar = async (req, res) => {
  try {
    const {
      pacienteId,
      profissionalId,
      dataConsulta,
      dataInicio: dataInicioRaw,
      dataFim: dataFimRaw,
      status,
      observacoes,
      valor,
      sala,
      convenio,
      procedimento
    } = req.body

    // Aceita tanto dataConsulta (frontend de novo.vue) quanto dataInicio/dataFim (agenda)
    const dataInicio = dataInicioRaw ? new Date(dataInicioRaw) : dataConsulta ? new Date(dataConsulta) : null
    const dataFim = dataFimRaw ? new Date(dataFimRaw) : dataInicio ? new Date(dataInicio.getTime() + 60 * 60 * 1000) : null

    if (!pacienteId || !profissionalId || !dataInicio) {
      return res.status(400).json({ error: 'Paciente, profissional e data são obrigatórios.' })
    }

    const usuarioId = req.usuario?.id ? Number(req.usuario.id) : null

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId: Number(pacienteId),
        profissionalId: Number(profissionalId),
        usuarioId,
        dataInicio,
        dataFim,
        status: status || 'AGENDADA',
        observacoes: observacoes || null,
        valor: valor ? Number(valor) : null,
        sala: sala || null,
        retorno: procedimento === 'RETORNO',
        cor: procedimento === 'RETORNO' ? '#e57373' : '#4fc3f7',
        titulo: procedimento === 'RETORNO'
          ? 'Retorno'
          : procedimento === 'EXAME'
            ? 'Exame Diagnóstico'
            : 'Consulta Médica',
        descricao: convenio ? `Convênio: ${convenio}` : null
      },
      include: {
        paciente: true,
        profissional: { include: { especialidade: true } }
      }
    })

    return res.status(201).json(consulta)
  } catch (error) {
    console.error('Erro ao criar consulta:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizar = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const dados = {}

    if (req.body.dataInicio) dados.dataInicio = new Date(req.body.dataInicio)
    if (req.body.dataFim) dados.dataFim = new Date(req.body.dataFim)
    if (req.body.status) dados.status = req.body.status
    if (req.body.pacienteId) dados.pacienteId = Number(req.body.pacienteId)
    if (req.body.profissionalId) dados.profissionalId = Number(req.body.profissionalId)
    if (req.body.observacoes !== undefined) dados.observacoes = req.body.observacoes
    if (req.body.valor !== undefined) dados.valor = req.body.valor ? Number(req.body.valor) : null
    if (req.body.sala !== undefined) dados.sala = req.body.sala

    if (req.body.procedimento) {
      dados.retorno = req.body.procedimento === 'RETORNO'
      dados.cor = req.body.procedimento === 'RETORNO' ? '#e57373' : '#4fc3f7'
      dados.titulo = req.body.procedimento === 'RETORNO'
        ? 'Retorno'
        : req.body.procedimento === 'EXAME'
          ? 'Exame Diagnóstico'
          : 'Consulta Médica'
    }

    if (req.body.convenio !== undefined) {
      dados.descricao = req.body.convenio ? `Convênio: ${req.body.convenio}` : null
    }

    const consulta = await prisma.consulta.update({
      where: { id },
      data: dados,
      include: {
        paciente: true,
        profissional: { include: { especialidade: true } }
      }
    })

    return res.json(consulta)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.buscar = async (req, res) => {
  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        paciente: true,
        profissional: { include: { especialidade: true } }
      }
    })
    if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada.' })
    return res.json(consulta)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.excluir = async (req, res) => {
  try {
    await prisma.consulta.delete({ where: { id: Number(req.params.id) } })
    return res.json({ message: 'Consulta removida.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.alterarStatus = async (req, res) => {
  try {
    const { status } = req.body
    const consulta = await prisma.consulta.update({
      where: { id: Number(req.params.id) },
      data: { status }
    })
    return res.json(consulta)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
