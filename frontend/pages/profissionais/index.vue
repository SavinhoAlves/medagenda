<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import ProfissionalNovo from './novo.vue'
import { useMascaras } from '~/composables/useMascaras'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Profissionais' })

const { mascaraCpf, mascaraTelefone, mascaraConselho } = useMascaras()
const profissionais = ref([])
const especialidades = ref([])
const carregando = ref(true)
const busca = ref('')

const { listarProfissionais } = useProfissionais()
const toast = useToast()

// --- Modal Novo ---
const exibirModalNovo = ref(false)
function abrirModalNovo() { exibirModalNovo.value = true }
function fecharModalNovo() { exibirModalNovo.value = false }
function aoSalvarNovo() { fecharModalNovo(); carregar() }

// --- Modal Editar ---
const exibirModalEditar = ref(false)
const enviandoEdicao = ref(false)
const formEditar = ref({ id: null, nome: '', cpf: '', telefone: '', email: '', registroConselho: '', especialidadeId: '' })

async function abrirModalEditar(p) {
  formEditar.value = { id: p.id, nome: p.nome, cpf: p.cpf, telefone: p.telefone, email: p.email || '', registroConselho: p.registroConselho || '', especialidadeId: p.especialidadeId }
  if (!especialidades.value.length) {
    const { data } = await api.get('/especialidades')
    especialidades.value = data
  }
  exibirModalEditar.value = true
}
function fecharModalEditar() { exibirModalEditar.value = false }

async function salvarEdicao() {
  try {
    enviandoEdicao.value = true
    await api.put(`/profissionais/${formEditar.value.id}`, {
      nome: formEditar.value.nome,
      cpf: formEditar.value.cpf,
      telefone: formEditar.value.telefone,
      email: formEditar.value.email || null,
      registroConselho: formEditar.value.registroConselho || null,
      especialidadeId: Number(formEditar.value.especialidadeId)
    })
    fecharModalEditar()
    await carregar()
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao atualizar profissional.')
  } finally {
    enviandoEdicao.value = false
  }
}

// --- Excluir ---
const excluindo = ref(false)
const { confirmar } = useConfirm()

async function excluir(p) {
  const ok = await confirmar({
    titulo: 'Excluir Profissional',
    mensagem: 'Tem certeza que deseja excluir',
    nome: p.nome,
    aviso: 'Esta ação não pode ser desfeita.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  try {
    excluindo.value = true
    await api.delete(`/profissionais/${p.id}`)
    await carregar()
  } catch {
    toast.erro('Erro ao excluir profissional.')
  } finally {
    excluindo.value = false
  }
}

async function carregar() {
  try {
    profissionais.value = await listarProfissionais()
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error)
  } finally {
    carregando.value = false
  }
}

const profissionaisFiltrados = computed(() => {
  if (!busca.value) return profissionais.value
  const termo = busca.value.toLowerCase().trim()
  return profissionais.value.filter(p => {
    return (
      p.nome?.toLowerCase().includes(termo) ||
      p.cpf?.includes(termo) ||
      p.telefone?.includes(termo)
    )
  })
})

onMounted(carregar)
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Profissionais</h1>
        <p>Gerencie os profissionais cadastrados na plataforma</p>
      </div>

      <button class="new-button" @click="abrirModalNovo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Profissional
      </button>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM15 15l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input v-model="busca" type="text" placeholder="Buscar por nome, CPF ou telefone..." class="search-input" />
      </div>
    </div>

    <div v-if="carregando" class="state-card">
      <div class="spinner"></div>
      <p>Carregando profissionais...</p>
    </div>

    <div v-else-if="profissionaisFiltrados.length === 0" class="state-card empty">
      <p>Nenhum profissional encontrado.</p>
    </div>

    <div v-else class="table-card">
      <table class="clinical-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>CPF</th>
            <th>Especialidade</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in profissionaisFiltrados" :key="p.id">
            <td>
              <div class="patient-profile">
                <div class="patient-avatar">{{ p.nome.charAt(0).toUpperCase() }}</div>
                <span class="patient-name">{{ p.nome }}</span>
              </div>
            </td>
            <td class="text-muted">{{ p.telefone }}</td>
            <td class="text-muted">{{ p.cpf }}</td>
            <td class="text-muted">{{ p.especialidade?.nome || '-' }}</td>
            <td class="text-right">
              <div class="acoes">
                <button class="btn-editar" @click="abrirModalEditar(p)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button class="btn-excluir" @click="excluir(p)">
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

    <!-- Modal: Editar Profissional -->
    <div v-if="exibirModalEditar" class="modal-overlay" @click.self="fecharModalEditar">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h2>Editar Profissional</h2>
          <button class="btn-fechar-modal" @click="fecharModalEditar">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEdicao">
            <div class="form-grid">
              <div class="field-group span-2">
                <label>Nome Completo <span class="obrigatorio">*</span></label>
                <input v-model="formEditar.nome" type="text" required :disabled="enviandoEdicao" />
              </div>
              <div class="field-group">
                <label>CPF</label>
                <input :value="formEditar.cpf" @input="formEditar.cpf = mascaraCpf($event.target.value)" placeholder="000.000.000-00" maxlength="14" :disabled="enviandoEdicao" />
              </div>
              <div class="field-group">
                <label>Telefone</label>
                <input :value="formEditar.telefone" @input="formEditar.telefone = mascaraTelefone($event.target.value)" placeholder="(00) 00000-0000" maxlength="15" :disabled="enviandoEdicao" />
              </div>
              <div class="field-group">
                <label>E-mail</label>
                <input v-model="formEditar.email" type="email" :disabled="enviandoEdicao" />
              </div>
              <div class="field-group">
                <label>Registro do Conselho</label>
                <input :value="formEditar.registroConselho" @input="formEditar.registroConselho = mascaraConselho($event.target.value)" placeholder="CRM/SP 123456" maxlength="25" :disabled="enviandoEdicao" />
              </div>
              <div class="field-group span-2">
                <label>Especialidade <span class="obrigatorio">*</span></label>
                <select v-model="formEditar.especialidadeId" required :disabled="enviandoEdicao">
                  <option value="">Selecione...</option>
                  <option v-for="e in especialidades" :key="e.id" :value="e.id">{{ e.nome }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancelar" @click="fecharModalEditar" :disabled="enviandoEdicao">Cancelar</button>
              <button type="submit" class="btn-salvar" :disabled="enviandoEdicao">{{ enviandoEdicao ? 'Salvando...' : 'Salvar alterações' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>


    <div v-if="exibirModalNovo" class="modal-overlay" @click.self="fecharModalNovo">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Cadastrar Novo Profissional</h2>
          <button class="btn-fechar-modal" @click="fecharModalNovo">&times;</button>
        </div>
        <div class="modal-body">
          <ProfissionalNovo @salvo="aoSalvarNovo" @fechar="fecharModalNovo" />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Importação e estilos copiados integralmente do arquivo de pacientes para uniformidade */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 28px; color: #0f172a; margin: 0 0 4px 0; }
.page-header p { color: #64748b; margin: 0; font-size: 14.5px; }

.new-button { background: #059669; color: #ffffff; border: none; padding: 12px 20px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,.15); transition: all 0.2s ease; }
.new-button:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,.25); }

.toolbar { margin-bottom: 24px; }
.search-wrap { display: flex; align-items: center; position: relative; max-width: 480px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; }
.search-icon { position: absolute; left: 14px; width: 18px; color: #94a3b8; }
.search-input { width: 100%; border: none; background: transparent; padding: 13px 14px 13px 44px; font-size: 14px; outline: none; }

.table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.clinical-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14.5px; }
.clinical-table th { background-color: #f8fafc; padding: 16px 24px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; }
.clinical-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
.patient-profile { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 36px; height: 36px; border-radius: 10px; background-color: rgba(5, 150, 105, 0.08); color: #059669; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.text-muted { color: #64748b; }
.text-right { text-align: right; }
.acoes { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.btn-editar { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-editar:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }
.btn-excluir { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-excluir:hover { background: #fef2f2; border-color: #f87171; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-container.modal-lg { max-width: 660px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group.span-2 { grid-column: span 2; }
.field-group label { font-size: 13px; font-weight: 600; color: #475569; }
.obrigatorio { color: #ef4444; }
.field-group input, .field-group select { height: 42px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: 'Inter', sans-serif; color: #334155; background: #f8fafc; outline: none; transition: all 0.2s ease; box-sizing: border-box; width: 100%; }
.field-group input:focus, .field-group select:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 3px rgba(5,150,105,.08); }
.field-group input:disabled, .field-group select:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-salvar { background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(5,150,105,.15); }
.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }


.state-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; text-align: center; color: #64748b; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(5, 150, 105, 0.1); border-radius: 50%; border-top-color: #059669; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #ffffff; border-radius: 16px; width: 100%; max-width: 660px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; animation: aparecer 0.2s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
.modal-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }
@keyframes aparecer { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>