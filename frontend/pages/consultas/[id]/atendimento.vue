<script setup>
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
navigateTo(`/consultas/${route.params.id}`, { replace: true })
</script>

<template><div>Teste</div></template>
