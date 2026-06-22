<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()

const email    = ref('')
const senha    = ref('')
const loading  = ref(false)
const erro     = ref('')
const verSenha = ref(false)

const entrar = async () => {
  if (!email.value || !senha.value) {
    erro.value = 'Por favor, preencha todos os campos.'
    return
  }
  loading.value = true
  erro.value = ''
  try {
    const sucesso = await authStore.login(email.value, senha.value)
    if (sucesso) {
      const cargo = authStore.usuario?.cargo
      await navigateTo(cargo === 'operador' ? '/agenda' : '/dashboard')
    }
  } catch (error) {
    if (error.response) {
      erro.value = error.response.data?.error || 'E-mail ou senha inválidos.'
    } else if (error.request) {
      erro.value = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    } else {
      erro.value = 'Ocorreu um erro inesperado.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="lp-root">

    <!-- ── Painel de marca (esquerda) ──────────────────── -->
    <div class="lp-brand">
      <div class="lp-deco lp-deco-1" />
      <div class="lp-deco lp-deco-2" />
      <div class="lp-deco lp-deco-3" />

      <div class="lp-watermark">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="40" y="8"  width="20" height="84" rx="10" fill="currentColor"/>
          <rect x="8"  y="40" width="84" height="20" rx="10" fill="currentColor"/>
        </svg>
      </div>

      <div class="lp-brand-body">
        <div class="lp-brand-logo">
          <div class="lp-brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="13" y="4"  width="6" height="24" rx="3" fill="white"/>
              <rect x="4"  y="13" width="24" height="6"  rx="3" fill="white"/>
            </svg>
          </div>
          <span class="lp-brand-name">MedAgenda</span>
        </div>

        <div class="lp-tagline">
          <h1>Gestão inteligente<br>do seu consultório</h1>
          <p>Agendamentos, prontuários e equipe<br>em um único painel.</p>
        </div>

        <ul class="lp-feats">
          <li>
            <span class="lp-check">✓</span>
            Agenda online em tempo real
          </li>
          <li>
            <span class="lp-check">✓</span>
            Gestão completa de pacientes
          </li>
          <li>
            <span class="lp-check">✓</span>
            Histórico e relatórios de consultas
          </li>
          <li>
            <span class="lp-check">✓</span>
            Multi-perfil: Admin, Médico e Operador
          </li>
        </ul>

        <div class="lp-stat-row">
          <div class="lp-stat">
            <strong>100%</strong>
            <span>Online</span>
          </div>
          <div class="lp-stat-div" />
          <div class="lp-stat">
            <strong>TLS</strong>
            <span>Criptografado</span>
          </div>
          <div class="lp-stat-div" />
          <div class="lp-stat">
            <strong>24/7</strong>
            <span>Disponível</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Painel do formulário (direita) ─────────────── -->
    <div class="lp-form-panel">
      <div class="lp-form-wrap">

        <!-- Logo visível só em mobile -->
        <div class="lp-mobile-logo">
          <div class="lp-mobile-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="13" y="4"  width="6" height="24" rx="3" fill="currentColor"/>
              <rect x="4"  y="13" width="24" height="6"  rx="3" fill="currentColor"/>
            </svg>
          </div>
          <span class="lp-mobile-name">MedAgenda</span>
        </div>

        <div class="lp-form-head">
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta profissional para continuar</p>
        </div>

        <transition name="lp-err">
          <div v-if="erro" class="lp-error">
            <svg class="lp-err-ico" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            {{ erro }}
          </div>
        </transition>

        <form class="lp-form" @submit.prevent="entrar">

          <div class="lp-field">
            <label for="email">E-mail profissional</label>
            <div class="lp-inp-wrap">
              <svg class="lp-inp-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" stroke="currentColor" stroke-width="1.4"/>
                <path d="M2.5 6l7.12 4.746a.75.75 0 00.76 0L17.5 6" stroke="currentColor" stroke-width="1.4"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="username"
              >
            </div>
          </div>

          <div class="lp-field">
            <label for="senha">Senha</label>
            <div class="lp-inp-wrap">
              <svg class="lp-inp-icon" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <input
                id="senha"
                v-model="senha"
                :type="verSenha ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
              >
              <button type="button" class="lp-eye" :title="verSenha ? 'Ocultar senha' : 'Mostrar senha'" @click="verSenha = !verSenha">
                <svg v-if="!verSenha" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="10" rx="8.5" ry="5.5" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.4"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  <path d="M10 4C5.5 4 2 7 1.5 10c.25 1.05.8 2 1.5 2.8M7.5 7.5A2.5 2.5 0 0112.5 12.5M10 16c4.5 0 8-3 8.5-6-.25-1.05-.8-2-1.5-2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="lp-btn" :class="{ 'lp-btn--loading': loading }" :disabled="loading">
            <template v-if="!loading">
              <span>Entrar na plataforma</span>
              <svg class="lp-btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
              </svg>
            </template>
            <span v-else class="lp-loader" />
          </button>

        </form>

        <p class="lp-footer">
          <svg viewBox="0 0 16 16" fill="currentColor" class="lp-lock">
            <path fill-rule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 003 8.5v5A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zm2 6V4.5a2 2 0 10-4 0V7h4z" clip-rule="evenodd"/>
          </svg>
          Plataforma segura · Dados protegidos com TLS
        </p>
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

/* ══ Root ════════════════════════════════════════════════════ */
.lp-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  background: #f8fafc;
}

/* ══ Brand Panel (esquerda) ══════════════════════════════════ */
.lp-brand {
  flex: 0 0 44%;
  position: relative;
  background: linear-gradient(150deg, #064e3b 0%, #065f46 45%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 52px;
  overflow: hidden;
}

.lp-deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.lp-deco-1 {
  width: 500px; height: 500px;
  background: rgba(255,255,255,0.055);
  top: -140px; left: -140px;
}
.lp-deco-2 {
  width: 340px; height: 340px;
  background: rgba(255,255,255,0.045);
  bottom: -90px; right: -90px;
}
.lp-deco-3 {
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.035);
  top: 55%; left: 62%;
  transform: translate(-50%, -50%);
}

.lp-watermark {
  position: absolute;
  width: 380px; height: 380px;
  bottom: -50px; right: -70px;
  opacity: 0.055;
  color: white;
  pointer-events: none;
}
.lp-watermark svg { width: 100%; height: 100%; }

.lp-brand-body {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 360px;
}

.lp-brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 52px;
}
.lp-brand-icon {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.14);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.22);
}
.lp-brand-icon svg { width: 24px; height: 24px; }
.lp-brand-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: white;
  letter-spacing: -0.3px;
}

.lp-tagline { margin-bottom: 40px; }
.lp-tagline h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 31px;
  color: white;
  line-height: 1.25;
  letter-spacing: -0.8px;
  margin: 0 0 14px;
}
.lp-tagline p {
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  line-height: 1.65;
  margin: 0;
}

.lp-feats {
  list-style: none;
  padding: 0; margin: 0 0 44px;
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.lp-feats li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255,255,255,0.82);
  font-weight: 500;
}
.lp-check {
  width: 22px; height: 22px;
  background: rgba(255,255,255,0.14);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.22);
}

.lp-stat-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.14);
}
.lp-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lp-stat strong {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: white;
}
.lp-stat span {
  font-size: 11px;
  color: rgba(255,255,255,0.58);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.lp-stat-div {
  width: 1px; height: 32px;
  background: rgba(255,255,255,0.18);
}

/* ══ Form Panel (direita) ════════════════════════════════════ */
.lp-form-panel {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  overflow-y: auto;
}
.lp-form-wrap {
  width: 100%;
  max-width: 420px;
}

.lp-mobile-logo {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.lp-mobile-icon {
  width: 32px; height: 32px;
  color: #059669;
}
.lp-mobile-icon svg { width: 100%; height: 100%; }
.lp-mobile-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.lp-form-head { margin-bottom: 32px; }
.lp-form-head h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0 0 8px;
}
.lp-form-head p {
  color: #64748b;
  font-size: 14.5px;
  margin: 0;
}

/* Error banner */
.lp-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 24px;
}
.lp-err-ico { width: 18px; height: 18px; flex-shrink: 0; }

.lp-err-enter-active { transition: all 0.25s ease; }
.lp-err-leave-active { transition: all 0.18s ease; }
.lp-err-enter-from,
.lp-err-leave-to    { opacity: 0; transform: translateY(-6px); }

/* Form */
.lp-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lp-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.lp-field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.lp-inp-wrap {
  display: flex;
  align-items: center;
  position: relative;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 2px rgba(15,23,42,0.04);
}
.lp-inp-wrap:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5,150,105,0.08), 0 1px 2px rgba(15,23,42,0.04);
}
.lp-inp-icon {
  position: absolute;
  left: 14px;
  width: 18px; height: 18px;
  color: #94a3b8;
  pointer-events: none;
  transition: color 0.2s;
}
.lp-inp-wrap:focus-within .lp-inp-icon { color: #059669; }
.lp-inp-wrap input {
  width: 100%;
  border: none;
  background: transparent;
  color: #0f172a;
  padding: 14px 44px 14px 44px;
  font-family: 'Inter', sans-serif;
  font-size: 14.5px;
  outline: none;
  box-sizing: border-box;
  border-radius: 10px;
}
.lp-inp-wrap input::placeholder { color: #94a3b8; }

.lp-eye {
  position: absolute;
  right: 10px;
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 7px;
  transition: color 0.15s, background 0.15s;
  padding: 0;
}
.lp-eye:hover { color: #475569; background: #f1f5f9; }
.lp-eye svg  { width: 18px; height: 18px; }

/* CTA Button */
.lp-btn {
  width: 100%;
  height: 50px;
  margin-top: 4px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  box-shadow: 0 4px 16px rgba(5,150,105,0.28), 0 1px 3px rgba(5,150,105,0.12);
  transition: transform 0.15s, box-shadow 0.15s;
}
.lp-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(5,150,105,0.38), 0 2px 6px rgba(5,150,105,0.18);
}
.lp-btn:active:not(:disabled)  { transform: translateY(0); }
.lp-btn:disabled                { opacity: 0.65; cursor: not-allowed; }
.lp-btn--loading                { pointer-events: none; }

.lp-btn-arrow {
  width: 18px; height: 18px;
  transition: transform 0.15s;
  flex-shrink: 0;
}
.lp-btn:hover:not(:disabled) .lp-btn-arrow { transform: translateX(3px); }

.lp-loader {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: lp-spin 0.75s linear infinite;
}
@keyframes lp-spin { to { transform: rotate(360deg); } }

.lp-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 28px;
  letter-spacing: 0.1px;
}
.lp-lock { width: 13px; height: 13px; flex-shrink: 0; }

/* ══ Responsive ══════════════════════════════════════════════ */
@media (max-width: 860px) {
  .lp-brand       { display: none; }
  .lp-form-panel  { background: #ffffff; padding: 40px 28px; }
  .lp-mobile-logo { display: flex; }
}
@media (max-width: 400px) {
  .lp-form-panel { padding: 32px 20px; }
}

/* ══ Dark Mode ═══════════════════════════════════════════════ */
html.dark .lp-form-panel              { background: #0f172a; }
html.dark .lp-form-head h2            { color: #f1f5f9; }
html.dark .lp-form-head p             { color: #64748b; }
html.dark .lp-field label             { color: #94a3b8; }
html.dark .lp-inp-wrap                { background: #1e293b; border-color: #334155; box-shadow: none; }
html.dark .lp-inp-wrap:focus-within   { border-color: #059669; box-shadow: 0 0 0 4px rgba(5,150,105,0.12); }
html.dark .lp-inp-wrap input          { color: #f1f5f9; }
html.dark .lp-inp-wrap input::placeholder { color: #475569; }
html.dark .lp-eye:hover               { background: #334155; color: #94a3b8; }
html.dark .lp-footer                  { color: #475569; }
html.dark .lp-mobile-name             { color: #f1f5f9; }
html.dark .lp-error                   { background: rgba(127,29,29,0.2); border-color: rgba(239,68,68,0.3); color: #fca5a5; }
</style>
