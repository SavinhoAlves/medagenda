import api from '~/services/api'
import { useAuthStore } from '@/stores/auth'

export const usePacientes = () => {
  const authStore = useAuthStore()

  // Função auxiliar para gerar o cabeçalho de autorização com o token atualizado
  const getConfig = () => {
    const token = authStore.accessToken || authStore.token || localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  const listarPacientes = async () => {
    // Passa o objeto de configuração (com os headers) como segundo argumento no GET
    const response = await api.get('/pacientes', getConfig())
    return response.data
  }

  const buscarPaciente = async (id) => {
    const response = await api.get(`/pacientes/${id}`, getConfig())
    return response.data
  }

  const criarPaciente = async (dados) => {
    // No POST, a configuração com os headers é o terceiro argumento (depois do body/dados)
    const response = await api.post('/pacientes', dados, getConfig())
    return response.data
  }

  const atualizarPaciente = async (id, dados) => {
    // No PUT, também é o terceiro argumento
    const response = await api.put(`/pacientes/${id}`, dados, getConfig())
    return response.data
  }

  const removerPaciente = async (id) => {
    await api.delete(`/pacientes/${id}`, getConfig())
  }

  return {
    listarPacientes,
    buscarPaciente,
    criarPaciente,
    atualizarPaciente,
    removerPaciente
  }
}