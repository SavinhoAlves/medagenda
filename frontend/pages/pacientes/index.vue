<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { onMounted, ref, computed } from 'vue'

const pacientes = ref([])
const carregando = ref(true)
const busca = ref('') // ✨ Adicionado: Reatividade para a barra de pesquisa

const { listarPacientes } = usePacientes()

async function carregar() {
  try {
    pacientes.value = await listarPacientes()
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error)
  } finally {
    carregando.value = false
  }
}

// ✨ BÔNUS: Filtro dinâmico baseado na barra de pesquisa (Nome, CPF ou Telefone)
const pacientesFiltrados = computed(() => {
  if (!busca.value) return pacientes.value
  
  const termo = busca.value.toLowerCase().trim()
  return pacientes.value.filter(paciente => {
    return (
      paciente.nome?.toLowerCase().includes(termo) ||
      paciente.cpf?.includes(termo) ||
      paciente.telefone?.includes(termo)
    )
  })
})

onMounted(carregar)
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Pacientes</h1>
        <p>Gerencie os pacientes cadastrados na plataforma</p>
      </div>

      <NuxtLink to="/pacientes/novo" class="new-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Paciente
      </NuxtLink>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM15 15l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="carregando" class="state-card">
      <div class="spinner"></div>
      <p>Carregando prontuários...</p>
    </div>

    <div v-else-if="pacientesFiltrados.length === 0" class="state-card empty">
      <p>Nenhum paciente encontrado.</p>
    </div>

    <div v-else class="table-card">
      <table class="clinical-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>CPF</th>
            <th>E-mail</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <td>
              <div class="patient-profile">
                <div class="patient-avatar">
                  {{ paciente.nome ? paciente.nome.charAt(0).toUpperCase() : 'P' }}
                </div>
                <span class="patient-name">{{ paciente.nome }}</span>
              </div>
            </td>
            <td class="text-muted">{{ paciente.telefone }}</td>
            <td class="text-muted">{{ paciente.cpf }}</td>
            <td class="text-muted">{{ paciente.email || '-' }}</td>
            <td class="text-right">
              <NuxtLink :to="`/pacientes/${paciente.id}`" class="action-link">
                Abrir Prontuário
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

/* ─── Layout Container ────────────────────────── */
.page-wrapper {
  padding: 40px;
  background-color: #f8fafc; /* Fundo Slate 50 idêntico ao login */
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* ─── Cabeçalho ────────────────────────────── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #0f172a; /* Slate 900 */
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-header p {
  color: #64748b; /* Slate 500 */
  margin: 0;
  font-size: 14.5px;
}

/* ─── Botão Novo Registro ────────────────────── */
.new-button {
  background: #059669; /* Verde Esmeralda */
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
}

.new-button:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25);
}

/* ─── Barra de Ferramentas / Input de Busca ──── */
.toolbar {
  margin-bottom: 24px;
}

.search-wrap {
  display: flex;
  align-items: center;
  position: relative;
  max-width: 480px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  border: none;
  background: transparent;
  color: #0f172a;
  padding: 13px 14px 13px 44px;
  font-size: 14px;
  outline: none;
  font-family: 'Inter', sans-serif;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-wrap:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.08);
}

/* ─── Cartão da Tabela ───────────────────────── */
.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02), 0 2px 4px -1px rgba(15, 23, 42, 0.01);
  overflow: hidden;
}

.clinical-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14.5px;
}

.clinical-table th {
  background-color: #f8fafc;
  padding: 16px 24px;
  font-weight: 600;
  color: #475569; /* Slate 600 */
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clinical-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.clinical-table tr:last-child td {
  border-bottom: none;
}

.clinical-table tr:hover td {
  background-color: #fdfdfd;
}

/* Profile Row Element */
.patient-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.patient-name {
  font-weight: 600;
  color: #0f172a;
}

.text-muted {
  color: #64748b;
}

.text-right {
  text-align: right;
}

/* Links de Ação (Acessar Prontuário) */
.action-link {
  color: #059669;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-link:hover {
  background-color: rgba(5, 150, 105, 0.06);
  color: #047857;
}

/* ─── Estados Clínicos (Carregando / Vazio) ─── */
.state-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(5, 150, 105, 0.1);
  border-radius: 50%;
  border-top-color: #059669;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>