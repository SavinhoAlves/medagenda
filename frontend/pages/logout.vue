<script setup>

import { onMounted } from 'vue'

definePageMeta({
  layout: false
})

onMounted(() => {

  localStorage.removeItem('token')

  localStorage.removeItem('usuario')

  navigateTo('/login')

})

</script>

<template>

  <div class="logout-page">

    <div class="logout-box">

      Encerrando sessão...

    </div>

  </div>

</template>

<style scoped>

.logout-page {

  min-height: 100vh;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #080d10;

}

.logout-box {

  padding: 24px 32px;

  border-radius: 18px;

  background: rgba(255,255,255,.04);

  border: 1px solid rgba(255,255,255,.06);

  color: white;

  font-size: 14px;

}

</style>