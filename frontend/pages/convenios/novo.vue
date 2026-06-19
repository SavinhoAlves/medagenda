<template>
  <form @submit.prevent="salvarNovoConvenio">
    <div class="form-group">
      <label for="nome-convenio">Nome do Convênio *</label>
      <input 
        type="text" 
        id="nome-convenio" 
        v-model="nome" 
        required 
        placeholder="Ex: Bradesco Saúde Top" 
        :disabled="enviando"
      />
    </div>

    <div class="modal-footer-acoes">
      <button type="button" class="btn-cancelar" @click="$emit('fechar')" :disabled="enviando">
        Cancelar
      </button>
      <button type="submit" class="btn-salvar" :disabled="enviando">
        {{ enviando ? 'Salvando...' : 'Cadastrar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../services/api'

// Define os eventos que o modal pode emitir para a listagem pai
const emit = defineEmits(['fechar', 'salvo'])

const nome = ref('')
const enviando = ref(false)

async function salvarNovoConvenio() {
  if (!nome.value.trim()) return
  
  try {
    enviando.value = true
    await api.post('/convenios', { nome: nome.value })
    
    nome.value = '' // Reseta formulário
    emit('salvo')   // Avisa o index.vue para fechar e atualizar a lista
  } catch (error) {
    console.error('Erro ao cadastrar convênio:', error)
    alert('Erro ao cadastrar convênio. Tente novamente.')
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
label { font-size: 13px; font-weight: 600; color: #475569; }
input { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #334155; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; }
input:focus { border-color: #00a86b; box-shadow: 0 0 0 2px rgba(0, 168, 107, 0.1); }

.modal-footer-acoes { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-salvar { background: #00a86b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn-salvar:hover { background: #008f5d; }
</style>