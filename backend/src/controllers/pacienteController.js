const prisma = require('../config/database')

function parseData(valor) {
  if (!valor) return null
  const s = String(valor)
  // DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dia, mes, ano] = s.split('/')
    const d = new Date(Number(ano), Number(mes) - 1, Number(dia))
    return isNaN(d.getTime()) ? null : d
  }
  // ISO ou qualquer formato que Date entenda
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function mapSexo(valor) {
  const mapa = { Masculino: 'MASCULINO', Feminino: 'FEMININO', Outro: 'OUTRO' }
  return mapa[valor] ?? (valor || null)
}

exports.listar = async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({ orderBy: { id: 'desc' } })
    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.criar = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      rg,
      cns,
      email,
      celular,
      casa,
      trabalho,
      dataNascimento,
      sexo,
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais,
      naturalidade,
      nacionalidade,
      etnia,
      religiao,
      estadoCivil,
      escolaridade,
      profissao,
      aceitaSms,
      ativo,
      obito,
      informacoesAdicionais,
    } = req.body

    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório.' })
    }

    if (cpf) {
      const existe = await prisma.paciente.findUnique({ where: { cpf } })
      if (existe) return res.status(400).json({ error: 'CPF já cadastrado.' })
    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf: cpf || null,
        rg: rg || null,
        cns: cns || null,
        email: email || null,
        telefone: celular || null,
        telefoneResidencial: casa || null,
        telefoneTrabalho: trabalho || null,
        dataNascimento: parseData(dataNascimento),
        sexo: mapSexo(sexo),
        cep: cep || null,
        endereco: endereco || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        pais: pais || null,
        naturalidade: naturalidade || null,
        nacionalidade: nacionalidade || null,
        etnia: etnia || null,
        religiao: religiao || null,
        estadoCivil: estadoCivil || null,
        escolaridade: escolaridade || null,
        profissao: profissao || null,
        aceitaSms: aceitaSms ?? true,
        ativo: ativo ?? true,
        obito: obito ?? false,
        informacoesAdicionais: informacoesAdicionais || null,
      },
    })

    return res.status(201).json(paciente)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.listarConvenios = async (req, res) => {
  try {
    const { id } = req.params
    const vinculos = await prisma.pacienteConvenio.findMany({
      where: { pacienteId: Number(id) },
      include: { convenio: true },
    })
    return res.json(
      vinculos.map((v) => ({
        id: v.convenio.id,
        nome: v.convenio.nome,
        numeroCarteira: v.numeroCarteira,
      }))
    )
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.listarConsultas = async (req, res) => {
  try {
    const consultas = await prisma.consulta.findMany({
      where: { pacienteId: Number(req.params.id) },
      include: { profissional: { include: { especialidade: true } } },
      orderBy: { dataInicio: 'desc' },
    })
    return res.json(consultas)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params
    const paciente = await prisma.paciente.findUnique({ where: { id: Number(id) } })
    if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado.' })
    return res.json(paciente)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nome,
      cpf,
      rg,
      cns,
      email,
      celular,
      casa,
      trabalho,
      telefone,
      telefoneResidencial,
      telefoneTrabalho,
      dataNascimento,
      sexo,
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais,
      naturalidade,
      nacionalidade,
      etnia,
      religiao,
      estadoCivil,
      escolaridade,
      profissao,
      aceitaSms,
      ativo,
      obito,
      informacoesAdicionais,
      observacoes,
    } = req.body

    const paciente = await prisma.paciente.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(cpf !== undefined && { cpf: cpf || null }),
        ...(rg !== undefined && { rg: rg || null }),
        ...(cns !== undefined && { cns: cns || null }),
        ...(email !== undefined && { email: email || null }),
        telefone: celular ?? telefone ?? undefined,
        telefoneResidencial: casa ?? telefoneResidencial ?? undefined,
        telefoneTrabalho: trabalho ?? telefoneTrabalho ?? undefined,
        ...(dataNascimento !== undefined && { dataNascimento: parseData(dataNascimento) }),
        ...(sexo !== undefined && { sexo: mapSexo(sexo) }),
        ...(cep !== undefined && { cep: cep || null }),
        ...(endereco !== undefined && { endereco: endereco || null }),
        ...(numero !== undefined && { numero: numero || null }),
        ...(complemento !== undefined && { complemento: complemento || null }),
        ...(bairro !== undefined && { bairro: bairro || null }),
        ...(cidade !== undefined && { cidade: cidade || null }),
        ...(estado !== undefined && { estado: estado || null }),
        ...(pais !== undefined && { pais: pais || null }),
        ...(naturalidade !== undefined && { naturalidade: naturalidade || null }),
        ...(nacionalidade !== undefined && { nacionalidade: nacionalidade || null }),
        ...(etnia !== undefined && { etnia: etnia || null }),
        ...(religiao !== undefined && { religiao: religiao || null }),
        ...(estadoCivil !== undefined && { estadoCivil: estadoCivil || null }),
        ...(escolaridade !== undefined && { escolaridade: escolaridade || null }),
        ...(profissao !== undefined && { profissao: profissao || null }),
        ...(aceitaSms !== undefined && { aceitaSms }),
        ...(ativo !== undefined && { ativo }),
        ...(obito !== undefined && { obito }),
        ...(informacoesAdicionais !== undefined && { informacoesAdicionais: informacoesAdicionais || null }),
        ...(observacoes !== undefined && { observacoes: observacoes || null }),
      },
    })

    return res.json(paciente)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.vincularConvenio = async (req, res) => {
  try {
    const { id } = req.params
    const { convenioId, numeroCarteira } = req.body

    if (!convenioId) {
      return res.status(400).json({ error: 'Convênio é obrigatório.' })
    }

    const existe = await prisma.pacienteConvenio.findFirst({
      where: { pacienteId: Number(id), convenioId: Number(convenioId) }
    })

    if (existe) {
      return res.status(400).json({ error: 'Este convênio já está vinculado ao paciente.' })
    }

    const vinculo = await prisma.pacienteConvenio.create({
      data: {
        pacienteId: Number(id),
        convenioId: Number(convenioId),
        numeroCarteira: numeroCarteira || null,
      },
      include: { convenio: true }
    })

    return res.status(201).json({
      id: vinculo.convenio.id,
      nome: vinculo.convenio.nome,
      numeroCarteira: vinculo.numeroCarteira,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.atualizarConvenio = async (req, res) => {
  try {
    const { id, convenioId } = req.params
    const { numeroCarteira } = req.body

    await prisma.pacienteConvenio.updateMany({
      where: { pacienteId: Number(id), convenioId: Number(convenioId) },
      data: { numeroCarteira: numeroCarteira || null },
    })

    return res.json({ message: 'Carteirinha atualizada.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.desvincularConvenio = async (req, res) => {
  try {
    const { id, convenioId } = req.params

    await prisma.pacienteConvenio.deleteMany({
      where: { pacienteId: Number(id), convenioId: Number(convenioId) }
    })

    return res.json({ message: 'Convênio desvinculado.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.paciente.delete({ where: { id: Number(id) } })
    return res.json({ message: 'Paciente removido.' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
