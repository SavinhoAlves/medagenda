import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.usuario?.cargo !== 'medico') {
    return navigateTo('/dashboard')
  }
})
