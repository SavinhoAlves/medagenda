<template>
  <div></div>
</template>

<script setup>

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

await navigateTo('/login')

</script>