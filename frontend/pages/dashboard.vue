<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { buscarDashboard } from '../services/dashboardService'
import { CalendarDays, Plus, Users, ArrowRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Dashboard' })

const authStore = useAuthStore()
const carregando = ref(true)
const dados = ref({
  pacientes: 0,
  profissionais: 0,
  consultas: 0,
  consultasHoje: 0,
  ultimasConsultas: []
})

const primeiroNome = computed(() => {
  const nome = authStore.usuario?.nome || ''
  return nome.split(' ')[0] || 'Usuário'
})

const saudacao = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dataAtual = computed(() =>
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
)

function formatarDataHora(dataString) {
  if (!dataString) return ''
  const data = new Date(dataString.replace(' ', 'T'))
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' às '
    + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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

onMounted(carregarDashboard)

const stats = computed(() => [
  {
    id: 'pacientes',
    label: 'Pacientes',
    value: dados.value.pacientes,
    sublabel: 'cadastrados',
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 21c0-3.866 2.686-7 6-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="17" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/>
      <path d="M21 21c0-3.866-2.686-7-6-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    color: '#10b981',
    bg: 'rgba(16,185,129,.1)',
    rota: '/pacientes',
  },
  {
    id: 'profissionais',
    label: 'Profissionais',
    value: dados.value.profissionais,
    sublabel: 'ativos',
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7 19c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    color: '#818cf8',
    bg: 'rgba(129,140,248,.1)',
    rota: '/profissionais',
  },
  {
    id: 'consultas',
    label: 'Consultas',
    value: dados.value.consultas,
    sublabel: 'no total',
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 14h4M8 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,.1)',
    rota: '/consultas',
  },
  {
    id: 'consultasHoje',
    label: 'Consultas hoje',
    value: dados.value.consultasHoje,
    sublabel: 'agendadas',
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
      <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    color: '#059669',
    bg: 'rgba(5,150,105,.1)',
    rota: '/agenda',
  }
])
</script>

<template>
  <div class="dash-root">
    <div class="dash-main">

      <!-- Saudação -->
      <div class="greeting-row">
        <div class="greeting-left">
          <h1 class="greeting-title">{{ saudacao }}, {{ primeiroNome }}!</h1>
          <p class="greeting-sub">{{ dataAtual }}</p>
        </div>
        <div class="quick-actions">
          <NuxtLink to="/agenda" class="qa-btn qa-secondary">
            <CalendarDays :size="15" />
            Agenda
          </NuxtLink>
          <NuxtLink to="/consultas/novo" class="qa-btn qa-primary">
            <Plus :size="15" />
            Nova consulta
          </NuxtLink>
        </div>
      </div>

      <!-- Cards de estatística -->
      <div class="stats-grid">
        <NuxtLink
          v-for="(stat, i) in stats"
          :key="stat.id"
          :to="stat.rota"
          class="stat-card"
          :style="{ '--card-delay': `${i * 0.08}s` }"
        >
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: stat.bg, color: stat.color }" v-html="stat.icon" />
            <ArrowRight :size="14" class="stat-arrow" />
          </div>
          <div class="stat-value" :style="{ color: stat.color }">
            <span v-if="carregando" class="skeleton-val" />
            <template v-else>{{ stat.value }}</template>
          </div>
          <div class="stat-label-row">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-sub">{{ stat.sublabel }}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-fill" :style="{ background: stat.color }" />
          </div>
        </NuxtLink>
      </div>

      <!-- Atividade recente -->
      <div class="activity-card">
        <div class="activity-header">
          <h2 class="activity-title">Atividade recente</h2>
          <NuxtLink to="/consultas" class="activity-link">
            Ver todas
            <ArrowRight :size="13" />
          </NuxtLink>
        </div>

        <div v-if="carregando" class="activity-loading">
          <div v-for="n in 4" :key="n" class="skeleton-row">
            <div class="sk-dot" />
            <div class="sk-text">
              <div class="sk-line sk-w70" />
              <div class="sk-line sk-w40" />
            </div>
            <div class="sk-badge" />
          </div>
        </div>

        <div v-else-if="dados.ultimasConsultas && dados.ultimasConsultas.length" class="activity-list">
          <div
            v-for="consulta in dados.ultimasConsultas"
            :key="consulta.id"
            class="activity-item"
          >
            <div class="activity-avatar">
              {{ consulta.paciente?.nome?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="activity-content">
              <span class="ac-name">{{ consulta.paciente?.nome || 'Paciente não identificado' }}</span>
              <span class="ac-meta">com {{ consulta.profissional?.nome || 'Profissional' }}</span>
            </div>
            <div v-if="consulta.dataInicio || consulta.data_inicio" class="activity-time">
              {{ formatarDataHora(consulta.dataInicio || consulta.data_inicio) }}
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg viewBox="0 0 48 48" fill="none" class="empty-icon">
            <circle cx="24" cy="24" r="19" stroke="currentColor" stroke-width="1.5"/>
            <path d="M24 16v8l5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Nenhuma atividade registrada</p>
          <NuxtLink to="/consultas/novo" class="qa-btn qa-primary" style="margin-top: 8px;">
            <Plus :size="14" /> Agendar consulta
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

.dash-root {
  font-family: 'Inter', sans-serif;
  width: 100%;
}

.dash-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 40px 64px;
}

/* ── Saudação ── */
.greeting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.greeting-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.greeting-sub {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  text-transform: capitalize;
}

/* ── Botões rápidos ── */
.quick-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.qa-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.qa-primary {
  background: #059669;
  color: #fff;
  box-shadow: 0 4px 12px rgba(5,150,105,.2);
}
.qa-primary:hover { background: #047857; box-shadow: 0 6px 16px rgba(5,150,105,.28); }

.qa-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.qa-secondary:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }

/* ── Grid de estatísticas ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 580px) {
  .stats-grid { grid-template-columns: 1fr; }
  .dash-main { padding: 24px 20px 40px; }
}

/* ── Card de estatística ── */
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,.02);
  animation: fadeUp 0.35s ease both;
  animation-delay: var(--card-delay, 0s);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px -4px rgba(0,0,0,.06);
  border-color: #cbd5e1;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}

.stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon :deep(svg) { width: 21px; height: 21px; }

.stat-arrow {
  color: #cbd5e1;
  margin-top: 2px;
  transition: color 0.15s, transform 0.15s;
}

.stat-card:hover .stat-arrow {
  color: #94a3b8;
  transform: translateX(2px);
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.skeleton-val {
  display: block;
  width: 60px;
  height: 36px;
  background: #e2e8f0;
  border-radius: 8px;
  animation: shimmer 1.2s ease infinite;
}

.stat-label-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.stat-sub {
  font-size: 12px;
  color: #94a3b8;
}

.stat-bar {
  height: 3px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
  margin-top: auto;
}

.stat-bar-fill {
  height: 100%;
  width: 40%;
  border-radius: 99px;
  opacity: 0.6;
}

/* ── Card de atividade ── */
.activity-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 2px 4px rgba(0,0,0,.02);
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.activity-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.activity-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: #059669;
  text-decoration: none;
  transition: gap 0.15s;
}

.activity-link:hover { gap: 7px; }

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: background 0.15s, border-color 0.15s;
}

.activity-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.activity-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(5,150,105,.1);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.ac-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ac-meta {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 5px 10px;
  border-radius: 7px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Skeletons de loading ── */
.activity-loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.sk-dot {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e2e8f0;
  flex-shrink: 0;
  animation: shimmer 1.2s ease infinite;
}

.sk-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-line {
  height: 10px;
  background: #e2e8f0;
  border-radius: 5px;
  animation: shimmer 1.2s ease infinite;
}

.sk-w70 { width: 70%; }
.sk-w40 { width: 40%; }

.sk-badge {
  width: 100px;
  height: 26px;
  background: #e2e8f0;
  border-radius: 7px;
  flex-shrink: 0;
  animation: shimmer 1.2s ease infinite;
}

@keyframes shimmer {
  0%   { opacity: 1; }
  50%  { opacity: 0.5; }
  100% { opacity: 1; }
}

/* ── Estado vazio ── */
.empty-state {
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
}

.empty-state p { margin: 0; font-size: 14px; }
</style>
