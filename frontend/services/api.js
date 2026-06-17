import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  // Ignora o header para a rota de login
  if (config.url.includes('/auth/login')) {
    return config
  }

  const authStore = useAuthStore()
  
  // CORREÇÃO DA CHAVE: Buscando 'accessToken' de forma padronizada
  const token = authStore.token || (process.client ? localStorage.getItem('token') : null)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn(`[Axios Interceptor] Token não encontrado para a rota: ${config.url}`)
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api