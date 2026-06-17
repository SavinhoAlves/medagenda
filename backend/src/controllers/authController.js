const prisma = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const gerarAccessToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      cargo: usuario.cargo
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  )
}

const gerarRefreshToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  )
}

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body

    console.log('\n=============================================')
    console.log('📥 [Backend] Nova tentativa de login recebida')
    console.log('📧 E-mail recebido:', email)
    console.log('🔑 Senha recebida (texto limpo):', senha)

    const usuario = await prisma.usuario.findUnique({
      where: {
        email
      }
    })

    if (!usuario) {
      console.log('❌ [Backend] Usuário não encontrado no banco.')
      return res.status(400).json({
        error: 'Usuário não encontrado'
      })
    }

    console.log('📦 [Backend] Usuário localizado no banco de dados!')
    console.log('💾 Senha registrada atualmente no banco:', usuario.senha)

    // 1. Verificação oficial por BCrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    console.log('📊 [Backend] O BCrypt validou a senha? ->', senhaValida)

    // 2. Verificação Fallback (Texto limpo para quando você colocar "123" direto no Prisma Studio)
    const senhaTextoLimpoValida = (senha === usuario.senha)
    console.log('📊 [Backend] O texto limpo exato bateu? ->', senhaTextoLimpoValida)

    // Se as duas formas falharem, bloqueia o acesso
    if (!senhaValida && !senhaTextoLimpoValida) {
      console.log('❌ [Backend] Falha total: As duas validações de senha falharam.')
      return res.status(400).json({
        error: 'Senha inválida'
      })
    }

    console.log('✅ [Backend] Senha aprovada! Gerando tokens JWT...')

    const accessToken = gerarAccessToken(usuario)
    const refreshToken = gerarRefreshToken(usuario)

    await prisma.usuario.update({
      where: {
        id: usuario.id
      },
      data: {
        refreshToken
      }
    })

    console.log('🚀 [Backend] Tokens salvos e resposta enviada com sucesso!')
    console.log('=============================================\n')

    return res.json({
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      }
    })

  } catch (error) {
    console.log('💥 [Backend] Erro interno capturado:', error)
    return res.status(500).json({
      error: error.message
    })
  }
}