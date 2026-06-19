<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const consulta = ref(null)

useHead(computed(() => ({ title: consulta.value ? `Consulta #${consulta.value.id}` : 'Consulta' })))

function formatarData(valor) {
  if (!valor) return '—'
  const d = new Date(String(valor).replace(' ', 'T'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function carregar() {
  try {
    const response = await api.get(`/consultas/${route.params.id}`)
    consulta.value = response.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(carregar)
</script>

<template>
  <div v-if="consulta" class="page-wrapper">

    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/consultas" class="btn-voltar">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Voltar
        </NuxtLink>
        <div>
          <h1>Detalhes da Consulta</h1>
          <p>{{ consulta.paciente?.nome }}</p>
        </div>
      </div>
      <span class="badge-status" :class="consulta.status?.toLowerCase()">
        {{ consulta.status || 'Agendada' }}
      </span>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <span class="info-label">Paciente</span>
        <strong class="info-value">{{ consulta.paciente?.nome || '—' }}</strong>
      </div>
      <div class="info-card">
        <span class="info-label">Profissional</span>
        <strong class="info-value">{{ consulta.profissional?.nome || '—' }}</strong>
      </div>
      <div class="info-card">
        <span class="info-label">Especialidade</span>
        <strong class="info-value highlight">{{ consulta.profissional?.especialidade?.nome || '—' }}</strong>
      </div>
      <div class="info-card">
        <span class="info-label">Data e Hora</span>
        <strong class="info-value">{{ formatarData(consulta.dataInicio || consulta.dataConsulta) }}</strong>
      </div>
      <div v-if="consulta.valor" class="info-card">
        <span class="info-label">Valor</span>
        <strong class="info-value">R$ {{ consulta.valor }}</strong>
      </div>
      <div v-if="consulta.observacoes" class="info-card span-2">
        <span class="info-label">Observações</span>
        <strong class="info-value">{{ consulta.observacoes }}</strong>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; box-sizing: border-box; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
.header-left { display: flex; align-items: center; gap: 20px; }

.btn-voltar { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; font-size: 14px; font-weight: 500; color: #475569; text-decoration: none; transition: all 0.2s ease; }
.btn-voltar:hover { background: #f1f5f9; border-color: #cbd5e1; }

.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 3px; letter-spacing: -0.3px; }
.page-header p { color: #64748b; font-size: 14px; margin: 0; }

.badge-status { font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 8px; background: rgba(5,150,105,.08); color: #059669; }
.badge-status.cancelada { background: rgba(239,68,68,.08); color: #dc2626; }
.badge-status.finalizada { background: rgba(139,92,246,.08); color: #7c3aed; }
.badge-status.em_andamento { background: rgba(245,158,11,.08); color: #d97706; }

.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

.info-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 8px; }
.info-card.span-2 { grid-column: span 2; }

.info-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
.info-value { font-size: 16px; font-weight: 600; color: #0f172a; }
.info-value.highlight { color: #059669; }

@media (max-width: 640px) {
  .info-grid { grid-template-columns: 1fr; }
  .info-card.span-2 { grid-column: span 1; }
}
</style>
