const prisma = require('../config/database')

exports.criar = async (req, res) => {
  try {
    const { consultaId, motivo } = req.body

    if (!consultaId || !motivo?.trim()) {
      return res.status(400).json({ error: 'Consulta e motivo são obrigatórios.' })
    }

    const solicitacao = await prisma.solicitacaoExclusao.create({
      data: {
        consultaId:    Number(consultaId),
        solicitanteId: req.usuario.id,
        motivo:        motivo.trim(),
      },
      include: {
        solicitante: { select: { nome: true, email: true } },
        consulta: {
          include: {
            paciente:     { select: { nome: true } },
            profissional: { select: { nome: true } },
          },
        },
      },
    })

    // Notifica todos os usuários admin
    const admins = await prisma.usuario.findMany({
      where: { cargo: 'admin' },
      select: { id: true },
    })

    if (admins.length > 0) {
      await prisma.notificacao.createMany({
        data: admins.map(admin => ({
          usuarioId: admin.id,
          titulo: 'Pedido de exclusão de consulta',
          mensagem: `${solicitacao.solicitante.nome} solicitou a exclusão da consulta de ${solicitacao.consulta.paciente.nome}`,
          tipo: 'SOLICITACAO_EXCLUSAO',
          link: '/solicitacoes',
        })),
      })
    }

    return res.status(201).json(solicitacao)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.listar = async (req, res) => {
  try {
    const { status = 'PENDENTE' } = req.query

    const solicitacoes = await prisma.solicitacaoExclusao.findMany({
      where: { status },
      include: {
        solicitante: { select: { nome: true, email: true, cargo: true } },
        consulta: {
          include: {
            paciente:     { select: { nome: true } },
            profissional: { select: { nome: true } },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return res.json(solicitacoes)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.contarPendentes = async (req, res) => {
  try {
    const count = await prisma.solicitacaoExclusao.count({
      where: { status: 'PENDENTE' },
    })
    return res.json({ count })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.aprovar = async (req, res) => {
  try {
    const { id } = req.params

    const solicitacao = await prisma.solicitacaoExclusao.findUnique({
      where: { id: Number(id) },
      include: {
        consulta: { include: { paciente: { select: { nome: true } } } },
      },
    })

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' })
    }

    await prisma.$transaction([
      prisma.solicitacaoExclusao.update({
        where: { id: Number(id) },
        data: { status: 'APROVADO' },
      }),
      prisma.consulta.delete({
        where: { id: solicitacao.consultaId },
      }),
    ])

    await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.solicitanteId,
        titulo: 'Solicitação aprovada',
        mensagem: `Sua solicitação de exclusão da consulta de ${solicitacao.consulta.paciente.nome} foi aprovada.`,
        tipo: 'GERAL',
        link: '/consultas',
      },
    })

    return res.json({ mensagem: 'Solicitação aprovada e consulta excluída.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.rejeitar = async (req, res) => {
  try {
    const { id } = req.params

    const solicitacao = await prisma.solicitacaoExclusao.findUnique({
      where: { id: Number(id) },
      include: {
        consulta: { include: { paciente: { select: { nome: true } } } },
      },
    })

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' })
    }

    await prisma.solicitacaoExclusao.update({
      where: { id: Number(id) },
      data: { status: 'REJEITADO' },
    })

    await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.solicitanteId,
        titulo: 'Solicitação rejeitada',
        mensagem: `Sua solicitação de exclusão da consulta de ${solicitacao.consulta.paciente.nome} foi rejeitada pelo administrador.`,
        tipo: 'GERAL',
        link: '/consultas',
      },
    })

    return res.json({ mensagem: 'Solicitação rejeitada.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
