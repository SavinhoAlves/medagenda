<template>
  <div class="app-shell">
    <div class="app-body">
      <Header />
      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
  <ToastContainer />
  <UiConfirmDialog />
  <AIAssistant />
</template>

<script setup>
import Header from '~/components/layout/Header.vue'
import ToastContainer from '~/components/ToastContainer.vue'
import AIAssistant from '~/components/AIAssistant.vue'
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg-app);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding-top: var(--topbar-h);
  background: var(--bg-app);
}
</style>
