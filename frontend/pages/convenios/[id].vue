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
          <button type="button" class="btn-excluir" @click="executarExclusao" :disabled="salvando || carregando">
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

const excluindo = ref(false)
const { confirmar } = useConfirm()

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
  const ok = await confirmar({
    titulo: 'Excluir Convênio',
    mensagem: 'Tem certeza que deseja excluir',
    nome: convenio.value.nome,
    aviso: 'Verifique se não há pacientes vinculados a este convênio.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  try {
    excluindo.value = true
    await api.delete(`/convenios/${idConvenio}`)
    voltar()
  } catch (error) {
    console.error('Erro ao excluir convênio:', error)
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

</style>