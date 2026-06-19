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
          <button type="button" class="btn-excluir" @click="confirmarExclusao" :disabled="salvando || carregando">
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import { CreditCard, ArrowLeft, Trash2, Check } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const idConvenio = route.params.id

const convenio = ref({ nome: '' })
const carregando = ref(true)
const salvando = ref(false)

async function buscarConvenio() {
  try {
    carregando.value = true
    const res = await api.get(`/convenios/${idConvenio}`)
    convenio.value = res.data
  } catch (error) {
    console.error('Erro ao buscar convênio:', error)
    alert('Erro ao carregar os dados do convênio.')
    voltar()
  } finally {
    carregando.value = false
  }
}

async function salvarAlteracoes() {
  try {
    salvando.value = true
    await api.put(`/convenios/${idConvenio}`, { nome: convenio.value.nome })
    alert('Convênio atualizado com sucesso!')
    voltar()
  } catch (error) {
    console.error('Erro ao atualizar convênio:', error)
    alert('Não foi possível salvar as alterações.')
  } finally {
    salvando.value = false
  }
}

async function confirmarExclusao() {
  if (!confirm(`Tem certeza que deseja excluir o convênio "${convenio.value.nome}"? Esta ação não pode ser desfeita.`)) {
    return
  }
  
  try {
    salvando.value = true
    await api.delete(`/convenios/${idConvenio}`)
    alert('Convênio excluído com sucesso!')
    voltar()
  } catch (error) {
    console.error('Erro ao excluir convênio:', error)
    alert('Erro ao excluir. Certifique-se de que não existem pacientes ou consultas vinculados a este convênio.')
  } finally {
    salvando.value = false
  }
}

function voltar() {
  router.push('/agenda') // Ou para a tela de listagem de convênios, se houver
}

onMounted(() => {
  buscarConvenio()
})
</script>

<style scoped>
.pagina-container {
  padding: 24px;
  font-family: 'Inter', sans-serif;
  max-width: 800px;
  margin: 0 auto;
}
.pagina-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.titulo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icone-titulo { color: #2563eb; }
.pagina-header h2 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}
.btn-voltar {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}
.form-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}
label {
  font-size: 14px;
  font-weight: 500;
  color: #344155;
}
.obrigatorio { color: #ef4444; }
input {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}
input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.1);
}
.form-acoes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}
.acoes-direita {
  display: flex;
  gap: 12px;
}
.btn-excluir {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-excluir:hover { background-color: #fef2f2; }
.btn-cancelar {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px 14px;
}
.btn-salvar {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-salvar:hover { background-color: #1d4ed8; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>