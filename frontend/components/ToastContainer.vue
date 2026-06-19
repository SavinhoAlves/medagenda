<script setup>
import { useToast } from '~/composables/useToast'

const { toasts, remover } = useToast()

const ICONS = {
  sucesso: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  erro:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  aviso:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.tipo}`]"
        >
          <span class="toast__icon" v-html="ICONS[toast.tipo]" />
          <span class="toast__msg">{{ toast.mensagem }}</span>
          <button class="toast__close" @click="remover(toast.id)" aria-label="Fechar">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 28px;
  right: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(15, 23, 42, 0.06);
  min-width: 280px;
  max-width: 420px;
  pointer-events: all;
  border-left: 4px solid transparent;
  font-family: 'Inter', sans-serif;
}

.toast--sucesso { border-left-color: #059669; }
.toast--erro    { border-left-color: #dc2626; }
.toast--aviso   { border-left-color: #d97706; }
.toast--info    { border-left-color: #3b82f6; }

.toast__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
}

.toast__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.toast--sucesso .toast__icon { color: #059669; }
.toast--erro    .toast__icon { color: #dc2626; }
.toast--aviso   .toast__icon { color: #d97706; }
.toast--info    .toast__icon { color: #3b82f6; }

.toast__msg {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.toast__close {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;
}

.toast__close:hover { color: #475569; }

/* Animação de entrada/saída */
.toast-enter-active { animation: toast-in 0.25s ease-out; }
.toast-leave-active { animation: toast-out 0.2s ease-in forwards; }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); max-height: 80px; margin-bottom: 0; }
  to   { opacity: 0; transform: translateX(24px); max-height: 0; margin-bottom: -10px; }
}
</style>
