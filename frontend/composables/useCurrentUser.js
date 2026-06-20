export function useCurrentUser() {
  if (!process.client) return { usuario: null, isAdmin: true }
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    const isAdmin = usuario?.cargo === 'admin'
    return { usuario, isAdmin }
  } catch {
    return { usuario: null, isAdmin: false }
  }
}
