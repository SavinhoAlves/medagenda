const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')
const prisma = new PrismaClient()

// ── helpers ──────────────────────────────────────────────────────────────────

function notFound(res, msg = 'Não encontrado') {
  return res.status(404).json({ error: msg })
}

function fileInfo(file) {
  if (!file) return {}
  return {
    arquivo: file.path.replace(/\\/g, '/'),
    arquivoNome: file.originalname,
    arquivoTipo: file.mimetype,
    arquivoTamanho: file.size
  }
}

function removeFile(filePath) {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

// ── Prontuário (raiz) ─────────────────────────────────────────────────────────

// GET /prontuarios/consulta/:consultaId
exports.getOrCreate = async (req, res) => {
  try {
    const consultaId = parseInt(req.params.consultaId)
    let prontuario = await prisma.prontuario.findUnique({
      where: { consultaId },
      include: {
        sinaisVitais: true,
        anamnese: true,
        exameFisico: true,
        conduta: true,
        hipoteses: { include: { cid10: true }, orderBy: { id: 'asc' } },
        examesSolicitados: { orderBy: { criadoEm: 'asc' } },
        resultadosExames: { orderBy: { criadoEm: 'desc' } },
        prescricoes: { include: { itens: { include: { medicamento: true } } }, orderBy: { emitidaEm: 'desc' } },
        documentos: { orderBy: { emitidoEm: 'desc' } },
        anexos: { orderBy: { criadoEm: 'desc' } },
        acompanhamentos: { include: { medico: { select: { id: true, nome: true } } }, orderBy: { criadoEm: 'asc' } }
      }
    })
    if (!prontuario) {
      const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } })
      if (!consulta) return notFound(res, 'Consulta não encontrada')
      prontuario = await prisma.prontuario.create({
        data: { consultaId },
        include: {
          sinaisVitais: true, anamnese: true, exameFisico: true, conduta: true,
          hipoteses: true, examesSolicitados: true, resultadosExames: true,
          prescricoes: { include: { itens: true } }, documentos: true, anexos: true, acompanhamentos: true
        }
      })
    }
    res.json(prontuario)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}

// ── Sinais Vitais ─────────────────────────────────────────────────────────────

// PUT /prontuarios/:id/sinais-vitais
exports.salvarSinaisVitais = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { pressaoSistolica, pressaoDiastolica, frequenciaCardiaca, frequenciaRespiratoria,
      saturacaoO2, temperatura, peso, altura, circunferenciaAbdominal, glicemia } = req.body

    let imc = null
    if (peso && altura) imc = parseFloat((peso / (altura * altura)).toFixed(2))

    const data = {
      pressaoSistolica: pressaoSistolica ? parseInt(pressaoSistolica) : null,
      pressaoDiastolica: pressaoDiastolica ? parseInt(pressaoDiastolica) : null,
      frequenciaCardiaca: frequenciaCardiaca ? parseInt(frequenciaCardiaca) : null,
      frequenciaRespiratoria: frequenciaRespiratoria ? parseInt(frequenciaRespiratoria) : null,
      saturacaoO2: saturacaoO2 ? parseFloat(saturacaoO2) : null,
      temperatura: temperatura ? parseFloat(temperatura) : null,
      peso: peso ? parseFloat(peso) : null,
      altura: altura ? parseFloat(altura) : null,
      imc,
      circunferenciaAbdominal: circunferenciaAbdominal ? parseFloat(circunferenciaAbdominal) : null,
      glicemia: glicemia ? parseFloat(glicemia) : null
    }

    const sinais = await prisma.sinaisVitais.upsert({
      where: { prontuarioId },
      create: { prontuarioId, ...data },
      update: data
    })
    res.json(sinais)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Anamnese ──────────────────────────────────────────────────────────────────

// PUT /prontuarios/:id/anamnese
exports.salvarAnamnese = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { queixaPrincipal, historiaDoencaAtual, antecedentesPessoais, antecedentesFamiliares,
      habitosVida, medicamentosUso, alergias, vacinacao, revisaoSistemas } = req.body

    const data = { queixaPrincipal, historiaDoencaAtual, antecedentesPessoais, antecedentesFamiliares,
      habitosVida, medicamentosUso, alergias, vacinacao, revisaoSistemas }

    const anamnese = await prisma.anamnese.upsert({
      where: { prontuarioId },
      create: { prontuarioId, ...data },
      update: data
    })
    res.json(anamnese)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Exame Físico ──────────────────────────────────────────────────────────────

// PUT /prontuarios/:id/exame-fisico
exports.salvarExameFisico = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { estadoGeral, pele, cabecaPescoco, toracoRespiratorio, toracoCardiaco,
      abdome, membrosPelve, neurologico, outrosAchados } = req.body

    const data = { estadoGeral, pele, cabecaPescoco, toracoRespiratorio, toracoCardiaco,
      abdome, membrosPelve, neurologico, outrosAchados }

    const exame = await prisma.exameFisico.upsert({
      where: { prontuarioId },
      create: { prontuarioId, ...data },
      update: data
    })
    res.json(exame)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Hipóteses Diagnósticas ────────────────────────────────────────────────────

// POST /prontuarios/:id/hipoteses
exports.adicionarHipotese = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { cid10Id, cidManual, descricao, tipo, confirmado } = req.body

    const hipotese = await prisma.hipoteseDiagnostica.create({
      data: { prontuarioId, cid10Id: cid10Id ? parseInt(cid10Id) : null,
        cidManual, descricao, tipo: tipo || 'PRINCIPAL', confirmado: !!confirmado },
      include: { cid10: true }
    })
    res.status(201).json(hipotese)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// PATCH /prontuarios/:id/hipoteses/:hipoteseId
exports.atualizarHipotese = async (req, res) => {
  try {
    const hipotese = await prisma.hipoteseDiagnostica.update({
      where: { id: parseInt(req.params.hipoteseId) },
      data: req.body,
      include: { cid10: true }
    })
    res.json(hipotese)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/hipoteses/:hipoteseId
exports.removerHipotese = async (req, res) => {
  try {
    await prisma.hipoteseDiagnostica.delete({ where: { id: parseInt(req.params.hipoteseId) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Conduta ───────────────────────────────────────────────────────────────────

// PUT /prontuarios/:id/conduta
exports.salvarConduta = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { planoTerapeutico, orientacoes, restricoes, encaminhamento, observacoes,
      retornoDescricao, dataRetorno } = req.body

    const data = { planoTerapeutico, orientacoes, restricoes, encaminhamento, observacoes,
      retornoDescricao, dataRetorno: dataRetorno ? new Date(dataRetorno) : null }

    const conduta = await prisma.conduta.upsert({
      where: { prontuarioId },
      create: { prontuarioId, ...data },
      update: data
    })
    res.json(conduta)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Exames Solicitados ────────────────────────────────────────────────────────

// POST /prontuarios/:id/exames-solicitados
exports.adicionarExame = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { tipo, nome, codigo, indicacao, urgente } = req.body
    const exame = await prisma.exameSolicitado.create({
      data: { prontuarioId, tipo: tipo || 'LABORATORIAL', nome, codigo, indicacao, urgente: !!urgente }
    })
    res.status(201).json(exame)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// PATCH /prontuarios/:id/exames-solicitados/:exameId
exports.atualizarExame = async (req, res) => {
  try {
    const exame = await prisma.exameSolicitado.update({
      where: { id: parseInt(req.params.exameId) },
      data: req.body
    })
    res.json(exame)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/exames-solicitados/:exameId
exports.removerExame = async (req, res) => {
  try {
    await prisma.exameSolicitado.delete({ where: { id: parseInt(req.params.exameId) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Resultado de Exame (com upload) ──────────────────────────────────────────

// POST /prontuarios/:id/resultados
exports.adicionarResultado = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { nome, tipo, origem, dataColeta, dataResultado, conteudo, interpretacao, observacoes } = req.body

    const resultado = await prisma.resultadoExame.create({
      data: {
        prontuarioId, nome, tipo: tipo || 'LABORATORIAL', origem: origem || 'EXTERNO',
        dataColeta: dataColeta ? new Date(dataColeta) : null,
        dataResultado: dataResultado ? new Date(dataResultado) : null,
        conteudo, interpretacao, observacoes,
        ...fileInfo(req.file)
      }
    })
    res.status(201).json(resultado)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/resultados/:resultadoId
exports.removerResultado = async (req, res) => {
  try {
    const r = await prisma.resultadoExame.findUnique({ where: { id: parseInt(req.params.resultadoId) } })
    if (!r) return notFound(res)
    removeFile(r.arquivo)
    await prisma.resultadoExame.delete({ where: { id: r.id } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Prescrições ───────────────────────────────────────────────────────────────

// POST /prontuarios/:id/prescricoes
exports.criarPrescricao = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { tipo, observacoes, validade, itens } = req.body

    const prescricao = await prisma.prescricao.create({
      data: {
        prontuarioId, tipo: tipo || 'SIMPLES', observacoes,
        validade: validade ? new Date(validade) : null,
        itens: { create: (itens || []).map(i => ({
          medicamentoId: i.medicamentoId ? parseInt(i.medicamentoId) : null,
          medicamentoManual: i.medicamentoManual,
          apresentacao: i.apresentacao, dose: i.dose, via: i.via,
          frequencia: i.frequencia, duracao: i.duracao, quantidade: i.quantidade, instrucoes: i.instrucoes
        }))}
      },
      include: { itens: { include: { medicamento: true } } }
    })
    res.status(201).json(prescricao)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/prescricoes/:prescricaoId
exports.removerPrescricao = async (req, res) => {
  try {
    await prisma.prescricao.delete({ where: { id: parseInt(req.params.prescricaoId) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Documentos e Atestados ────────────────────────────────────────────────────

// POST /prontuarios/:id/documentos
exports.adicionarDocumento = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { tipo, titulo, conteudo, diasAfastamento, dataInicio, dataFim } = req.body

    const doc = await prisma.documentoAtestado.create({
      data: {
        prontuarioId, tipo, titulo, conteudo,
        diasAfastamento: diasAfastamento ? parseInt(diasAfastamento) : null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
        ...fileInfo(req.file)
      }
    })
    res.status(201).json(doc)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/documentos/:docId
exports.removerDocumento = async (req, res) => {
  try {
    const doc = await prisma.documentoAtestado.findUnique({ where: { id: parseInt(req.params.docId) } })
    if (!doc) return notFound(res)
    removeFile(doc.arquivo)
    await prisma.documentoAtestado.delete({ where: { id: doc.id } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Imagens e Anexos ──────────────────────────────────────────────────────────

// POST /prontuarios/:id/anexos
exports.adicionarAnexo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo obrigatório' })
    const prontuarioId = parseInt(req.params.id)
    const { titulo, descricao, categoria } = req.body

    const anexo = await prisma.anexo.create({
      data: {
        prontuarioId, titulo, descricao, categoria: categoria || 'GERAL',
        ...fileInfo(req.file)
      }
    })
    res.status(201).json(anexo)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/anexos/:anexoId
exports.removerAnexo = async (req, res) => {
  try {
    const anexo = await prisma.anexo.findUnique({ where: { id: parseInt(req.params.anexoId) } })
    if (!anexo) return notFound(res)
    removeFile(anexo.arquivo)
    await prisma.anexo.delete({ where: { id: anexo.id } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Acompanhamento / Evolução ─────────────────────────────────────────────────

// POST /prontuarios/:id/acompanhamentos
exports.adicionarAcompanhamento = async (req, res) => {
  try {
    const prontuarioId = parseInt(req.params.id)
    const { evolucao, tipo, medicoId } = req.body

    if (!evolucao) return res.status(400).json({ error: 'evolucao é obrigatório' })
    if (!medicoId) return res.status(400).json({ error: 'medicoId é obrigatório' })

    const entrada = await prisma.acompanhamentoEntrada.create({
      data: { prontuarioId, evolucao, tipo: tipo || 'EVOLUTIVA', medicoId: parseInt(medicoId) },
      include: { medico: { select: { id: true, nome: true } } }
    })
    res.status(201).json(entrada)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// PATCH /prontuarios/:id/acompanhamentos/:entradaId
exports.atualizarAcompanhamento = async (req, res) => {
  try {
    const entrada = await prisma.acompanhamentoEntrada.update({
      where: { id: parseInt(req.params.entradaId) },
      data: { evolucao: req.body.evolucao, tipo: req.body.tipo },
      include: { medico: { select: { id: true, nome: true } } }
    })
    res.json(entrada)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// DELETE /prontuarios/:id/acompanhamentos/:entradaId
exports.removerAcompanhamento = async (req, res) => {
  try {
    await prisma.acompanhamentoEntrada.delete({ where: { id: parseInt(req.params.entradaId) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── CID-10 (busca) ────────────────────────────────────────────────────────────

// GET /cid10?q=texto&limit=20
exports.buscarCid10 = async (req, res) => {
  try {
    const q = req.query.q || ''
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const cids = await prisma.cid10.findMany({
      where: {
        ativo: true,
        OR: [
          { codigo: { contains: q } },
          { descricao: { contains: q } }
        ]
      },
      take: limit,
      orderBy: { codigo: 'asc' }
    })
    res.json(cids)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ── Medicamentos (busca) ──────────────────────────────────────────────────────

// GET /medicamentos?q=texto&limit=20
exports.buscarMedicamentos = async (req, res) => {
  try {
    const q = req.query.q || ''
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const meds = await prisma.medicamento.findMany({
      where: {
        ativo: true,
        OR: [
          { nome: { contains: q } },
          { principioAtivo: { contains: q } }
        ]
      },
      take: limit,
      orderBy: { nome: 'asc' }
    })
    res.json(meds)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
