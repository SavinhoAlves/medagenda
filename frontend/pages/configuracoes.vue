<script setup>

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Configurações' })

const usuario = ref({
  nome: 'Administrador',
  email: 'admin@medagenda.com',
  cargo: 'Administrador'
})

const sistema = ref({
  nomeClinica: 'MedAgenda',
  telefone: '(22) 99999-9999',
  email: 'contato@medagenda.com',
  endereco: 'Rua Principal, 100',
  intervaloConsulta: 30
})

const notificacoes = ref({
  email: true,
  whatsapp: false,
  lembreteConsulta: true
})

const toast = useToast()

function salvarConfiguracoes() {
  toast.sucesso('Configurações salvas com sucesso!')
}

</script>

<template>

  <div class="config-root">

    <!-- HEADER -->
    <div class="page-header">

      <div>

        <h1 class="page-title">
          Configurações
        </h1>

        <p class="page-subtitle">
          Gerencie as preferências do sistema
        </p>

      </div>

    </div>

    <!-- PERFIL -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon green">

          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="8"
              r="3.5"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>

        </div>

        <div>

          <h2>
            Perfil do usuário
          </h2>

          <p>
            Informações do usuário logado
          </p>

        </div>

      </div>

      <div class="form-grid">

        <div class="field">

          <label>
            Nome
          </label>

          <input
            v-model="usuario.nome"
            type="text"
          />

        </div>

        <div class="field">

          <label>
            E-mail
          </label>

          <input
            v-model="usuario.email"
            type="email"
          />

        </div>

        <div class="field">

          <label>
            Cargo
          </label>

          <input
            v-model="usuario.cargo"
            type="text"
            disabled
          />

        </div>

      </div>

    </div>

    <!-- SISTEMA -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon blue">

          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2.5"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M8 3v4M16 3v4M3 10h18"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>

        </div>

        <div>

          <h2>
            Dados da clínica
          </h2>

          <p>
            Configurações gerais do sistema
          </p>

        </div>

      </div>

      <div class="form-grid">

        <div class="field">

          <label>
            Nome da clínica
          </label>

          <input
            v-model="sistema.nomeClinica"
            type="text"
          />

        </div>

        <div class="field">

          <label>
            Telefone
          </label>

          <input
            v-model="sistema.telefone"
            type="text"
          />

        </div>

        <div class="field">

          <label>
            E-mail
          </label>

          <input
            v-model="sistema.email"
            type="email"
          />

        </div>

        <div class="field">

          <label>
            Intervalo padrão (min)
          </label>

          <input
            v-model="sistema.intervaloConsulta"
            type="number"
          />

        </div>

        <div class="field full">

          <label>
            Endereço
          </label>

          <input
            v-model="sistema.endereco"
            type="text"
          />

        </div>

      </div>

    </div>

    <!-- NOTIFICAÇÕES -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon purple">

          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 8a6 6 0 1112 0v4l1.5 2.5H4.5L6 12V8z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path
              d="M10 19a2 2 0 004 0"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>

        </div>

        <div>

          <h2>
            Notificações
          </h2>

          <p>
            Preferências de avisos e lembretes
          </p>

        </div>

      </div>

      <div class="switch-list">

        <div class="switch-item">

          <div>

            <strong>
              Notificações por e-mail
            </strong>

            <span>
              Receber atualizações por e-mail
            </span>

          </div>

          <input
            v-model="notificacoes.email"
            type="checkbox"
          />

        </div>

        <div class="switch-item">

          <div>

            <strong>
              Notificações WhatsApp
            </strong>

            <span>
              Receber mensagens automáticas
            </span>

          </div>

          <input
            v-model="notificacoes.whatsapp"
            type="checkbox"
          />

        </div>

        <div class="switch-item">

          <div>

            <strong>
              Lembrete de consultas
            </strong>

            <span>
              Enviar lembrete automático
            </span>

          </div>

          <input
            v-model="notificacoes.lembreteConsulta"
            type="checkbox"
          />

        </div>

      </div>

    </div>

    <!-- ACTIONS -->
    <div class="actions">

      <button
        class="btn-save"
        @click="salvarConfiguracoes"
      >
        Salvar Configurações
      </button>

    </div>

  </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.config-root {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 32px 64px;
  font-family: 'Inter', sans-serif;
}

/* ─── Header ───────────────────────────────── */
.page-header { margin-bottom: 32px; }

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

/* ─── Cards ────────────────────────────────── */
.config-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

/* ─── Card Header com ícone ─────────────────── */
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg { width: 20px; height: 20px; }
.card-icon.green { background: rgba(5,150,105,.1); color: #059669; }
.card-icon.blue  { background: rgba(59,130,246,.1); color: #3b82f6; }
.card-icon.purple{ background: rgba(139,92,246,.1); color: #7c3aed; }

.card-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.card-header p  { font-size: 13px; color: #64748b; margin: 0; }

/* ─── Grid e campos ─────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full { grid-column: span 2; }

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: all 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

.field input:disabled { opacity: 0.6; cursor: not-allowed; }

/* ─── Lista de Switches ─────────────────────── */
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  gap: 16px;
}

.switch-item > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.switch-item strong { font-size: 14px; font-weight: 600; color: #1e293b; }
.switch-item span   { font-size: 13px; color: #64748b; }

.switch-item input[type="checkbox"] {
  width: 42px;
  height: 24px;
  appearance: none;
  -webkit-appearance: none;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.switch-item input[type="checkbox"]::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}

.switch-item input[type="checkbox"]:checked { background: #059669; }
.switch-item input[type="checkbox"]:checked::after { transform: translateX(18px); }

/* ─── Botão Salvar ──────────────────────────── */
.actions { display: flex; justify-content: flex-end; margin-top: 8px; }

.btn-save {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5,150,105,.15);
  transition: all 0.2s ease;
}

.btn-save:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,.25); }
</style>