<template>
  <div>
    <Header />
    
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Header from '~/components/layout/Header.vue'
</script>

<style>
/* Aplique globalmente para redefinir todo o ecossistema do app */
:root {
  --bg-app: #f8fafc;          /* Fundo geral da aplicação (Slate 50) */
  --bg-card: #ffffff;         /* Cards brancos puros */
  --border-color: #e2e8f0;    /* Bordas sutis (Slate 200) */
  --text-main: #0f172a;       /* Texto principal quase preto (Slate 900) */
  --text-sub: #64748b;        /* Subtítulos e labels (Slate 500) */
  --primary: #059669;         /* Verde Esmeralda Médico Principal */
  --primary-hover: #047857;   /* Verde mais escuro para hover */
  --primary-bg: #ecfdf5;      /* Fundo de badge ou estado ativo verde */
  
  --font-title: 'Plus Jakarta Sans', 'Syne', sans-serif;
  --font-body: 'Inter', 'DM Sans', sans-serif;
}

body {
  background-color: var(--bg-app);
  color: var(--text-main);
  font-family: var(--font-body);
}

.main-content {
  /* 80px da altura do Header + 24px de margem opcional para respirar */
  padding-top: 104px; 
  min-height: 100vh;
  box-sizing: border-box;
}
</style>