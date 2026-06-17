import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001', // Conecta diretamente com o seu back-end ajustado
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Se você usa token de autenticação, o interceptor abaixo garante o envio automático
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') // Ou como você gerencia o token do 'middleware: auth'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api