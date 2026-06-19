<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import EspecialidadeNovo from './novo.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const especialidades = ref([])
const loading = ref(true)
const toast = useToast()

// --- Modal Novo ---
const exibirModalNovo = ref(false)
function abrirModalNovo() { exibirModalNovo.value = true }
function fecharModalNovo() { exibirModalNovo.value = false }
function aoSalvarNovo() { fecharModalNovo(); carregar() }

// --- Modal Editar ---
const exibirModalEditar = ref(false)
const enviandoEdicao = ref(false)
const formEditar = ref({ id: null, nome: '', descricao: '' })

function abrirModalEditar(esp) {
  formEditar.value = { id: esp.id, nome: esp.nome, descricao: esp.descricao || '' }
  exibirModalEditar.value = true
}
function fecharModalEditar() { exibirModalEditar.value = false }

async function salvarEdicao() {
  try {
    enviandoEdicao.value = true
    await api.put(`/especialidades/${formEditar.value.id}`, {
      nome: formEditar.value.nome,
      descricao: formEditar.value.descricao
    })
    fecharModalEditar()
    await carregar()
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao atualizar especialidade.')
  } finally {
    enviandoEdicao.value = false
  }
}

// --- Modal Excluir ---
const exibirModalExcluir = ref(false)
const excluindo = ref(false)
const especialidadeParaExcluir = ref(null)

function abrirModalExcluir(esp) {
  especialidadeParaExcluir.value = esp
  exibirModalExcluir.value = true
}
function fecharModalExcluir() { exibirModalExcluir.value = false }

async function confirmarExclusao() {
  try {
    excluindo.value = true
    await api.delete(`/especialidades/${especialidadeParaExcluir.value.id}`)
    fecharModalExcluir()
    await carregar()
  } catch (error) {
    toast.erro('Erro ao remover especialidade.')
  } finally {
    excluindo.value = false
  }
}

// --- Carregar ---
async function carregar() {
  loading.value = true
  try {
    const { data } = await api.get('/especialidades')
    especialidades.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(carregar)

useHead({ title: 'Especialidades' })
</script>

<template>
  <div class="page-wrapper">

    <div class="page-header">
      <div>
        <h1>Especialidades</h1>
        <p>Gerencie as especialidades médicas do sistema</p>
      </div>
      <button class="new-button" @click="abrirModalNovo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Especialidade
      </button>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Carregando especialidades...</p>
    </div>

    <div v-else-if="especialidades.length === 0" class="state-card">
      <p>Nenhuma especialidade cadastrada.</p>
    </div>

    <div v-else class="table-card">
      <table class="clinical-table">
        <thead>
          <tr>
            <th style="width:80px">ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="esp in especialidades" :key="esp.id">
            <td class="id-col">#{{ esp.id }}</td>
            <td>
              <div class="nome-cell">
                <div class="esp-avatar">{{ esp.nome.charAt(0) }}</div>
                <span class="nome-texto">{{ esp.nome }}</span>
              </div>
            </td>
            <td class="text-muted">{{ esp.descricao || '—' }}</td>
            <td class="text-right">
              <div class="acoes">
                <button class="btn-editar" @click="abrirModalEditar(esp)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button class="btn-excluir" @click="abrirModalExcluir(esp)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Nova Especialidade -->
    <div v-if="exibirModalNovo" class="modal-overlay" @click.self="fecharModalNovo">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Nova Especialidade</h2>
          <button class="btn-fechar-modal" @click="fecharModalNovo">&times;</button>
        </div>
        <div class="modal-body">
          <EspecialidadeNovo @salvo="aoSalvarNovo" @fechar="fecharModalNovo" />
        </div>
      </div>
    </div>

    <!-- Modal: Editar Especialidade -->
    <div v-if="exibirModalEditar" class="modal-overlay" @click.self="fecharModalEditar">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Editar Especialidade</h2>
          <button class="btn-fechar-modal" @click="fecharModalEditar">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEdicao">
            <div class="form-grid">
              <div class="field-group span-2">
                <label>Nome da especialidade <span class="obrigatorio">*</span></label>
                <input v-model="formEditar.nome" type="text" placeholder="Ex: Cardiologia, Pediatria..." required :disabled="enviandoEdicao" />
              </div>
              <div class="field-group span-2">
                <label>Descrição</label>
                <input v-model="formEditar.descricao" type="text" placeholder="Breve descrição da especialidade" :disabled="enviandoEdicao" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancelar" @click="fecharModalEditar" :disabled="enviandoEdicao">Cancelar</button>
              <button type="submit" class="btn-salvar" :disabled="enviandoEdicao">
                {{ enviandoEdicao ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Confirmar Exclusão -->
    <div v-if="exibirModalExcluir" class="modal-overlay" @click.self="fecharModalExcluir">
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2>Excluir Especialidade</h2>
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
              Tem certeza que deseja excluir a especialidade
              <strong>{{ especialidadeParaExcluir?.nome }}</strong>?
            </p>
            <p class="excluir-aviso">Esta ação não pode ser desfeita.</p>
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

.page-wrapper { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; box-sizing: border-box; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 28px; color: #0f172a; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-header p { color: #64748b; margin: 0; font-size: 14px; }

.new-button { background: #059669; color: #fff; border: none; padding: 12px 20px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,.15); transition: all 0.2s ease; }
.new-button:hover { background: #047857; transform: translateY(-1px); }

.table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,.02); }
.clinical-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
.clinical-table th { background: #f8fafc; padding: 14px 24px; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0; }
.clinical-table td { padding: 14px 24px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
.clinical-table tr:last-child td { border-bottom: none; }
.clinical-table tr:hover td { background: #fdfdfd; }

.id-col { color: #94a3b8; font-family: monospace; font-size: 13px; }
.nome-cell { display: flex; align-items: center; gap: 12px; }
.esp-avatar { width: 34px; height: 34px; border-radius: 8px; background: rgba(5,150,105,.08); color: #059669; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; text-transform: uppercase; flex-shrink: 0; }
.nome-texto { font-weight: 600; color: #0f172a; }
.text-muted { color: #64748b; }
.text-right { text-align: right; }

.acoes { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }

.btn-editar { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-editar:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }

.btn-excluir { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-excluir:hover { background: #fef2f2; border-color: #f87171; }

.state-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.spinner { width: 26px; height: 26px; border: 3px solid rgba(5,150,105,.1); border-radius: 50%; border-top-color: #059669; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Modais ── */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-container.modal-sm { max-width: 420px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }

/* ── Form editar ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group.span-2 { grid-column: span 2; }
.field-group label { font-size: 13px; font-weight: 600; color: #475569; }
.obrigatorio { color: #ef4444; }
.field-group input { height: 42px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: 'Inter', sans-serif; color: #334155; background: #f8fafc; outline: none; transition: all 0.2s ease; box-sizing: border-box; width: 100%; }
.field-group input:focus { border-color: #059669; background: #ffffff; box-shadow: 0 0 0 3px rgba(5,150,105,.08); }
.field-group input::placeholder { color: #94a3b8; }
.field-group input:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-salvar { background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(5,150,105,.15); transition: all 0.2s; }
.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Modal excluir ── */
.excluir-content { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0 24px; gap: 12px; }
.excluir-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; }
.excluir-icon svg { width: 26px; height: 26px; }
.excluir-texto { font-size: 15px; color: #1e293b; line-height: 1.5; margin: 0; }
.excluir-aviso { font-size: 13px; color: #94a3b8; margin: 0; }
.btn-excluir-confirmar { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-excluir-confirmar:hover { background: #b91c1c; }
.btn-excluir-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
