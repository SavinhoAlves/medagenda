import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const auth = useAuthStore()
    if (auth.usuario?.cargo === 'operador') {
      return navigateTo('/agenda')
    }
  }
})
