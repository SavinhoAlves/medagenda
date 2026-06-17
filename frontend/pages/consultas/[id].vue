<script setup>

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import api from '../../services/api'

const route = useRoute()

const consulta = ref(null)

async function carregar() {

  try {

    const response = await api.get(
      `/consultas/${route.params.id}`
    )

    consulta.value = response.data

  } catch (error) {

    console.error(error)

  }

}

onMounted(() => {

  carregar()

})

</script>

<template>

  <div
    v-if="consulta"
    class="consulta-page"
  >

    <div class="top-card">

      <div>

        <h1 class="title">
          {{ consulta.paciente.nome }}
        </h1>

        <p class="sub">
          Consulta médica
        </p>

      </div>

      <div class="status">
        {{ consulta.status }}
      </div>

    </div>

    <div class="info-grid">

      <div class="info-card">
        <span>Profissional</span>
        <strong>
          {{ consulta.profissional.nome }}
        </strong>
      </div>

      <div class="info-card">
        <span>Especialidade</span>
        <strong>
          {{
            consulta.profissional.especialidade.nome
          }}
        </strong>
      </div>

      <div class="info-card">
        <span>Data</span>
        <strong>
          {{
            new Date(
              consulta.dataConsulta
            ).toLocaleString('pt-BR')
          }}
        </strong>
      </div>

      <div class="info-card">
        <span>Valor</span>
        <strong>
          R$ {{ consulta.valor }}
        </strong>
      </div>

    </div>

  </div>

</template>

<style scoped>

.consulta-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-card {
  background: rgba(12,19,24,.82);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
}

.title {
  font-size: 42px;
  color: #f0fdf4;
}

.sub {
  color: rgba(255,255,255,.45);
}

.status {
  height: fit-content;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(16,185,129,.12);
  color: #34d399;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 20px;
}

.info-card {
  background: rgba(12,19,24,.82);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 24px;
  padding: 24px;
}

.info-card span {
  display: block;
  margin-bottom: 10px;
  color: rgba(255,255,255,.45);
}

.info-card strong {
  color: #f0fdf4;
  font-size: 18px;
}

</style>