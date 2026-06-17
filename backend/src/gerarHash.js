const bcrypt = require('bcryptjs')

async function gerarSenha() {
  const hash = await bcrypt.hash('123', 10)
  console.log(hash)
}

gerarSenha()