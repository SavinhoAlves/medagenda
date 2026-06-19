<template>
  <NuxtPage />
</template>

<script setup>
// Configuração centralizada de Layout e Autenticação para todo o módulo de Convênios
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>