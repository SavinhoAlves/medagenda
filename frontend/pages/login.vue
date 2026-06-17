<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const email = ref('')
const senha = ref('')
const loading = ref(false)
const errorMessage = ref('') // Estado para exibir erros dinamicamente na tela

const entrar = async () => {
  if (!email.value || !senha.value) {
    errorMessage.value = 'Por favor, preencha todos os campos.'
    return
  }

  loading.value = true
  errorMessage.value = '' // Limpa erros de tentativas anteriores

  // 📝 LOG 1: Dados coletados pelo formulário antes do envio
  // console.log('🚀 [Frontend] Iniciando tentativa de login...')
  // console.log('📧 E-mail digitado:', email.value)
  // console.log('🔑 Senha digitada (texto limpo):', senha.value)

  try {
    const sucesso = await authStore.login(email.value, senha.value)
    
    // 📝 LOG 2: Retorno da store se não disparar nenhuma exceção catch
    // console.log('✅ [Frontend] Resposta recebida da AuthStore. Status de sucesso:', sucesso)

    if (sucesso) {
      //console.log('🔀 [Frontend] Redirecionando usuário para /dashboard...')
      await navigateTo('/dashboard')
    }
  } catch (error) {
    // 📝 LOG 3: Captura detalhada do erro caso a requisição falhe (Ex: 400, 401, 500)
    // console.error('❌ [Frontend] Erro capturado na execução do login:', error)
    
    if (error.response) {
      // O servidor respondeu com um status fora do escopo 2xx
      // console.log('📊 Status do Erro HTTP:', error.response.status)
      // console.log('📦 Dados do Erro retornados pelo Backend:', error.response.data)
      
      // Atualiza o banner com a mensagem real do backend (ex: "Senha inválida")
      errorMessage.value = error.response.data?.error || 'E-mail ou senha inválidos.'
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida (ex: Backend desligado)
      // console.error('🌐 Nenhuma resposta foi recebida do servidor. Verifique se o backend está rodando na porta correta.')
      errorMessage.value = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    } else {
      // Algo aconteceu na configuração da requisição que disparou um erro genericamente
      // console.error('⚙️ Erro na configuração da requisição:', error.message)
      errorMessage.value = 'Ocorreu um erro inesperado ao processar a requisição.'
    }
  } finally {
    loading.value = false
    // console.log('🏁 [Frontend] Finalizado o fluxo da função entrar(). Loading desativado.')
  }
}
</script>

<template>
  <div class="login-root">
    <div class="login-card">
      
      <div class="logo-wrap">
        <div class="logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="13" y="4" width="6" height="24" rx="3" fill="currentColor"/>
            <rect x="4" y="13" width="24" height="6" rx="3" fill="currentColor"/>
          </svg>
        </div>
        <span class="logo-text">MedAgenda</span>
      </div>

      <p class="login-subtitle">Acesse sua conta profissional</p>

      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label class="field-label" for="email">E-mail</label>
        <div class="input-wrap">
          <svg class="input-icon" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2.5 6l7.12 4.746a.75.75 0 00.76 0L17.5 6" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            class="field-input"
            autocomplete="username"
          >
        </div>
      </div>

      <div class="form-group">
        <label class="field-label" for="senha">Senha</label>
        <div class="input-wrap">
          <svg class="input-icon" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <input
            id="senha"
            v-model="senha"
            type="password"
            placeholder="••••••••"
            class="field-input"
            @keyup.enter="entrar"
          >
        </div>
      </div>

      <button @click="entrar" :class="['btn-enter', { loading }]" :disabled="loading">
        <span v-if="!loading">Entrar</span>
        <span v-else class="loader" />
      </button>

      <p class="login-footer">
        Plataforma segura · Dados criptografados
      </p>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

/* ─── Banner de Erro Ajustado ───────────────── */
.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
  padding: 12px;
  border-radius: 12px;
  font-size: 13.5px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 500;
}

/* ─── Root Container ────────────────────────── */
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 24px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.04), 0 10px 10px -5px rgba(15, 23, 42, 0.02);
  box-sizing: border-box;
}
.logo-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }
.logo-icon { color: #059669; width: 34px; height: 34px; display: flex; align-items: center; }
.logo-text { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 24px; color: #0f172a; letter-spacing: -0.5px; }
.login-subtitle { text-align: center; color: #64748b; font-size: 14.5px; margin: 0 0 36px; font-weight: 400; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.field-label { font-size: 13px; font-weight: 600; color: #475569; }
.input-wrap { display: flex; align-items: center; position: relative; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; transition: all 0.2s ease; }
.input-icon { position: absolute; left: 14px; width: 18px; height: 18px; color: #94a3b8; pointer-events: none; transition: color 0.2s ease; }
.field-input { width: 100%; border: none; background: transparent; color: #0f172a; padding: 14px 14px 14px 42px; font-family: 'Inter', sans-serif; font-size: 14.5px; outline: none; box-sizing: border-box; }
.field-input::placeholder { color: #94a3b8; }
.input-wrap:focus-within { border-color: #059669; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.08); }
.input-wrap:focus-within .input-icon { color: #059669; }
.btn-enter { width: 100%; height: 48px; margin-top: 12px; background: #059669; color: #ffffff; border: none; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15); transition: all 0.2s ease; }
.btn-enter:hover:not(:disabled) { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25); }
.btn-enter:disabled { opacity: 0.7; cursor: not-allowed; }
.loader { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #ffffff; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.login-footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; margin-bottom: 0; letter-spacing: 0.1px; }
</style>