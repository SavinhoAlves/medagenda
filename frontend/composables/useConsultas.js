import api from '~/services/api'

export const useConsultas = () => {

  const listarConsultas = async () => {

    const response = await api.get('/consultas')

    return response.data

  }

  const buscarConsulta = async (id) => {

    const response = await api.get(`/consultas/${id}`)

    return response.data

  }

  const criarConsulta = async (dados) => {

    const response = await api.post('/consultas', dados)

    return response.data

  }

  const atualizarConsulta = async (id, dados) => {

    const response = await api.put(`/consultas/${id}`, dados)

    return response.data

  }

  const removerConsulta = async (id) => {

    await api.delete(`/consultas/${id}`)

  }

  return {

    listarConsultas,
    buscarConsulta,
    criarConsulta,
    atualizarConsulta,
    removerConsulta

  }

}