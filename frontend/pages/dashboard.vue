<script setup>
import { onMounted, ref, computed } from 'vue'
import { buscarDashboard } from '../services/dashboardService'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Dashboard' })

const carregando = ref(true)
const dados = ref({
  pacientes: 0,
  profissionais: 0,
  consultas: 0,
  consultasHoje: 0,
  ultimasConsultas: []
})

// Função auxiliar para formatar '2026-05-29 21:00:00.000' para '29/05/2026 às 21:00'
function formatarDataHora(dataString) {
  if (!dataString) return ''
  
  // Substitui o espaço por 'T' para garantir compatibilidade cross-browser com formato ISO
  const dataTratada = dataString.replace(' ', 'T')
  const data = new Date(dataTratada)
  
  const dataFormatada = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return `${dataFormatada} às ${horaFormatada}`
}

async function carregarDashboard() {
  try {
    carregando.value = true
    dados.value = await buscarDashboard()
  } catch (error) {
    console.error(error)
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarDashboard()
})

const stats = computed(() => [
  {
    id: 'pacientes',
    label: 'Pacientes',
    value: dados.value.pacientes,
    trend: '+12%',
    trendUp: true,
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    color: '#10b981',
    bg: 'rgba(16,185,129,.1)',
  },
  {
    id: 'profissionais',
    label: 'Profissionais',
    value: dados.value.profissionais,
    trend: '+4%',
    trendUp: true,
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="2.5" stroke="currentColor" stroke-width="1.6"/>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.6"/>
    </svg>`,
    color: '#6ee7f7',
    bg: 'rgba(110,231,247,.1)',
  },
  {
    id: 'consultas',
    label: 'Consultas',
    value: dados.value.consultas,
    trend: '+8%',
    trendUp: true,
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.6"/>
    </svg>`,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,.1)',
  }
])
</script>

<template>
  <div class="dash-root">
    <main class="dash-main">

      <div class="page-title-row">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Visão geral do sistema</p>
        </div>
        <div class="date-badge">
          {{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
        </div>
      </div>

      <div class="stats-grid">
        <div
          v-for="(stat, i) in stats"
          :key="stat.id"
          class="stat-card"
          :style="{ '--card-delay': `${i * 0.1}s` }"
        >
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: stat.bg, color: stat.color }" v-html="stat.icon" />
            <span class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
              {{ stat.trend }}
            </span>
          </div>

          <div class="stat-value" :style="{ '--accent': stat.color }">
            {{ stat.value }}
          </div>

          <div class="stat-label">{{ stat.label }}</div>

          <div class="stat-bar">
            <div class="stat-bar-fill" :style="{ background: stat.color, '--w': '30%' }" />
          </div>
        </div>
      </div>

      <div class="activity-section">
        <h2 class="section-title">Atividade recente</h2>
        
        <div v-if="dados.ultimasConsultas && dados.ultimasConsultas.length" class="activity-list">
          <div
            v-for="consulta in dados.ultimasConsultas"
            :key="consulta.id"
            class="activity-item"
          >
            <div class="activity-dot" />
            
            <div class="activity-content">
              <strong>{{ consulta.paciente?.nome || 'Paciente não identificado' }}</strong>
              <span>consulta com {{ consulta.profissional?.nome || 'Profissional' }}</span>
            </div>

            <div class="activity-time" v-if="consulta.dataInicio || consulta.data_inicio">
              <svg viewBox="0 0 24 24" fill="none" class="time-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              {{ formatarDataHora(consulta.dataInicio || consulta.data_inicio) }}
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" opacity=".3"/>
            <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5"/>
          </svg>
          <p>Nenhuma atividade encontrada</p>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ─── Root ──────────────────────────────────── */
.dash-root {
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  width: 100%;
}

.dash-main {
  max-width: 1250px;
  margin: 0 auto;
  padding: 110px 32px 64px;
}

/* ─── Page Title ─────────────────────────────── */
.page-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.date-badge {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

/* ─── Stats Grid ─────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
}

/* ─── Stat Card ──────────────────────────────── */
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: all 0.25s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-trend.up {
  background: #ecfdf5;
  color: #047857;
}

.stat-trend.down {
  background: #fef2f2;
  color: #b91c1c;
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 6px;
  color: #0f172a; /* Removido o gradiente transparente que falha no tema claro */
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 14px;
}

.stat-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 99px;
  width: var(--w, 30%);
}

/* ─── Activity Section ────────────────────── */
.activity-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.activity-content strong {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.activity-content span {
  color: #64748b;
  font-size: 13px;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #64748b;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.time-icon {
  width: 14px;
  height: 14px;
  color: #059669;
}

.empty-state {
  padding: 48px 0;
  color: #94a3b8;
  text-align: center;
}
</style>