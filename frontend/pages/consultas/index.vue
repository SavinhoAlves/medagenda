<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'medico']
})

useHead({ title: 'Minhas Consultas' })

const consultas = ref([])
const carregando = ref(true)
const { listarConsultas } = useConsultas()
const toast    = useToast()
const authStore = useAuthStore()
const cargo     = computed(() => authStore.usuario?.cargo)

// --- Modal detalhes ---
const exibirModalDetalhes = ref(false)
const consultaSelecionada = ref(null)

function abrirDetalhes(consulta) {
  consultaSelecionada.value = consulta
  exibirModalDetalhes.value = true
}
function fecharDetalhes() { exibirModalDetalhes.value = false }

// --- Cancelar ---
const router = useRouter()
const iniciando = ref(null)

async function iniciarAtendimento(consulta) {
  try {
    iniciando.value = consulta.id
    await api.patch(`/consultas/${consulta.id}/status`, { status: 'EM_ANDAMENTO' })
    await router.push(`/consultas/${consulta.id}/atendimento`)
  } catch {
    toast.erro('Erro ao iniciar atendimento.')
    iniciando.value = null
  }
}

const cancelando = ref(false)
const { confirmar } = useConfirm()

async function cancelar(consulta) {
  const ok = await confirmar({
    titulo: 'Cancelar Consulta',
    mensagem: 'Confirma o cancelamento da consulta de',
    nome: consulta.paciente?.nome,
    aviso: 'Esta ação não pode ser desfeita.',
    textoBotao: 'Sim, cancelar',
    variante: 'warning',
  })
  if (!ok) return
  try {
    cancelando.value = true
    await api.patch(`/consultas/${consulta.id}/status`, { status: 'CANCELADA' })
    await carregar()
  } catch {
    toast.erro('Erro ao cancelar consulta.')
  } finally {
    cancelando.value = false
  }
}

const statusLabels = {
  AGENDADA:     'Agendada',
  CONFIRMADA:   'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADA:   'Finalizada',
  CANCELADA:    'Cancelada',
  FALTOU:       'Faltou',
}

function podeIniciar(consulta) {
  if (consulta.status !== 'AGENDADA' && consulta.status !== 'CONFIRMADA') return false
  if (!consulta.dataInicio) return false
  // Admin e médico podem iniciar a qualquer hora
  if (cargo.value === 'admin' || cargo.value === 'medico') return true
  // Demais perfis: janela de 30 min antes até 4h depois
  const agora  = Date.now()
  const inicio = new Date(consulta.dataInicio).getTime()
  return agora >= inicio - 30 * 60 * 1000 && agora <= inicio + 4 * 60 * 60 * 1000
}

function tempoParaIniciar(consulta) {
  if (!consulta.dataInicio) return null
  const inicio = new Date(consulta.dataInicio).getTime()
  const diff   = inicio - Date.now() - 30 * 60 * 1000
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `em ${h}h${m > 0 ? ` ${m}min` : ''}` : `em ${m}min`
}

function formatarData(valor) {
  if (!valor) return '—'
  const d = new Date(String(valor).replace(' ', 'T'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

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
        <h1>Minhas Consultas</h1>
        <p>Histórico e gerenciamento dos seus atendimentos</p>
      </div>
      <NuxtLink to="/agenda" class="new-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Consulta
      </NuxtLink>
    </div>

    <div v-if="carregando" class="state-card">
      <div class="spinner"></div>
      <p>Carregando consultas...</p>
    </div>

    <div v-else-if="consultas.length === 0" class="state-card">
      <p>Nenhuma consulta encontrada.</p>
    </div>

    <div v-else class="table-card">
      <table class="clinical-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Profissional</th>
            <th>Data</th>
            <th>Status</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="consulta in consultas" :key="consulta.id">
            <td>
              <div class="profile-cell">
                <div class="avatar">{{ (consulta.paciente?.nome || 'P').charAt(0).toUpperCase() }}</div>
                <span class="nome-forte">{{ consulta.paciente?.nome || '—' }}</span>
              </div>
            </td>
            <td class="text-muted">{{ consulta.profissional?.nome || '—' }}</td>
            <td class="text-muted">{{ formatarData(consulta.dataInicio || consulta.dataConsulta) }}</td>
            <td>
              <span class="badge-status" :class="consulta.status?.toLowerCase()">
                {{ consulta.status || 'Agendada' }}
              </span>
            </td>
            <td class="text-right">
              <div class="acoes">
                <!-- Iniciar: só aparece na janela de horário permitida -->
                <button
                  v-if="podeIniciar(consulta)"
                  class="btn-iniciar"
                  :disabled="iniciando === consulta.id"
                  @click="iniciarAtendimento(consulta)"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                  </svg>
                  {{ iniciando === consulta.id ? 'Iniciando...' : 'Iniciar' }}
                </button>

                <!-- Agendada/Confirmada fora da janela: mostra quando libera -->
                <span
                  v-else-if="(consulta.status === 'AGENDADA' || consulta.status === 'CONFIRMADA') && tempoParaIniciar(consulta)"
                  class="badge-horario"
                  :title="`Disponível a partir de 30 min antes do horário marcado`"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ tempoParaIniciar(consulta) }}
                </span>

                <!-- Em andamento: botão continuar -->
                <NuxtLink
                  v-else-if="consulta.status === 'EM_ANDAMENTO'"
                  :to="`/consultas/${consulta.id}/atendimento`"
                  class="btn-continuar"
                >
                  Continuar
                </NuxtLink>
                <button class="btn-detalhe" @click="abrirDetalhes(consulta)">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Detalhes
                </button>
                <button
                  v-if="consulta.status !== 'CANCELADA' && consulta.status !== 'FINALIZADA'"
                  class="btn-cancelar-consulta"
                  @click="cancelar(consulta)"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/>
                  </svg>
                  Cancelar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Detalhes da consulta -->
    <div v-if="exibirModalDetalhes" class="modal-overlay" @click.self="fecharDetalhes">
      <div class="modal-container modal-detalhes" v-if="consultaSelecionada">

        <!-- Cabeçalho com perfil -->
        <div class="md-header">
          <div class="md-avatar">{{ (consultaSelecionada.paciente?.nome || 'P').charAt(0).toUpperCase() }}</div>
          <div class="md-header-info">
            <h2 class="md-nome">{{ consultaSelecionada.paciente?.nome || '—' }}</h2>
            <div class="md-sub">
              <span class="badge-status" :class="consultaSelecionada.status?.toLowerCase()">
                {{ statusLabels[consultaSelecionada.status] || consultaSelecionada.status }}
              </span>
              <span class="md-id">#{{ consultaSelecionada.id }}</span>
            </div>
          </div>
          <button class="md-fechar" @click="fecharDetalhes" title="Fechar">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Corpo -->
        <div class="md-body">

          <!-- Bloco: Consulta -->
          <p class="md-section-label">Agendamento</p>
          <div class="md-grid">
            <div class="md-field">
              <span class="md-label">Data e Hora</span>
              <strong class="md-valor">{{ formatarData(consultaSelecionada.dataInicio || consultaSelecionada.dataConsulta) }}</strong>
            </div>
            <div class="md-field" v-if="consultaSelecionada.valor">
              <span class="md-label">Valor</span>
              <strong class="md-valor">R$ {{ Number(consultaSelecionada.valor).toFixed(2) }}</strong>
            </div>
            <div class="md-field" v-if="consultaSelecionada.sala">
              <span class="md-label">Sala</span>
              <strong class="md-valor">{{ consultaSelecionada.sala }}</strong>
            </div>
          </div>

          <!-- Bloco: Profissional -->
          <p class="md-section-label">Profissional</p>
          <div class="md-prof-card">
            <div class="md-prof-avatar">{{ (consultaSelecionada.profissional?.nome || 'P').charAt(0).toUpperCase() }}</div>
            <div>
              <p class="md-prof-nome">{{ consultaSelecionada.profissional?.nome || '—' }}</p>
              <p class="md-prof-esp">{{ consultaSelecionada.profissional?.especialidade?.nome || 'Sem especialidade' }}</p>
            </div>
          </div>

          <!-- Bloco: Observações -->
          <template v-if="consultaSelecionada.observacoes">
            <p class="md-section-label">Observações</p>
            <p class="md-obs">{{ consultaSelecionada.observacoes }}</p>
          </template>

          <!-- Aviso de horário quando não pode iniciar ainda -->
          <div
            v-if="(consultaSelecionada.status === 'AGENDADA' || consultaSelecionada.status === 'CONFIRMADA') && tempoParaIniciar(consultaSelecionada)"
            class="md-aviso"
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            O atendimento estará disponível {{ tempoParaIniciar(consultaSelecionada) }} (30 min antes do horário)
          </div>

        </div>

        <!-- Rodapé -->
        <div class="md-footer">
          <button class="md-btn-fechar" @click="fecharDetalhes">Fechar</button>
          <div class="md-footer-right">
            <button
              v-if="podeIniciar(consultaSelecionada)"
              class="md-btn-iniciar"
              :disabled="iniciando === consultaSelecionada.id"
              @click="iniciarAtendimento(consultaSelecionada)"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
              {{ iniciando === consultaSelecionada.id ? 'Iniciando...' : 'Iniciar Atendimento' }}
            </button>
            <NuxtLink
              v-else-if="consultaSelecionada.status === 'EM_ANDAMENTO'"
              :to="`/consultas/${consultaSelecionada.id}/atendimento`"
              class="md-btn-continuar"
              @click="fecharDetalhes"
            >
              Continuar Atendimento
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>


  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; box-sizing: border-box; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 28px; color: #0f172a; margin: 0 0 4px; letter-spacing: -0.5px; }
.page-header p { color: #64748b; margin: 0; font-size: 14px; }

.new-button { background: #059669; color: #fff; border: none; padding: 12px 20px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(5,150,105,.15); transition: all 0.2s ease; }
.new-button:hover { background: #047857; transform: translateY(-1px); }

.table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,.02); }
.clinical-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
.clinical-table th { background: #f8fafc; padding: 14px 24px; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0; }
.clinical-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
.clinical-table tr:last-child td { border-bottom: none; }
.clinical-table tr:hover td { background: #fdfdfd; }

.profile-cell { display: flex; align-items: center; gap: 12px; }
.avatar { width: 34px; height: 34px; border-radius: 10px; background: rgba(5,150,105,.08); color: #059669; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.nome-forte { font-weight: 600; color: #0f172a; }
.text-muted { color: #64748b; }
.text-right { text-align: right; }

.badge-status { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: rgba(5,150,105,.08); color: #059669; }
.badge-status.cancelada { background: rgba(239,68,68,.08); color: #dc2626; }
.badge-status.finalizada { background: rgba(139,92,246,.08); color: #7c3aed; }
.badge-status.em_andamento { background: rgba(245,158,11,.08); color: #d97706; }

.state-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.spinner { width: 26px; height: 26px; border: 3px solid rgba(5,150,105,.1); border-radius: 50%; border-top-color: #059669; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.acoes { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.btn-iniciar { display: flex; align-items: center; gap: 6px; background: #059669; border: none; color: #fff; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; box-shadow: 0 2px 8px rgba(5,150,105,.2); }
.btn-iniciar:hover:not(:disabled) { background: #047857; box-shadow: 0 4px 12px rgba(5,150,105,.3); }
.btn-iniciar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-continuar { display: flex; align-items: center; gap: 6px; background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.3); color: #d97706; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; text-decoration: none; }
.btn-continuar:hover { background: rgba(245,158,11,.15); border-color: rgba(245,158,11,.5); }
.btn-detalhe { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-detalhe:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }
.btn-cancelar-consulta { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-cancelar-consulta:hover { background: #fef2f2; border-color: #f87171; }

.badge-horario { display: inline-flex; align-items: center; gap: 5px; background: #fefce8; border: 1px solid #fde68a; color: #92400e; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: default; }

/* ── Modal overlay ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 999; padding: 16px; }

.modal-container { background: #fff; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 24px 48px -8px rgba(0,0,0,.18); overflow: hidden; animation: aparecer .2s ease-out; }

@keyframes aparecer { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* ── Modal Detalhes ── */
.md-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
}

.md-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 20px;
  flex-shrink: 0;
}

.md-header-info { flex: 1; min-width: 0; }

.md-nome {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.md-sub { display: flex; align-items: center; gap: 8px; }

.md-id { font-size: 12px; color: #94a3b8; font-family: monospace; }

.md-fechar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(0,0,0,.05);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all .13s;
}
.md-fechar:hover { background: #fee2e2; color: #dc2626; }

.md-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }

.md-section-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: #94a3b8;
  margin: 0;
}

.md-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }

.md-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 11px 13px;
}

.md-label { font-size: 10.5px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }

.md-valor { font-size: 13.5px; font-weight: 700; color: #0f172a; margin: 0; }

.md-prof-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.md-prof-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(5,150,105,.1);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.md-prof-nome { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
.md-prof-esp  { font-size: 12px; color: #059669; font-weight: 500; margin: 0; }

.md-obs {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}

.md-aviso {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: #92400e;
}

.md-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.md-footer-right { display: flex; gap: 8px; align-items: center; }

.md-btn-fechar {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all .13s;
}
.md-btn-fechar:hover { background: #f1f5f9; }

.md-btn-iniciar {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #059669;
  border: none;
  color: #fff;
  padding: 9px 20px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5,150,105,.28);
  transition: all .15s;
}
.md-btn-iniciar:hover:not(:disabled) { background: #047857; box-shadow: 0 6px 18px rgba(5,150,105,.35); transform: translateY(-1px); }
.md-btn-iniciar:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; transform: none; }

.md-btn-continuar {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(245,158,11,.1);
  border: 1px solid rgba(245,158,11,.4);
  color: #d97706;
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
  cursor: pointer;
  transition: all .13s;
}
.md-btn-continuar:hover { background: rgba(245,158,11,.18); }
</style>
