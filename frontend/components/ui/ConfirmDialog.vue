<template>
  <Transition name="confirm-fade">
    <div v-if="visivel" class="confirm-overlay" @click.self="_recusar">
      <div class="confirm-box" :class="`confirm-box--${opcoes.variante}`">
        <div class="confirm-icon-wrap">
          <!-- Danger: trash -->
          <svg v-if="opcoes.variante === 'danger'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          <!-- Warning: triangle -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h2 class="confirm-titulo">{{ opcoes.titulo }}</h2>

        <p class="confirm-mensagem">
          {{ opcoes.mensagem }}
          <strong v-if="opcoes.nome"> {{ opcoes.nome }}</strong>?
        </p>

        <p v-if="opcoes.aviso" class="confirm-aviso">{{ opcoes.aviso }}</p>

        <div class="confirm-acoes">
          <button class="confirm-btn-cancelar" @click="_recusar">Cancelar</button>
          <button
            class="confirm-btn-confirmar"
            :class="`confirm-btn-confirmar--${opcoes.variante}`"
            @click="_aceitar"
          >
            {{ opcoes.textoBotao }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirm } from '@/composables/useConfirm'
const { visivel, opcoes, _aceitar, _recusar } = useConfirm()
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 24px;
}

.confirm-box {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
  animation: confirm-aparecer 0.2s ease-out;
}

@keyframes confirm-aparecer {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

.confirm-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.confirm-icon-wrap svg { width: 28px; height: 28px; }

.confirm-box--danger  .confirm-icon-wrap { background: #fef2f2; color: #dc2626; }
.confirm-box--warning .confirm-icon-wrap { background: #fffbeb; color: #d97706; }

.confirm-titulo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.confirm-mensagem {
  font-size: 14.5px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}
.confirm-mensagem strong { color: #0f172a; }

.confirm-aviso {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
  padding: 8px 14px;
  background: #f8fafc;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.confirm-acoes {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.confirm-btn-cancelar,
.confirm-btn-confirmar {
  flex: 1;
  padding: 11px 16px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease;
}

.confirm-btn-cancelar {
  background: #f1f5f9;
  color: #475569;
}
.confirm-btn-cancelar:hover { background: #e2e8f0; }

.confirm-btn-confirmar--danger {
  background: #dc2626;
  color: #ffffff;
}
.confirm-btn-confirmar--danger:hover { background: #b91c1c; }

.confirm-btn-confirmar--warning {
  background: #d97706;
  color: #ffffff;
}
.confirm-btn-confirmar--warning:hover { background: #b45309; }

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active { transition: opacity 0.18s ease; }
.confirm-fade-enter-from,
.confirm-fade-leave-to { opacity: 0; }
</style>
