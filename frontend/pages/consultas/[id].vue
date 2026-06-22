<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'medico']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { confirmar } = useConfirm()

const consulta = ref(null)
const carregando = ref(true)
const atualizando = ref(false)

useHead(computed(() => ({ title: consulta.value ? `Atendimento #${consulta.value.id}` : 'Atendimento' })))

const statusAtivo = computed(() => consulta.value?.status)
const podeIniciar = computed(() => ['AGENDADA', 'CONFIRMADA'].includes(statusAtivo.value))
const podeFinalizarOuCancelar = computed(() => statusAtivo.value === 'EM_ANDAMENTO')
const encerrado = computed(() => ['FINALIZADA', 'CANCELADA'].includes(statusAtivo.value))

function formatarData(valor) {
  if (!valor) return '—'
  const d = new Date(String(valor).replace(' ', 'T'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function carregar() {
  try {
    const { data } = await api.get(`/consultas/${route.params.id}`)
    consulta.value = data
  } catch {
    toast.erro('Consulta não encontrada.')
    await router.push('/consultas')
  } finally {
    carregando.value = false
  }
}

async function alterarStatus(novoStatus) {
  try {
    atualizando.value = true
    const { data } = await api.patch(`/consultas/${consulta.value.id}/status`, { status: novoStatus })
    consulta.value = { ...consulta.value, status: data.status }
  } catch {
    toast.erro('Erro ao atualizar status.')
  } finally {
    atualizando.value = false
  }
}

async function iniciarAtendimento() {
  await alterarStatus('EM_ANDAMENTO')
  if (consulta.value?.status === 'EM_ANDAMENTO') {
    toast.sucesso('Atendimento iniciado.')
  }
}

async function finalizarAtendimento() {
  const ok = await confirmar({
    titulo: 'Finalizar Atendimento',
    mensagem: 'Confirma a finalização do atendimento de',
    nome: consulta.value?.paciente?.nome,
    textoBotao: 'Finalizar',
    variante: 'success',
  })
  if (!ok) return
  await alterarStatus('FINALIZADA')
  if (consulta.value?.status === 'FINALIZADA') {
    toast.sucesso('Atendimento finalizado com sucesso.')
  }
}

async function cancelarConsulta() {
  const ok = await confirmar({
    titulo: 'Cancelar Consulta',
    mensagem: 'Confirma o cancelamento da consulta de',
    nome: consulta.value?.paciente?.nome,
    aviso: 'Esta ação não pode ser desfeita.',
    textoBotao: 'Sim, cancelar',
    variante: 'warning',
  })
  if (!ok) return
  await alterarStatus('CANCELADA')
  if (consulta.value?.status === 'CANCELADA') {
    toast.sucesso('Consulta cancelada.')
  }
}

onMounted(carregar)
</script>

<template>
  <div class="page-wrapper">

    <!-- Skeleton -->
    <div v-if="carregando" class="state-card">
      <div class="spinner"></div>
      <p>Carregando atendimento...</p>
    </div>

    <template v-else-if="consulta">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <NuxtLink to="/consultas" class="btn-voltar">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Voltar
          </NuxtLink>
          <div>
            <h1>Atendimento <span class="id-badge">#{{ consulta.id }}</span></h1>
            <p>{{ consulta.paciente?.nome }}</p>
          </div>
        </div>
        <div class="header-right">
          <span class="badge-status" :class="consulta.status?.toLowerCase()">
            {{ consulta.status || 'AGENDADA' }}
          </span>
        </div>
      </div>

      <!-- Alerta de status -->
      <div v-if="statusAtivo === 'EM_ANDAMENTO'" class="alert-andamento">
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
        </svg>
        Atendimento em andamento — finalize ao concluir a consulta.
      </div>
      <div v-else-if="statusAtivo === 'FINALIZADA'" class="alert-finalizada">
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Consulta finalizada com sucesso.
      </div>
      <div v-else-if="statusAtivo === 'CANCELADA'" class="alert-cancelada">
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>
          <path d="m15 9-6 6m0-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Esta consulta foi cancelada.
      </div>

      <!-- Informações do paciente e consulta -->
      <div class="info-grid">
        <div class="info-card patient-card">
          <div class="patient-avatar">{{ (consulta.paciente?.nome || 'P').charAt(0).toUpperCase() }}</div>
          <div class="patient-data">
            <span class="info-label">Paciente</span>
            <strong class="info-value">{{ consulta.paciente?.nome || '—' }}</strong>
          </div>
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

        <div v-if="consulta.sala" class="info-card">
          <span class="info-label">Sala</span>
          <strong class="info-value">{{ consulta.sala }}</strong>
        </div>

        <div v-if="consulta.valor" class="info-card">
          <span class="info-label">Valor</span>
          <strong class="info-value">R$ {{ consulta.valor }}</strong>
        </div>

        <div v-if="consulta.observacoes" class="info-card span-2">
          <span class="info-label">Observações</span>
          <p class="info-obs">{{ consulta.observacoes }}</p>
        </div>
      </div>

      <!-- Ações do atendimento -->
      <div class="acoes-card" v-if="!encerrado">
        <div class="acoes-info">
          <strong v-if="podeIniciar">Pronto para iniciar?</strong>
          <strong v-else-if="podeFinalizarOuCancelar">Concluir atendimento</strong>
          <span v-if="podeIniciar">Confirme para marcar esta consulta como em andamento.</span>
          <span v-else-if="podeFinalizarOuCancelar">Finalize a consulta ou registre um cancelamento.</span>
        </div>
        <div class="acoes-btns">
          <button
            v-if="podeIniciar"
            class="btn-acao btn-iniciar"
            :disabled="atualizando"
            @click="iniciarAtendimento"
          >
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
            {{ atualizando ? 'Iniciando...' : 'Iniciar Atendimento' }}
          </button>

          <template v-if="podeFinalizarOuCancelar">
            <button
              class="btn-acao btn-cancelar"
              :disabled="atualizando"
              @click="cancelarConsulta"
            >
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="m15 9-6 6m0-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Cancelar Consulta
            </button>
            <button
              class="btn-acao btn-finalizar"
              :disabled="atualizando"
              @click="finalizarAtendimento"
            >
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ atualizando ? 'Finalizando...' : 'Finalizar Atendimento' }}
            </button>
          </template>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper {
  padding: 40px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ── */
.page-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
.header-left { display: flex; align-items: center; gap: 20px; }
.header-right { display: flex; align-items: center; gap: 12px; }

.btn-voltar { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 16px; font-size: 14px; font-weight: 500; color: #475569; text-decoration: none; transition: all 0.2s ease; flex-shrink: 0; }
.btn-voltar:hover { background: #f1f5f9; border-color: #cbd5e1; }

.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 3px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
.id-badge { font-size: 15px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 10px; border-radius: 6px; }
.page-header p { color: #64748b; font-size: 14px; margin: 0; }

.badge-status { font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 8px; background: rgba(5,150,105,.08); color: #059669; letter-spacing: 0.3px; }
.badge-status.cancelada { background: rgba(239,68,68,.08); color: #dc2626; }
.badge-status.finalizada { background: rgba(139,92,246,.08); color: #7c3aed; }
.badge-status.em_andamento { background: rgba(245,158,11,.1); color: #d97706; }
.badge-status.agendada { background: rgba(5,150,105,.08); color: #059669; }
.badge-status.confirmada { background: rgba(59,130,246,.08); color: #3b82f6; }

/* ── Alertas ── */
.alert-andamento, .alert-finalizada, .alert-cancelada {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: 12px;
  font-size: 14px; font-weight: 600;
}
.alert-andamento  { background: rgba(245,158,11,.08); color: #d97706; border: 1px solid rgba(245,158,11,.2); }
.alert-finalizada { background: rgba(5,150,105,.07); color: #059669; border: 1px solid rgba(5,150,105,.15); }
.alert-cancelada  { background: rgba(239,68,68,.07); color: #dc2626; border: 1px solid rgba(239,68,68,.15); }

/* ── Info grid ── */
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.info-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 8px;
}
.info-card.span-2 { grid-column: span 2; }
.info-card.patient-card { flex-direction: row; align-items: center; gap: 16px; }

.patient-avatar {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, #059669, #047857);
  color: white; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.patient-data { display: flex; flex-direction: column; gap: 4px; }

.info-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
.info-value { font-size: 15px; font-weight: 600; color: #0f172a; }
.info-value.highlight { color: #059669; }
.info-obs { font-size: 14px; color: #475569; margin: 0; line-height: 1.6; }

/* ── Card de ações ── */
.acoes-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 24px 28px; box-shadow: 0 1px 3px rgba(0,0,0,.02);
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}

.acoes-info { display: flex; flex-direction: column; gap: 4px; }
.acoes-info strong { font-size: 15px; font-weight: 700; color: #0f172a; }
.acoes-info span   { font-size: 13px; color: #64748b; }

.acoes-btns { display: flex; gap: 10px; flex-shrink: 0; }

.btn-acao {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 10px;
  font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s;
}
.btn-acao:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-iniciar  { background: #059669; color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,.2); }
.btn-iniciar:hover:not(:disabled)  { background: #047857; box-shadow: 0 6px 16px rgba(5,150,105,.3); transform: translateY(-1px); }

.btn-finalizar { background: #7c3aed; color: #fff; box-shadow: 0 4px 12px rgba(124,58,237,.15); }
.btn-finalizar:hover:not(:disabled) { background: #6d28d9; box-shadow: 0 6px 16px rgba(124,58,237,.25); transform: translateY(-1px); }

.btn-cancelar { background: #fff; color: #dc2626; border: 1.5px solid #fca5a5; }
.btn-cancelar:hover:not(:disabled) { background: #fef2f2; border-color: #f87171; }

/* ── Estado de carregamento ── */
.state-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.spinner { width: 26px; height: 26px; border: 3px solid rgba(5,150,105,.1); border-radius: 50%; border-top-color: #059669; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-wrapper { padding: 24px 20px; }
  .info-grid { grid-template-columns: 1fr; }
  .info-card.span-2 { grid-column: span 1; }
  .acoes-card { flex-direction: column; align-items: flex-start; }
  .acoes-btns { flex-wrap: wrap; width: 100%; }
  .btn-acao { flex: 1; justify-content: center; }
}
</style>
