<template>
  <div class="pagina-container">
    <header class="pagina-header">
      <div class="titulo-wrapper">
        <CreditCard :size="24" class="icone-titulo" />
        <h2>{{ carregando ? 'Carregando...' : `Editar Convênio: ${convenio.nome}` }}</h2>
      </div>
      <button class="btn-voltar" @click="voltar">
        <ArrowLeft :size="16" /> Voltar
      </button>
    </header>

    <main class="conteudo-principal">
      <form @submit.prevent="salvarAlteracoes" class="form-card">
        <div class="form-group">
          <label for="nome">Nome do Convênio <span class="obrigatorio">*</span></label>
          <input 
            type="text" 
            id="nome" 
            v-model="convenio.nome" 
            required 
            placeholder="Ex: Unimed Nacional, Bradesco Saúde..."
            :disabled="salvando"
          />
        </div>

        <footer class="form-acoes">
          <button type="button" class="btn-excluir" @click="abrirModalExcluir" :disabled="salvando || carregando">
            <Trash2 :size="16" /> Excluir Convênio
          </button>
          
          <div class="acoes-direita">
            <button type="button" class="btn-cancelar" @click="voltar" :disabled="salvando">
              Cancelar
            </button>
            <button type="submit" class="btn-salvar" :disabled="salvando || carregando">
              <Check :size="16" /> {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </footer>
      </form>
    </main>

    <!-- Modal: Confirmar Exclusão -->
    <div v-if="exibirModalExcluir" class="modal-overlay" @click.self="fecharModalExcluir">
      <div class="modal-confirm">
        <div class="modal-confirm-header">
          <h2>Excluir Convênio</h2>
          <button class="btn-fechar" @click="fecharModalExcluir">&times;</button>
        </div>
        <div class="modal-confirm-body">
          <div class="excluir-content">
            <div class="excluir-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="26" height="26">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p>Tem certeza que deseja excluir <strong>{{ convenio.nome }}</strong>? Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-confirm-footer">
            <button class="btn-sec" @click="fecharModalExcluir" :disabled="excluindo">Cancelar</button>
            <button class="btn-del" @click="executarExclusao" :disabled="excluindo">{{ excluindo ? 'Excluindo...' : 'Sim, excluir' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import { CreditCard, ArrowLeft, Trash2, Check } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const idConvenio = route.params.id

const convenio = ref({ nome: '' })
const carregando = ref(true)
const salvando = ref(false)

useHead(computed(() => ({ title: convenio.value?.nome ? `Editar: ${convenio.value.nome}` : 'Convênio' })))
const toast = useToast()

// --- Modal Excluir ---
const exibirModalExcluir = ref(false)
const excluindo = ref(false)
function abrirModalExcluir() { exibirModalExcluir.value = true }
function fecharModalExcluir() { exibirModalExcluir.value = false }

async function buscarConvenio() {
  try {
    carregando.value = true
    const res = await api.get(`/convenios/${idConvenio}`)
    convenio.value = res.data
  } catch (error) {
    console.error('Erro ao buscar convênio:', error)
    toast.erro('Erro ao carregar os dados do convênio.')
    voltar()
  } finally {
    carregando.value = false
  }
}

async function salvarAlteracoes() {
  try {
    salvando.value = true
    await api.put(`/convenios/${idConvenio}`, { nome: convenio.value.nome })
    toast.sucesso('Convênio atualizado com sucesso!')
    setTimeout(voltar, 1200)
  } catch (error) {
    console.error('Erro ao atualizar convênio:', error)
    toast.erro('Não foi possível salvar as alterações.')
  } finally {
    salvando.value = false
  }
}

async function executarExclusao() {
  try {
    excluindo.value = true
    await api.delete(`/convenios/${idConvenio}`)
    voltar()
  } catch (error) {
    console.error('Erro ao excluir convênio:', error)
    fecharModalExcluir()
    toast.erro('Erro ao excluir. Verifique se não há pacientes vinculados a este convênio.')
  } finally {
    excluindo.value = false
  }
}

function voltar() {
  router.push('/convenios')
}

onMounted(() => {
  buscarConvenio()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.pagina-container {
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  max-width: 900px;
}

.pagina-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.titulo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icone-titulo { color: #059669; }

.pagina-header h2 {
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.btn-voltar:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.form-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
  border: 1px solid #e2e8f0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.obrigatorio { color: #ef4444; }

input {
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #334155;
  background: #f8fafc;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

input:disabled { opacity: 0.6; cursor: not-allowed; }

.form-acoes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
  margin-top: 8px;
}

.acoes-direita {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-excluir {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-excluir:hover { background-color: #fef2f2; border-color: #f87171; }

.btn-cancelar {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancelar:hover { background-color: #f1f5f9; }

.btn-salvar {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
}

.btn-salvar:hover { background-color: #047857; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25); }

button:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-confirm { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-confirm-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-confirm-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
.modal-confirm-body { padding: 24px; }
.excluir-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding-bottom: 20px; }
.excluir-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; }
.excluir-content p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
.modal-confirm-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-sec { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn-del { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn-del:hover { background: #b91c1c; }
.btn-del:disabled, .btn-sec:disabled { opacity: 0.6; cursor: not-allowed; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
</style>