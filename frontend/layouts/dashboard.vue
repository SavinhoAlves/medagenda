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
</template>

<script setup>
import Header from '~/components/layout/Header.vue'
import ToastContainer from '~/components/ToastContainer.vue'
</script>

<style>
:root {
  --topbar-h:      64px;
  --bg-app:        #f8fafc;
  --bg-card:       #ffffff;
  --border-color:  #e2e8f0;
  --text-main:     #0f172a;
  --text-sub:      #64748b;
  --primary:       #059669;
  --primary-hover: #047857;
  --primary-bg:    #ecfdf5;
  --font-title:    'Plus Jakarta Sans', sans-serif;
  --font-body:     'Inter', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg-app);
  color: var(--text-main);
  font-family: var(--font-body);
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
