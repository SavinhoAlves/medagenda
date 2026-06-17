<script setup>

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

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

function salvarConfiguracoes() {

  alert('Configurações salvas com sucesso!')

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
.config-root {
  max-width: 800px;
  margin: 0 auto;
  padding: 110px 32px 64px;
  font-family: 'Inter', sans-serif;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
  font-size: 14px;
}

.config-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.card-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
}

.field input,
.field select,
.field textarea {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  transition: all 0.2s;
}

.field input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  outline: none;
}

.switch-item {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.switch-item strong {
  color: #1e293b;
}

.switch-item span {
  color: #64748b;
}
</style>