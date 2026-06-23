import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return
  const cargo = useAuthStore().usuario?.cargo
  if (!cargo) return
  if (cargo !== 'medico' && cargo !== 'admin') {
    return navigateTo('/agenda')
  }
})
