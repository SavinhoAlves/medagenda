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
              <button class="btn-editar" @click="irParaEdicao(convenio.id)">
                Editar Convênio
              </button>
            </td>
          </tr>
          <tr v-if="listaConvenios.length === 0">
            <td colspan="3" class="tabela-vazia">Nenhum convênio cadastrado no banco de dados.</td>
          </tr>
        </tbody>
      </table>
    </main>

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
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { CreditCard, Loader2, Plus } from 'lucide-vue-next'

// Importa o arquivo novo.vue para ser renderizado como Modal nesta mesma tela
import ConvenioNovo from './novo.vue'

const router = useRouter()
const listaConvenios = ref([])
const loading = ref(true)

// Controle de estado do modal
const exibirModalNovo = ref(false)

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

function irParaEdicao(id) {
  router.push(`/convenios/${id}`)
}

/* Funções de controle do Modal */
function abrirModalNovo() {
  exibirModalNovo.value = true
}

function fecharModalNovo() {
  exibirModalNovo.value = false
}

function aoSalvarNovo() {
  fecharModalNovo()
  buscarConvenios() // Recarrega a tabela automaticamente após salvar
}

onMounted(() => {
  buscarConvenios()
})
</script>

<style scoped>
.page-wrapper { font-family: 'Inter', sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.bloco-titulo h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
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

.btn-editar { background: none; border: none; color: #00a86b; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn-editar:hover { color: #008f5d; text-decoration: underline; }

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