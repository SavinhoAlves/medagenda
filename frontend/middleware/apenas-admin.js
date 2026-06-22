import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const auth = useAuthStore()
    const cargo = auth.usuario?.cargo
    if (cargo && cargo !== 'admin') {
      return navigateTo(cargo === 'medico' ? '/agenda' : '/agenda')
    }
  }
})
