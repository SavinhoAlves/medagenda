const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {

  const senhaHash = await bcrypt.hash(
    '123',
    10
  )

  const usuarioExiste = await prisma.usuario.findUnique({
    where: {
      email: 'admin@medagenda.com'
    }
  })

  if (usuarioExiste) {

    console.log('Usuário admin já existe')

    return
  }

  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@medagenda.com',
      senha: senhaHash,
      cargo: 'admin'
    }
  })

  console.log('✅ Usuário admin criado')

}

main()
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })