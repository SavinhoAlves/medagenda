import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    token: null
  }),

  actions: {
    async login(email, senha) {
      try {
        const response = await api.post('/auth/login', {
          email,
          senha
        })

        console.log('Resposta do Login:', response.data)

        const {
          accessToken,
          refreshToken,
          usuario
        } = response.data

        this.token = accessToken
        this.usuario = usuario

        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('usuario', JSON.stringify(usuario))

        // Retorna verdadeiro indicando que o login funcionou
        return true

      } catch (error) {
        console.error('Erro ao efetuar login na Store:', error)
        // Repassa o erro para o componente tratar de forma inteligente
        throw error
      }
    },

    logout() {
      this.usuario = null
      this.token = null

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')
      
      // No logout você pode usar o window.location ou delegar ao middleware/componente
      if (process.client) {
        window.location.href = '/login'
      }
    },

    carregarUsuario() {
      if (!process.client) return // Garante execução apenas no lado do cliente (SSR safety)

      const token = localStorage.getItem('token')
      const usuario = localStorage.getItem('usuario')

      if (token) {
        this.token = token
      }

      if (usuario) {
        this.usuario = JSON.parse(usuario)
      }
    }
  }
})