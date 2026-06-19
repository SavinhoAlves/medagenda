<template>
  <form @submit.prevent="salvar">
    <div class="form-grid">

      <div class="field-group span-2">
        <label>Nome da especialidade <span class="obrigatorio">*</span></label>
        <input v-model="form.nome" type="text" placeholder="Ex: Cardiologia, Pediatria..." required :disabled="enviando" />
      </div>

      <div class="field-group span-2">
        <label>Descrição</label>
        <input v-model="form.descricao" type="text" placeholder="Breve descrição da especialidade" :disabled="enviando" />
      </div>

    </div>

    <div class="modal-footer">
      <button type="button" class="btn-cancelar" @click="$emit('fechar')" :disabled="enviando">Cancelar</button>
      <button type="submit" class="btn-salvar" :disabled="enviando">
        {{ enviando ? 'Salvando...' : 'Cadastrar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['fechar', 'salvo'])
const toast = useToast()
const enviando = ref(false)

const form = ref({ nome: '', descricao: '' })

async function salvar() {
  try {
    enviando.value = true
    await api.post('/especialidades', {
      nome: form.value.nome,
      descricao: form.value.descricao
    })
    emit('salvo')
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao salvar especialidade.')
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group.span-2 { grid-column: span 2; }
.field-group label { font-size: 13px; font-weight: 600; color: #475569; }
.obrigatorio { color: #ef4444; }
.field-group input {
  height: 42px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 12px;
  font-size: 14px; font-family: 'Inter', sans-serif; color: #334155;
  background: #f8fafc; outline: none; transition: all 0.2s ease;
}
.field-group input:focus { border-color: #059669; background: #ffffff; box-shadow: 0 0 0 3px rgba(5,150,105,.08); }
.field-group input::placeholder { color: #94a3b8; }
.field-group input:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.btn-cancelar:hover { background: #e2e8f0; }
.btn-salvar { background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,.15); transition: all 0.2s; }
.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
