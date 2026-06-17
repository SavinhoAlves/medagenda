<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const profissional = ref(null)
const abaAtiva = ref('pessoais')

async function carregar() {
  try {
    const response = await api.get(`/profissionais/${route.params.id}`)
    profissional.value = response.data
  } catch (error) {
    console.error('Erro ao carregar os detalhes do profissional:', error)
  }
}

onMounted(carregar)
</script>

<template>
  <div v-if="profissional" class="page-wrapper">
    
    <div class="header-actions">
      <div class="title-container">
        <NuxtLink to="/profissionais" class="back-arrow-btn">
          <span class="arrow">←</span>
        </NuxtLink>
        <h1 class="page-main-title">{{ profissional.nome }}</h1>
      </div>
      
      <div class="actions-buttons">
        <button class="btn-secondary">Editar dados</button>
      </div>
    </div>

    <div class="profile-container">
      
      <aside class="profile-sidebar">
        <button 
          :class="['sidebar-tab', { active: abaAtiva === 'pessoais' }]"
          @click="abaAtiva = 'pessoais'"
        >
          Dados profissionais
        </button>
        <button 
          :class="['sidebar-tab', { active: abaAtiva === 'contato' }]"
          @click="abaAtiva = 'contato'"
        >
          Informações de contato
        </button>
      </aside>

      <main class="profile-content">
        
        <div v-if="abaAtiva === 'pessoais'" class="section-block">
          <div class="section-header-box">
            <h2 class="section-title">Geral</h2>
            <div class="avatar-display">
              <div class="avatar-box">
                {{ profissional.nome.charAt(0).toUpperCase() }}
              </div>
              <span class="avatar-label">Perfil Ativo</span>
            </div>
          </div>

          <div class="data-form-grid">
            <div class="form-field">
              <label>Nome Completo</label>
              <div class="field-value">{{ profissional.nome }}</div>
            </div>

            <div class="form-field">
              <label>CPF</label>
              <div class="field-value">{{ profissional.cpf || '-' }}</div>
            </div>

            <div class="form-field">
              <label>Especialidade Clínica</label>
              <div class="field-value highlight">{{ profissional.especialidade?.nome || 'Não informada' }}</div>
            </div>

            <div class="form-field">
              <label>Registro de Conselho (CRM/CRO/...)</label>
              <div class="field-value">{{ profissional.registroConselho || '-' }}</div>
            </div>
          </div>
        </div>

        <div v-if="abaAtiva === 'contato'" class="section-block">
          <h2 class="section-title">Canais de Comunicação</h2>
          
          <div class="data-form-grid">
            <div class="form-field">
              <label>Telefone / WhatsApp</label>
              <div class="field-value">{{ profissional.telefone || '-' }}</div>
            </div>

            <div class="form-field">
              <label>E-mail Corporativo</label>
              <div class="field-value">{{ profissional.email || 'Não informado' }}</div>
            </div>
          </div>
        </div>

      </main>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper {
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* --- BARRA SUPERIOR E COMPONENTE DA SETA --- */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 36px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-arrow-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #059669;
}

.back-arrow-btn .arrow {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.page-main-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0;
}

.btn-secondary {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

/* --- LAYOUT CONTAINER --- */
.profile-container {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: start;
}

/* --- MENU LATERAL INTERNO --- */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
}

.sidebar-tab {
  background: none;
  border: none;
  text-align: left;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-tab:hover {
  background: #f8fafc;
  color: #0f172a;
}

.sidebar-tab.active {
  background-color: rgba(5, 150, 105, 0.06);
  color: #059669;
  font-weight: 600;
}

/* --- PAINEL PRINCIPAL DE CONTEÚDO --- */
.profile-content {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.section-header-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

/* --- AVATAR DO PROFISSIONAL À DIREITA --- */
.avatar-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-box {
  width: 68px;
  height: 68px;
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.avatar-label {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
  padding: 2px 8px;
  border-radius: 20px;
}

/* --- GRID DE CAMPOS FORMULÁRIO DE LEITURA --- */
.data-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-value {
  height: 48px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: #1e293b;
  font-size: 15px;
  font-weight: 500;
}

.field-value.highlight {
  color: #059669;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  .data-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>