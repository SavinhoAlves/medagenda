<template>
  <div class="page-wrapper">
    <header class="page-header">
      <div class="bloco-titulo">
        <h1>Convênios</h1>
        <p>Gerencie as operadoras de saúde aceitas na clínica</p>
      </div>
      
      <button class="btn-novo" @click="abrirModalNovo">
        <Plus :size="18" />
        Novo Convênio
      </button>
    </header>

    <main class="card-tabela">
      <div v-if="loading" class="estado-carregamento">
        <Loader2 class="spinner" :size="24" />
        <span>Buscando convênios...</span>
      </div>

      <table v-else class="tabela-custom">
        <thead>
          <tr>
            <th style="width: 100px;">ID</th>
            <th>NOME DO CONVÊNIO</th>
            <th class="txt-direita">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="convenio in listaConvenios" :key="convenio.id">
            <td class="id-texto">#{{ convenio.id }}</td>
            <td>
              <div class="celula-convenio">
                <div class="avatar-convenio">
                  <CreditCard :size="16" />
                </div>
                <span class="nome-texto">{{ convenio.nome }}</span>
              </div>
            </td>
            <td class="txt-direita">
              <div class="acoes">
                <button class="btn-editar" @click="abrirModalEditar(convenio)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button class="btn-excluir" @click="excluir(convenio)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Excluir
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="listaConvenios.length === 0">
            <td colspan="3" class="tabela-vazia">Nenhum convênio cadastrado no banco de dados.</td>
          </tr>
        </tbody>
      </table>
    </main>

    <!-- Modal: Editar Convênio -->
    <div v-if="exibirModalEditar" class="modal-overlay" @click.self="fecharModalEditar">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Editar Convênio</h2>
          <button class="btn-fechar-modal" @click="fecharModalEditar">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEdicao">
            <div class="field-group">
              <label>Nome do Convênio <span class="obrigatorio">*</span></label>
              <input v-model="formEditar.nome" type="text" required :disabled="enviandoEdicao" placeholder="Ex: Unimed, Bradesco Saúde..." />
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
          <h2>Cadastrar Novo Convênio</h2>
          <button class="btn-fechar-modal" @click="fecharModalNovo">&times;</button>
        </div>
        <div class="modal-body">
          <ConvenioNovo @salvo="aoSalvarNovo" @fechar="fecharModalNovo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { CreditCard, Loader2, Plus } from 'lucide-vue-next'
import ConvenioNovo from './novo.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Convênios' })

const listaConvenios = ref([])
const loading = ref(true)
const toast = useToast()

// --- Modal Novo ---
const exibirModalNovo = ref(false)
function abrirModalNovo() { exibirModalNovo.value = true }
function fecharModalNovo() { exibirModalNovo.value = false }
function aoSalvarNovo() { fecharModalNovo(); buscarConvenios() }

// --- Modal Editar ---
const exibirModalEditar = ref(false)
const enviandoEdicao = ref(false)
const formEditar = ref({ id: null, nome: '' })

function abrirModalEditar(convenio) {
  formEditar.value = { id: convenio.id, nome: convenio.nome }
  exibirModalEditar.value = true
}
function fecharModalEditar() { exibirModalEditar.value = false }

async function salvarEdicao() {
  try {
    enviandoEdicao.value = true
    await api.put(`/convenios/${formEditar.value.id}`, { nome: formEditar.value.nome })
    fecharModalEditar()
    await buscarConvenios()
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao atualizar convênio.')
  } finally {
    enviandoEdicao.value = false
  }
}

// --- Excluir ---
const excluindo = ref(false)
const { confirmar } = useConfirm()

async function excluir(convenio) {
  const ok = await confirmar({
    titulo: 'Excluir Convênio',
    mensagem: 'Tem certeza que deseja excluir',
    nome: convenio.nome,
    aviso: 'Verifique se não há pacientes vinculados a este convênio.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  try {
    excluindo.value = true
    await api.delete(`/convenios/${convenio.id}`)
    await buscarConvenios()
  } catch {
    toast.erro('Erro ao excluir convênio. Verifique se não há pacientes vinculados.')
  } finally {
    excluindo.value = false
  }
}

async function buscarConvenios() {
  try {
    loading.value = true
    const { data } = await api.get('/convenios')
    listaConvenios.value = data
  } catch (error) {
    console.error('Erro ao listar convênios:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  buscarConvenios()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper {
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }

.bloco-titulo h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.bloco-titulo p { margin: 0; color: #64748b; font-size: 14px; }

/* Botão Verde Esmeralda igual ao de Pacientes */
.btn-novo { background-color: #00a86b; color: #ffffff; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s ease; box-shadow: 0 4px 6px -1px rgba(0, 168, 107, 0.15); }
.btn-novo:hover { background-color: #008f5d; }

.card-tabela { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; max-width: 100%; }
.tabela-custom { width: 100%; border-collapse: collapse; font-size: 14px; }
.tabela-custom th { text-align: left; background-color: #f8fafc; padding: 16px 24px; font-size: 12px; font-weight: 600; color: #475569; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
.tabela-custom td { padding: 18px 24px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.tabela-custom tr:hover td { background-color: #f8fafc; }

.celula-convenio { display: flex; align-items: center; gap: 12px; }
.avatar-convenio { width: 32px; height: 32px; border-radius: 6px; background-color: #e6f7f0; color: #00a86b; display: flex; justify-content: center; align-items: center; }
.nome-texto { font-weight: 600; color: #0f172a; }
.id-texto { color: #94a3b8; font-family: monospace; }
.txt-direita { text-align: right !important; }

.acoes { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.btn-editar { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-editar:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }
.btn-excluir { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-excluir:hover { background: #fef2f2; border-color: #f87171; }

.field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.field-group label { font-size: 13px; font-weight: 600; color: #475569; }
.obrigatorio { color: #ef4444; }
.field-group input { height: 42px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 14px; font-family: 'Inter', sans-serif; color: #334155; background: #f8fafc; outline: none; transition: all 0.2s; box-sizing: border-box; width: 100%; }
.field-group input:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 3px rgba(5,150,105,.08); }
.field-group input:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-salvar { background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

.estado-carregamento { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: #64748b; }
.spinner { animation: rodar 1s linear infinite; color: #00a86b; }
.tabela-vazia { text-align: center; color: #94a3b8; padding: 40px; }
@keyframes rodar { to { transform: rotate(360deg); } }

/* Estilização do Modal Backdrop e Card */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #ffffff; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; animation: aparecer 0.2s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
.modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }

@keyframes aparecer {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>