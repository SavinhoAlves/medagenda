const prisma = require('../config/database')

exports.listar = async (req, res) => {
  try {
    const convenios = await prisma.convenio.findMany({
      orderBy: { nome: 'asc' }
    })

    return res.json(convenios)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
