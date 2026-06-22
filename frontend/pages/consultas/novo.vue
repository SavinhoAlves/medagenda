<script setup>

import api from '~/services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'medico']
})

const router = useRouter()
const toast = useToast()

const loading = ref(false)

const pacientes = ref([])
const profissionais = ref([])

const form = ref({
  pacienteId: '',
  profissionalId: '',
  dataConsulta: '',
  status: 'AGENDADA',
  observacoes: '',
  valor: ''
})

async function carregarDados() {

  try {

    const [pacientesRes, profissionaisRes] = await Promise.all([
      api.get('/pacientes'),
      api.get('/profissionais')
    ])

    pacientes.value = pacientesRes.data
    profissionais.value = profissionaisRes.data

  } catch (error) {

    console.error(error)

  }

}

async function salvarConsulta() {

  try {

    loading.value = true

    await api.post('/consultas', {
      pacienteId: Number(form.value.pacienteId),
      profissionalId: Number(form.value.profissionalId),
      dataConsulta: form.value.dataConsulta,
      status: form.value.status,
      observacoes: form.value.observacoes,
      valor: Number(form.value.valor)
    })

    await router.push('/consultas')

  } catch (error) {

    console.error(error)

    toast.erro(error.response?.data?.error || 'Erro ao salvar consulta.')

  } finally {

    loading.value = false

  }

}

onMounted(() => {

  carregarDados()

})

</script>

<template>

  <div class="page-root">

    <div class="page-header">

      <div>

        <h1 class="page-title">
          Nova Consulta
        </h1>

        <p class="page-subtitle">
          Agende uma nova consulta médica
        </p>

      </div>

    </div>

    <div class="form-card">

      <div class="form-grid">

        <div class="field">

          <label>
            Paciente
          </label>

          <select v-model="form.pacienteId">

            <option value="">
              Selecione
            </option>

            <option
              v-for="paciente in pacientes"
              :key="paciente.id"
              :value="paciente.id"
            >
              {{ paciente.nome }}
            </option>

          </select>

        </div>

        <div class="field">

          <label>
            Profissional
          </label>

          <select v-model="form.profissionalId">

            <option value="">
              Selecione
            </option>

            <option
              v-for="profissional in profissionais"
              :key="profissional.id"
              :value="profissional.id"
            >
              {{ profissional.nome }}
            </option>

          </select>

        </div>

        <div class="field">

          <label>
            Data da consulta
          </label>

          <input
            v-model="form.dataConsulta"
            type="datetime-local"
          />

        </div>

        <div class="field">

          <label>
            Status
          </label>

          <select v-model="form.status">

            <option value="AGENDADA">
              AGENDADA
            </option>

            <option value="CONFIRMADA">
              CONFIRMADA
            </option>

            <option value="CANCELADA">
              CANCELADA
            </option>

            <option value="FINALIZADA">
              FINALIZADA
            </option>

          </select>

        </div>

        <div class="field">

          <label>
            Valor
          </label>

          <input
            v-model="form.valor"
            type="number"
            placeholder="0,00"
          />

        </div>

        <div class="field full">

          <label>
            Observações
          </label>

          <textarea
            v-model="form.observacoes"
            rows="5"
            placeholder="Digite observações da consulta..."
          />

        </div>

      </div>

      <div class="actions">

        <button
          class="btn-secondary"
          @click="router.push('/consultas')"
        >
          Cancelar
        </button>

        <button
          class="btn-primary"
          :disabled="loading"
          @click="salvarConsulta"
        >
          {{ loading ? 'Salvando...' : 'Salvar Consulta' }}
        </button>

      </div>

    </div>

  </div>

</template>

<style scoped>

.page-root {

  display: flex;
  flex-direction: column;
  gap: 24px;

}

.page-header {

  display: flex;
  justify-content: space-between;
  align-items: center;

}

.page-title {

  font-size: 32px;
  font-weight: 800;
  color: #f0fdf4;
  margin: 0;

}

.page-subtitle {

  color: rgba(255,255,255,.45);
  margin-top: 6px;

}

.form-card {

  background: rgba(12,19,24,.82);

  border: 1px solid rgba(255,255,255,.07);

  border-radius: 24px;

  padding: 32px;

}

.form-grid {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 20px;

}

.field {

  display: flex;

  flex-direction: column;

  gap: 10px;

}

.field.full {

  grid-column: span 2;

}

.field label {

  font-size: 13px;

  color: rgba(255,255,255,.6);

}

.field input,
.field select,
.field textarea {

  width: 100%;

  border: 1px solid rgba(255,255,255,.08);

  background: rgba(255,255,255,.03);

  border-radius: 14px;

  padding: 14px 16px;

  color: white;

  outline: none;

}

.field textarea {

  resize: none;

}

.actions {

  display: flex;

  justify-content: flex-end;

  gap: 14px;

  margin-top: 28px;

}

.btn-primary {

  border: none;

  background: linear-gradient(
    135deg,
    #10b981,
    #059669
  );

  color: white;

  padding: 14px 22px;

  border-radius: 14px;

  font-weight: 700;

  cursor: pointer;

}

.btn-secondary {

  border: 1px solid rgba(255,255,255,.08);

  background: rgba(255,255,255,.04);

  color: white;

  padding: 14px 22px;

  border-radius: 14px;

  cursor: pointer;

}

@media (max-width: 900px) {

  .form-grid {

    grid-template-columns: 1fr;

  }

  .field.full {

    grid-column: span 1;

  }

}

</style>