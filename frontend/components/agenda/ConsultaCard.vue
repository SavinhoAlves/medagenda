<script setup>
import { computed } from 'vue' // 🔥 CORREÇÃO: Importação obrigatória adicionada

const props = defineProps({
  consulta: {
    type: Object,
    required: true
  }
})

const statusMap = {
  AGENDADA: { label: 'Agendada', color: '#10b981' },
  CONFIRMADA: { label: 'Confirmada', color: '#3b82f6' },
  EM_ANDAMENTO: { label: 'Em andamento', color: '#f59e0b' },
  FINALIZADA: { label: 'Finalizada', color: '#8b5cf6' },
  CANCELADA: { label: 'Cancelada', color: '#ef4444' },
  FALTOU: { label: 'Faltou', color: '#6b7280' }
}

const statusAtual = computed(() => {
  return statusMap[props.consulta.status] || statusMap.AGENDADA
})

function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>

  <div
    class="consulta-card"
    :style="{
      '--accent': statusAtual.color
    }"
  >

    <!-- TOP -->
    <div class="card-top">

      <div class="patient-avatar">

        {{
          consulta?.paciente?.nome?.charAt(0)
        }}

      </div>

      <div class="patient-info">

        <h3>
          {{ consulta?.paciente?.nome }}
        </h3>

        <p>
          {{
            consulta?.profissional?.nome
          }}
        </p>

      </div>

      <div
        class="status-badge"
      >
        {{ statusAtual.label }}
      </div>

    </div>

    <!-- BODY -->
    <div class="card-body">

      <div class="info-row">

        <div class="info-icon">

          <svg viewBox="0 0 24 24" fill="none">

            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="1.6"
            />

            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />

          </svg>

        </div>

        <span>

          {{
            formatarHora(consulta.dataInicio)
          }}

          →

          {{
            formatarHora(consulta.dataFim)
          }}

        </span>

      </div>

      <div
        v-if="consulta.sala"
        class="info-row"
      >

        <div class="info-icon">

          <svg viewBox="0 0 24 24" fill="none">

            <path
              d="M4 10L12 4l8 6v9a1 1 0 01-1 1h-4v-5H9v5H5a1 1 0 01-1-1v-9z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />

          </svg>

        </div>

        <span>
          Sala {{ consulta.sala }}
        </span>

      </div>

      <div
        v-if="consulta.valor"
        class="info-row"
      >

        <div class="info-icon">

          <svg viewBox="0 0 24 24" fill="none">

            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="1.6"
            />

            <path
              d="M12 7v10"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />

            <path
              d="M15 9.5c0-1.2-1.3-2-3-2s-3 .8-3 2 1.3 2 3 2 3 .8 3 2-1.3 2-3 2-3-.8-3-2"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />

          </svg>

        </div>

        <span>
          R$ {{ consulta.valor }}
        </span>

      </div>

    </div>

    <!-- OBS -->
    <div
      v-if="consulta.observacoes"
      class="obs-box"
    >

      {{ consulta.observacoes }}

    </div>

  </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=Inter:wght@400;500;600&display=swap');

.consulta-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.01);
  transition: all 0.2s ease;
}

.consulta-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.08);
}

.time-box {
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-align: center;
  min-width: 65px;
}

.time-box .hour {
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.time-box .duration {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #64748b;
}

.patient-info {
  flex: 1;
}

.patient-info h3 {
  margin: 0 0 2px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
}

.patient-info p {
  margin: 0;
  font-family: 'Inter', sans-serif;
  color: #64748b;
  font-size: 13px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid transparent;
}
</style>