<template>
  <div class="error-shell">
    <div class="error-card">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <div class="error-code">{{ error?.statusCode || 404 }}</div>

      <h1 class="error-title">
        {{ is404 ? 'Rota não encontrada' : 'Erro interno' }}
      </h1>

      <p class="error-desc">
        {{ is404
          ? 'A página que você tentou acessar não existe ou foi removida.'
          : 'Algo deu errado no servidor. Tente novamente em instantes.' }}
      </p>

      <div class="error-actions">
        <button class="btn-home" @click="voltar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Ir para o Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props  = defineProps({ error: Object })
const router = useRouter()

const is404 = computed(() => props.error?.statusCode === 404 || !props.error?.statusCode)

function voltar() {
  clearError()
  router.push('/dashboard')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.error-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.error-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 4px 24px -4px rgba(15, 23, 42, 0.08);
  padding: 56px 48px;
  text-align: center;
  max-width: 460px;
  width: 100%;
}

.error-icon {
  width: 64px;
  height: 64px;
  background: #fef2f2;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #ef4444;
}

.error-icon svg {
  width: 32px;
  height: 32px;
}

.error-code {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 72px;
  font-weight: 800;
  color: #e2e8f0;
  line-height: 1;
  margin-bottom: 12px;
  letter-spacing: -3px;
}

.error-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px;
  letter-spacing: -0.4px;
}

.error-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
}

.btn-home svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-home:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}
</style>
