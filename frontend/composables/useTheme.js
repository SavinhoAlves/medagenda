import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function apply(dark) {
    isDark.value = dark
    if (process.client) {
      document.documentElement.classList.toggle('dark', dark)
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  function toggleTheme() {
    apply(!isDark.value)
  }

  function initTheme() {
    if (!process.client) return
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    apply(saved ? saved === 'dark' : prefersDark)
  }

  return { isDark, toggleTheme, initTheme }
}
