<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.carregarUsuario()
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