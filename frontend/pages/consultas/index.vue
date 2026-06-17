<script setup>

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const consultas = ref([])

const carregando = ref(true)

const { listarConsultas } = useConsultas()

async function carregar() {

  try {

    consultas.value = await listarConsultas()

  } catch (error) {

    console.error(error)

  } finally {

    carregando.value = false

  }

}

onMounted(carregar)

</script>

<template>

  <div class="page-wrapper">

    <div class="page-header">

      <div>
        <h1>Consultas</h1>
        <p>Agenda médica do sistema</p>
      </div>

      <NuxtLink
        to="/consultas/novo"
        class="new-button"
      >
        Nova consulta
      </NuxtLink>

    </div>

    <div
      v-if="carregando"
      class="empty-card"
    >
      Carregando...
    </div>

    <div
      v-else
      class="consultas-grid"
    >

      <div
        v-for="consulta in consultas"
        :key="consulta.id"
        class="consulta-card"
      >

        <div class="status">
          {{ consulta.status }}
        </div>

        <h3>
          {{ consulta.paciente?.nome }}
        </h3>

        <p>
          Profissional:
          {{ consulta.profissional?.nome }}
        </p>

        <span>
          {{
            new Date(consulta.dataConsulta)
              .toLocaleString('pt-BR')
          }}
        </span>

        <NuxtLink
          :to="`/consultas/${consulta.id}`"
          class="details-button"
        >
          Ver consulta
        </NuxtLink>

      </div>

    </div>

  </div>

</template>

<style scoped>

.page-wrapper {
  padding: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  color: white;
  font-size: 32px;
}

.page-header p {
  color: rgba(255,255,255,.45);
}

.new-button {
  background: linear-gradient(135deg,#10b981,#059669);
  color: white;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 12px;
}

.consultas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(320px,1fr));
  gap: 20px;
}

.consulta-card {
  background: rgba(12,19,24,.82);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 22px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(16,185,129,.12);
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
}

.consulta-card h3 {
  color: white;
}

.consulta-card p,
.consulta-card span {
  color: rgba(255,255,255,.5);
}

.details-button {
  margin-top: 12px;
  background: rgba(255,255,255,.05);
  color: white;
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
}

.empty-card {
  background: rgba(12,19,24,.82);
  border-radius: 20px;
  padding: 32px;
  color: rgba(255,255,255,.5);
}

</style>