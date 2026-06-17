import api from '~/services/api'

export const useProfissionais = () => {

  const listarProfissionais = async () => {

    const response = await api.get('/profissionais')

    return response.data

  }

  const buscarProfissional = async (id) => {

    const response = await api.get(`/profissionais/${id}`)

    return response.data

  }

  const criarProfissional = async (dados) => {

    const response = await api.post('/profissionais', dados)

    return response.data

  }

  const atualizarProfissional = async (id, dados) => {

    const response = await api.put(`/profissionais/${id}`, dados)

    return response.data

  }

  const removerProfissional = async (id) => {

    await api.delete(`/profissionais/${id}`)

  }

  return {

    listarProfissionais,
    buscarProfissional,
    criarProfissional,
    atualizarProfissional,
    removerProfissional

  }

}