<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const especialidades = ref([])

const form = ref({
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  registroConselho: '',
  especialidadeId: ''
})

async function carregarEspecialidades() {
  try {
    const response = await api.get('/especialidades')
    especialidades.value = response.data
  } catch (error) {
    console.error('ERRO BACKEND:', error.response?.data || error)
  }
}

async function salvar() {
  try {
    // Corrigido: Adicionado .value para acessar as propriedades do form corretamente
    await api.post('/profissionais', {
      nome: form.value.nome,
      cpf: form.value.cpf,
      telefone: form.value.telefone,
      email: form.value.email || null,
      registroConselho: form.value.registroConselho || null,
      especialidadeId: Number(form.value.especialidadeId)
    })

    navigateTo('/profissionais')

  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  carregarEspecialidades()
})
</script>

<template>
  <div class="page-wrapper">

    <div>
      <h1 class="page-title">
        Novo profissional
      </h1>
      <p class="page-sub">
        Cadastre um profissional
      </p>
    </div>

    <form
      class="form-card"
      @submit.prevent="salvar"
    >
      <div class="form-grid">

        <div class="input-group">
          <label>Nome</label>
          <input v-model="form.nome" required>
        </div>

        <div class="input-group">
          <label>CPF</label>
          <input v-model="form.cpf" required>
        </div>

        <div class="input-group">
          <label>Telefone</label>
          <input v-model="form.telefone" required>
        </div>

        <div class="input-group">
          <label>Email</label>
          <input v-model="form.email">
        </div>

        <div class="input-group">
          <label>Registro</label>
          <input v-model="form.registroConselho">
        </div>

        <div class="input-group">
          <label>Especialidade</label>

          <select v-model="form.especialidadeId" required>
            <option value="">
              Selecione
            </option>

            <option v-for="e in especialidades" :key="e.id" :value="e.id">
              {{ e.nome }}
            </option>
          </select>
        </div>

      </div>

      <button class="submit-btn">
        Salvar profissional
      </button>
    </form>

  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 42px;
  color: #f0fdf4;
}

.page-sub {
  color: rgba(255,255,255,.45);
}

.form-card {
  background: rgba(12,19,24,.82);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 24px;
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  color: rgba(255,255,255,.45);
}

.input-group input,
.input-group select {
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.03);
  padding: 0 16px;
  color: white;
  outline: none;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #10b981;
}

.submit-btn {
  margin-top: 28px;
  height: 52px;
  border: none;
  border-radius: 14px;
  padding: 0 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
</style>