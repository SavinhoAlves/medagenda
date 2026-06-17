import api from './api'

export const listarEspecialidades = async () => {
  const { data } = await api.get('/especialidades')
  return data
}

export const criarEspecialidade = async (payload) => {
  const { data } = await api.post('/especialidades', payload)
  return data
}

export const atualizarEspecialidade = async (id, payload) => {
  const { data } = await api.put(`/especialidades/${id}`, payload)
  return data
}

export const deletarEspecialidade = async (id) => {
  const { data } = await api.delete(`/especialidades/${id}`)
  return data
}