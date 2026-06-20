<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useTheme } from './composables/useTheme'

const authStore = useAuthStore()
const { initTheme } = useTheme()

onMounted(() => {
  authStore.carregarUsuario()
  initTheme()
})
</script>

<template>
  <div class="app-root">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Estilos globais de reset para garantir que a Navbar fique 100% colada no topo */
html, body {
  margin: 0;
  padding: 0;
  background-color: #080d10;
  overflow-x: hidden;
}

/* Scrollbar personalizado (modo claro) */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Garante transições suaves caso mude de página */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>