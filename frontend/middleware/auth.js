export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return
  if (!localStorage.getItem('token')) {
    return navigateTo('/login')
  }
})
