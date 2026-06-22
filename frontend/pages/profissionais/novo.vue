<template>
  <form @submit.prevent="salvar">

    <div class="form-grid">

      <div class="field-group span-2">
        <label>Nome completo <span class="obrigatorio">*</span></label>
        <input v-model="form.nome" type="text" placeholder="Ex: Dr. João da Silva" required :disabled="enviando" />
      </div>

      <div class="field-group">
        <label>CPF <span class="obrigatorio">*</span></label>
        <input
          :value="form.cpf"
          @input="form.cpf = mascaraCpf($event.target.value)"
          type="text"
          placeholder="000.000.000-00"
          maxlength="14"
          required
          :disabled="enviando"
        />
      </div>

      <div class="field-group">
        <label>Telefone <span class="obrigatorio">*</span></label>
        <input
          :value="form.telefone"
          @input="form.telefone = mascaraTelefone($event.target.value)"
          type="text"
          placeholder="(00) 00000-0000"
          maxlength="15"
          required
          :disabled="enviando"
        />
      </div>

      <div class="field-group">
        <label>E-mail</label>
        <input v-model="form.email" type="email" placeholder="exemplo@clinica.com" :disabled="enviando" />
      </div>

      <div class="field-group">
        <label>Registro do Conselho</label>
        <input
          :value="form.registroConselho"
          @input="form.registroConselho = mascaraConselho($event.target.value)"
          type="text"
          placeholder="CRM/SP 123456"
          maxlength="25"
          :disabled="enviando"
        />
      </div>

      <div class="field-group span-2">
        <label>Especialidade <span class="obrigatorio">*</span></label>
        <select v-model="form.especialidadeId" required :disabled="enviando">
          <option value="">Selecione uma especialidade</option>
          <option v-for="e in especialidades" :key="e.id" :value="e.id">{{ e.nome }}</option>
        </select>
      </div>

      <div class="field-group">
        <label>Valor da Consulta (R$)</label>
        <input v-model="form.valorConsulta" type="number" step="0.01" min="0" placeholder="0,00" :disabled="enviando" />
      </div>

      <div class="field-group">
        <label>Valor do Retorno (R$)</label>
        <input v-model="form.valorRetorno" type="number" step="0.01" min="0" placeholder="0,00" :disabled="enviando" />
      </div>

    </div>

    <div class="modal-footer">
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
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { useMascaras } from '~/composables/useMascaras'

const emit = defineEmits(['fechar', 'salvo'])
const { mascaraCpf, mascaraConselho, mascaraTelefone } = useMascaras()
const toast = useToast()

const especialidades = ref([])
const enviando = ref(false)

const form = ref({
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  registroConselho: '',
  especialidadeId: '',
  valorConsulta: '',
  valorRetorno: ''
})

async function carregarEspecialidades() {
  try {
    const { data } = await api.get('/especialidades')
    especialidades.value = data
  } catch (error) {
    console.error('Erro ao carregar especialidades:', error)
  }
}

async function salvar() {
  try {
    enviando.value = true
    await api.post('/profissionais', {
      nome: form.value.nome,
      cpf: form.value.cpf,
      telefone: form.value.telefone,
      email: form.value.email || null,
      registroConselho: form.value.registroConselho || null,
      especialidadeId: Number(form.value.especialidadeId),
      valorConsulta: form.value.valorConsulta ? Number(form.value.valorConsulta) : null,
      valorRetorno:  form.value.valorRetorno  ? Number(form.value.valorRetorno)  : null,
    })
    emit('salvo')
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao cadastrar profissional.')
  } finally {
    enviando.value = false
  }
}

onMounted(carregarEspecialidades)
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-group.span-2 {
  grid-column: span 2;
}

.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.obrigatorio { color: #ef4444; }

.field-group input,
.field-group select {
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #334155;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
}

.field-group input:focus,
.field-group select:focus {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

.field-group input::placeholder { color: #94a3b8; }
.field-group input:disabled,
.field-group select:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancelar {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancelar:hover { background: #e2e8f0; }

.btn-salvar {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s;
}
.btn-salvar:hover { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
