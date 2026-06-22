import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    token: null
  }),

  getters: {
    isAdmin:    (state) => state.usuario?.cargo === 'admin',
    isMedico:   (state) => state.usuario?.cargo === 'medico',
    isOperador: (state) => state.usuario?.cargo === 'operador',
  },

  actions: {
    async login(email, senha) {
      try {
        const response = await api.post('/auth/login', {
          email,
          senha
        })

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

        return true

      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        const token = this.token || localStorage.getItem('token')
        if (token) {
          await api.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        }
      } catch {
        // ignora erros de rede — logout local ocorre de qualquer forma
      } finally {
        this.usuario = null
        this.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('usuario')
        if (process.client) {
          window.location.href = '/login'
        }
      }
    },

    carregarUsuario() {
      if (!process.client) return

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