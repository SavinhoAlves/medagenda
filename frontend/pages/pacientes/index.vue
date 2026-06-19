<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { onMounted, ref, computed } from 'vue'
import api from '@/services/api'
import PacienteNovo from './novo.vue'

useHead({ title: 'Pacientes' })

const pacientes = ref([])
const carregando = ref(true)
const busca = ref('')

const { listarPacientes } = usePacientes()
const toast = useToast()

// --- Modal Novo Paciente ---
const exibirModalNovo = ref(false)
function abrirModalNovo() { exibirModalNovo.value = true }
function fecharModalNovo() { exibirModalNovo.value = false }
async function aoSalvarNovo() {
  fecharModalNovo()
  await carregar()
}

// --- Modal Excluir ---
const exibirModalExcluir = ref(false)
const excluindo = ref(false)
const pacienteParaExcluir = ref(null)

function abrirModalExcluir(paciente) {
  pacienteParaExcluir.value = paciente
  exibirModalExcluir.value = true
}
function fecharModalExcluir() { exibirModalExcluir.value = false }

async function confirmarExclusao() {
  try {
    excluindo.value = true
    await api.delete(`/pacientes/${pacienteParaExcluir.value.id}`)
    fecharModalExcluir()
    await carregar()
  } catch (error) {
    toast.erro('Erro ao excluir paciente.')
  } finally {
    excluindo.value = false
  }
}

async function carregar() {
  try {
    pacientes.value = await listarPacientes()
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error)
  } finally {
    carregando.value = false
  }
}

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

      <button @click="abrirModalNovo" class="new-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Paciente
      </button>
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
              <div class="acoes">
                <NuxtLink :to="`/pacientes/${paciente.id}`" class="btn-prontuario">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Prontuário
                </NuxtLink>
                <button class="btn-excluir" @click="abrirModalExcluir(paciente)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Novo Paciente -->
    <div v-if="exibirModalNovo" class="modal-overlay" @click.self="fecharModalNovo">
      <div class="modal-container modal-xl">
        <div class="modal-header">
          <h2>Cadastrar Novo Paciente</h2>
          <button class="btn-fechar-modal" @click="fecharModalNovo">&times;</button>
        </div>
        <div class="modal-body">
          <PacienteNovo @fechar="fecharModalNovo" @salvo="aoSalvarNovo" />
        </div>
      </div>
    </div>

    <!-- Modal: Confirmar Exclusão -->
    <div v-if="exibirModalExcluir" class="modal-overlay" @click.self="fecharModalExcluir">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Excluir Paciente</h2>
          <button class="btn-fechar-modal" @click="fecharModalExcluir">&times;</button>
        </div>
        <div class="modal-body">
          <div class="excluir-content">
            <div class="excluir-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="excluir-texto">
              Tem certeza que deseja excluir o paciente
              <strong>{{ pacienteParaExcluir?.nome }}</strong>?
            </p>
            <p class="excluir-aviso">Todos os dados e histórico serão removidos permanentemente.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" @click="fecharModalExcluir" :disabled="excluindo">Cancelar</button>
            <button class="btn-excluir-confirmar" @click="confirmarExclusao" :disabled="excluindo">
              {{ excluindo ? 'Excluindo...' : 'Sim, excluir' }}
            </button>
          </div>
        </div>
      </div>
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
  background: #059669;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
  cursor: pointer;
}

.new-button:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25);
}

.modal-container.modal-xl { max-width: 780px; max-height: 88vh; overflow-y: auto; }

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

.acoes { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }

.btn-prontuario { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; text-decoration: none; }
.btn-prontuario:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }

.btn-excluir { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-excluir:hover { background: #fef2f2; border-color: #f87171; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }

.excluir-content { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0 24px; gap: 12px; }
.excluir-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; }
.excluir-icon svg { width: 26px; height: 26px; }
.excluir-texto { font-size: 15px; color: #1e293b; line-height: 1.5; margin: 0; }
.excluir-aviso { font-size: 13px; color: #94a3b8; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-excluir-confirmar { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-excluir-confirmar:hover { background: #b91c1c; }
.btn-excluir-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

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