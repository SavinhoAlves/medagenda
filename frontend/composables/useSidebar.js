import { ref } from 'vue'

const collapsed = ref(false)

export function useSidebar() {
  function init() {
    if (typeof window !== 'undefined') {
      collapsed.value = localStorage.getItem('sidebar-collapsed') === 'true'
    }
  }

  function toggle() {
    collapsed.value = !collapsed.value
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed.value))
    }
  }

  return { collapsed, toggle, init }
}
