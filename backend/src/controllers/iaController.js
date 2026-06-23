const prisma = require('../config/database')

const APP_DESCRIPTION = `
O MedAgenda é um sistema de gestão de clínicas médicas.
Stack: Nuxt 4 + Vue 3 + Tailwind CSS (frontend), Express.js + Prisma + MySQL (backend).
Funcionalidades: agendamento de consultas (FullCalendar), prontuário eletrônico (EMR), gestão de pacientes, convênios, profissionais, notificações em tempo real, solicitações de exclusão e controle de acesso por cargo (admin, médico, operador).
`.trim()

function buildSystemPrompt(modo, nome, cargo, paginaAtual) {
  const ctx = `Você auxilia ${nome} (cargo: ${cargo}) no sistema MedAgenda${paginaAtual ? `, atualmente na página "${paginaAtual}"` : ''}.`

  switch (modo) {
    case 'specs':
      return `${ctx}\n\n${APP_DESCRIPTION}\n\nVocê é arquiteto de software especializado em sistemas de saúde. Ao receber um pedido de nova funcionalidade, gere uma especificação técnica detalhada em Markdown com as seções: ## Descrição Geral, ## Telas e Componentes (campos, validações, comportamentos), ## Regras de Negócio, ## API Endpoints (método, path, body, resposta), ## Banco de Dados (tabelas e campos novos), ## Estimativa de Complexidade (Baixa / Média / Alta com justificativa). Seja detalhado e preciso. Responda em português.`

    case 'contextual':
      return `${ctx}\n\n${APP_DESCRIPTION}\n\nVocê conhece o sistema por dentro. Responda dúvidas sobre como usar o sistema na página atual, explique fluxos de trabalho, oriente sobre funcionalidades específicas, dê dicas operacionais e clínicas. Seja específico, prático e direto. Responda em português.`

    case 'codigo':
      return `${ctx}\n\n${APP_DESCRIPTION}\n\nVocê é desenvolvedor sênior especialista na stack do projeto. Padrões obrigatórios: Vue 3 com <script setup>, Tailwind CSS + CSS variables (--bg-card, --text-main, --border-color, --primary) para temas dark/light, dark mode com classes Tailwind dark:, Express.js com authMiddleware (req.usuario), Prisma ORM com MySQL (datasource "banco"). Ao receber um pedido, gere código completo e funcional — inclua todos os arquivos necessários: componente .vue, rota Express + controller, model Prisma, SQL de migration. Responda em português.`

    default:
      return `${ctx}\n\n${APP_DESCRIPTION}\n\nSeja um assistente prestativo para o sistema MedAgenda. Colete sugestões de melhoria, responda dúvidas operacionais, oriente sobre o uso do sistema. Seja conciso e amigável. Responda em português.`
  }
}

exports.chat = async (req, res) => {
  try {
    const { mensagens, modo = 'chat', paginaAtual } = req.body
    const { nome, cargo } = req.usuario

    if (!mensagens?.length) {
      return res.status(400).json({ error: 'Mensagens são obrigatórias' })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor' })
    }

    const systemPrompt = buildSystemPrompt(modo, nome, cargo, paginaAtual)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: mensagens,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('[IA] Anthropic API error:', err)
      return res.status(502).json({ error: 'Erro ao contatar a IA', details: err?.error?.message })
    }

    const data = await response.json()
    return res.json({ resposta: data.content[0].text })
  } catch (error) {
    console.error('[IA] chat error:', error)
    return res.status(500).json({ error: error.message })
  }
}

exports.salvarSugestao = async (req, res) => {
  try {
    const { titulo, descricao, especificacao, codigoGerado, modo, paginaContexto } = req.body

    if (!titulo?.trim() || !descricao?.trim()) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' })
    }

    const sugestao = await prisma.sugestao.create({
      data: {
        usuarioId: req.usuario.id,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        especificacao: especificacao || null,
        codigoGerado: codigoGerado || null,
        modo: modo || 'chat',
        paginaContexto: paginaContexto || null,
        status: 'PENDENTE',
      },
    })
    return res.status(201).json(sugestao)
  } catch (error) {
    console.error('[IA] salvarSugestao error:', error)
    return res.status(500).json({ error: error.message })
  }
}

exports.listarSugestoes = async (req, res) => {
  try {
    const where = req.usuario.cargo === 'admin' ? {} : { usuarioId: req.usuario.id }
    const sugestoes = await prisma.sugestao.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { usuario: { select: { nome: true, cargo: true } } },
    })
    return res.json(sugestoes)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizarStatusSugestao = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (req.usuario.cargo !== 'admin') {
      return res.status(403).json({ error: 'Apenas admins podem atualizar o status' })
    }

    const sugestao = await prisma.sugestao.update({
      where: { id: Number(id) },
      data: { status },
    })
    return res.json(sugestao)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
