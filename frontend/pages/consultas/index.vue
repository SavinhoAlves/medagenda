<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Consultas' })

const consultas = ref([])
const carregando = ref(true)
const { listarConsultas } = useConsultas()
const toast = useToast()

// --- Modal detalhes ---
const exibirModalDetalhes = ref(false)
const consultaSelecionada = ref(null)

function abrirDetalhes(consulta) {
  consultaSelecionada.value = consulta
  exibirModalDetalhes.value = true
}
function fecharDetalhes() { exibirModalDetalhes.value = false }

// --- Cancelar ---
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
        <h1>Consultas</h1>
        <p>Histórico e agenda de atendimentos</p>
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
      <div class="modal-container">
        <div class="modal-header">
          <h2>Detalhes da Consulta #{{ consultaSelecionada?.id }}</h2>
          <button class="btn-fechar-modal" @click="fecharDetalhes">&times;</button>
        </div>
        <div class="modal-body" v-if="consultaSelecionada">
          <div class="detalhe-grid">
            <div class="detalhe-item">
              <span class="detalhe-label">Paciente</span>
              <strong class="detalhe-valor">{{ consultaSelecionada.paciente?.nome || '—' }}</strong>
            </div>
            <div class="detalhe-item">
              <span class="detalhe-label">Profissional</span>
              <strong class="detalhe-valor">{{ consultaSelecionada.profissional?.nome || '—' }}</strong>
            </div>
            <div class="detalhe-item">
              <span class="detalhe-label">Especialidade</span>
              <strong class="detalhe-valor highlight">{{ consultaSelecionada.profissional?.especialidade?.nome || '—' }}</strong>
            </div>
            <div class="detalhe-item">
              <span class="detalhe-label">Data e Hora</span>
              <strong class="detalhe-valor">{{ formatarData(consultaSelecionada.dataInicio || consultaSelecionada.dataConsulta) }}</strong>
            </div>
            <div class="detalhe-item">
              <span class="detalhe-label">Status</span>
              <span class="badge-status" :class="consultaSelecionada.status?.toLowerCase()">{{ consultaSelecionada.status || 'AGENDADA' }}</span>
            </div>
            <div v-if="consultaSelecionada.valor" class="detalhe-item">
              <span class="detalhe-label">Valor</span>
              <strong class="detalhe-valor">R$ {{ consultaSelecionada.valor }}</strong>
            </div>
            <div v-if="consultaSelecionada.observacoes" class="detalhe-item span-2">
              <span class="detalhe-label">Observações</span>
              <strong class="detalhe-valor">{{ consultaSelecionada.observacoes }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar-modal" @click="fecharDetalhes">Fechar</button>
            <NuxtLink :to="`/consultas/${consultaSelecionada.id}`" class="btn-ver-pagina" @click="fecharDetalhes">
              Abrir página completa
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
.btn-detalhe { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #cbd5e1; color: #475569; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-detalhe:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }
.btn-cancelar-consulta { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #fca5a5; color: #dc2626; padding: 7px 13px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
.btn-cancelar-consulta:hover { background: #fef2f2; border-color: #f87171; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-container { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-container.modal-sm { max-width: 420px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar-modal { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; line-height: 1; }
.btn-fechar-modal:hover { color: #475569; }
.modal-body { padding: 24px; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }

.detalhe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.detalhe-item { display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
.detalhe-item.span-2 { grid-column: span 2; }
.detalhe-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
.detalhe-valor { font-size: 14px; font-weight: 600; color: #0f172a; }
.detalhe-valor.highlight { color: #059669; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar-modal { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
.btn-cancelar-modal:hover { background: #e2e8f0; }
.btn-cancelar-modal:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ver-pagina { background: #059669; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; text-decoration: none; display: flex; align-items: center; transition: background 0.2s; }
.btn-ver-pagina:hover { background: #047857; }
.btn-confirmar-cancelar { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-confirmar-cancelar:hover { background: #b91c1c; }
.btn-confirmar-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }

.excluir-content { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0 24px; gap: 12px; }
.excluir-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; }
.excluir-icon svg { width: 26px; height: 26px; }
.excluir-texto { font-size: 15px; color: #1e293b; line-height: 1.5; margin: 0; }
.excluir-aviso { font-size: 13px; color: #94a3b8; margin: 0; }
</style>
