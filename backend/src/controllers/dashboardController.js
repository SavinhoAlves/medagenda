const prisma = require('../config/database')

exports.resumo = async (req, res) => {

  try {

    const [
      pacientes,
      profissionais,
      consultas,
      consultasHoje,
      ultimasConsultas
    ] = await Promise.all([

      prisma.paciente.count(),

      prisma.profissional.count(),

      prisma.consulta.count(),

      prisma.consulta.count({

        where: {

          dataInicio: {

            gte: new Date(
              new Date().setHours(0,0,0,0)
            ),

            lte: new Date(
              new Date().setHours(23,59,59,999)
            )

          }

        }

      }),

      prisma.consulta.findMany({

        take: 5,

        orderBy: {
          criadoEm: 'desc'
        },

        include: {

          paciente: true,

          profissional: true

        }

      })

    ])

    return res.json({

      pacientes,

      profissionais,

      consultas,

      consultasHoje,

      ultimasConsultas

    })

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })

  }

}