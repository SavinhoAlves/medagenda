<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { navigateTo } from '#app' // <-- Importado para evitar erros de runtime

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const form = ref({
  nome: '',
  descricao: '',
  sigla: '',
  n_conselho: ''
})

async function salvar() {
  try {
    await api.post('/especialidades', {
      nome: form.value.nome,
      descricao: form.value.descricao,
      sigla: form.value.sigla,
      numero_conselho: form.value.n_conselho
    })

    await navigateTo('/especialidades')

  } catch (error) {
    console.error('ERRO BACKEND:', error.response?.data || error)
    alert(error.response?.data?.error || 'Erro ao salvar')
  }
}
</script>

<template>
  <div class="page-wrapper">

    <div>
      <h1 class="page-title">
        Nova especialidade
      </h1>
      <p class="page-sub">
        Cadastre uma especialidade
      </p>
    </div>

    <form 
      class="form-card" 
      @submit.prevent="salvar"
    >
      <div class="form-grid">

        <div class="input-group">
          <label>Nome</label>
          <input 
            v-model="form.nome" 
            placeholder="Ex: Cardiologia, Pediatria..." 
            required
          >
        </div>

        <div class="input-group">
          <label>Descrição</label>
          <input 
            v-model="form.descricao" 
            placeholder="Breve descrição da especialidade"
            required
          >
        </div>

        <div class="input-group">
          <label>Tipo (Sigla)</label>
          <input 
            v-model="form.sigla" 
            placeholder="Ex: CRM, CRO..."
            required
          >
        </div>

        <div class="input-group">
          <label>Número do conselho</label>
          <input 
            v-model="form.n_conselho" 
            placeholder="Código do conselho"
            required
            type="number"
          >
        </div>

      </div>

      <button class="submit-btn">
        Salvar especialidade
      </button>
    </form>

  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px;
}

.page-title {
  font-size: 42px;
  color: #f0fdf4;
}

.page-sub {
  color: rgba(255, 255, 255, .45);
}

.form-card {
  background: rgba(12, 19, 24, .82);
  border: 1px solid rgba(255, 255, 255, .06);
  border-radius: 24px;
  padding: 32px;
  /* max-width: 800px; */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  color: rgba(255, 255, 255, .45);
  font-size: 14px;
  font-weight: 500;
}

.input-group input,
.input-group select {
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, .06);
  background: rgba(255, 255, 255, .03);
  padding: 0 16px;
  color: white;
  outline: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: #10b981;
  background: rgba(255, 255, 255, .05);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Remove as setas padrões de inputs do tipo number */
.input-group input[type="number"]::-webkit-outer-spin-button,
.input-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-group input[type="number"] {
  -moz-appearance: textfield;
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
  font-size: 15px;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
</style>