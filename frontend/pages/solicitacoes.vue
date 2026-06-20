<template>
  <div class="page-solicitacoes">
    <div class="page-header">
      <div>
        <h1 class="page-title">Solicitações de Exclusão</h1>
        <p class="page-subtitle">Pedidos de exclusão de consultas enviados pelos operadores</p>
      </div>
      <div class="header-direita">
        <div class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: filtroAtual === tab.value }"
            @click="trocarFiltro(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <button class="btn-notificar" @click="modalNotif = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="btn-notif-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          Notificar operadores
        </button>
      </div>
    </div>

    <!-- Modal: enviar notificação aos operadores -->
    <Transition name="modal-fade">
      <div v-if="modalNotif" class="modal-overlay" @click.self="fecharModalNotif">
        <div class="modal-notif">
          <div class="modal-notif-header">
            <h2>Enviar notificação</h2>
            <button class="btn-fechar-modal" @click="fecharModalNotif">✕</button>
          </div>
          <div class="modal-notif-body">
            <p class="modal-notif-desc">A notificação será enviada para todos os operadores cadastrados.</p>
            <div class="field-group">
              <label>Título <span class="req">*</span></label>
              <input v-model="notifForm.titulo" type="text" placeholder="Ex: Aviso importante" maxlength="100" />
            </div>
            <div class="field-group">
              <label>Mensagem <span class="req">*</span></label>
              <textarea v-model="notifForm.mensagem" rows="4" placeholder="Digite a mensagem para os operadores..." maxlength="500"></textarea>
            </div>
          </div>
          <div class="modal-notif-footer">
            <button class="btn-cancelar" @click="fecharModalNotif" :disabled="enviando">Cancelar</button>
            <button class="btn-enviar" @click="enviarNotificacao" :disabled="enviando || !notifForm.titulo.trim() || !notifForm.mensagem.trim()">
              {{ enviando ? 'Enviando...' : 'Enviar notificação' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="carregando" class="estado-vazio">
      <div class="spinner"></div>
      <p>Carregando solicitações...</p>
    </div>

    <div v-else-if="solicitacoes.length === 0" class="estado-vazio">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p>Nenhuma solicitação {{ filtroAtual === 'PENDENTE' ? 'pendente' : filtroAtual === 'APROVADO' ? 'aprovada' : 'rejeitada' }}</p>
    </div>

    <div v-else class="solicitacoes-lista">
      <div v-for="s in solicitacoes" :key="s.id" class="solicitacao-card">
        <div class="card-lado-esq">
          <div class="card-status" :class="statusClass(s.status)">{{ statusLabel(s.status) }}</div>
          <div class="card-data">{{ formatarDataCurta(s.criadoEm) }}</div>
        </div>

        <div class="card-conteudo">
          <div class="card-linha-principal">
            <span class="card-paciente">{{ s.consulta?.paciente?.nome || '—' }}</span>
            <span class="card-sep">·</span>
            <span class="card-profissional">{{ s.consulta?.profissional?.nome || '—' }}</span>
          </div>
          <div class="card-consulta-data">
            Consulta: {{ formatarDataHora(s.consulta?.dataInicio) }} — {{ formatarDataHora(s.consulta?.dataFim) }}
          </div>
          <div class="card-motivo">
            <span class="motivo-label">Motivo:</span> {{ s.motivo }}
          </div>
          <div class="card-solicitante">
            Solicitado por <strong>{{ s.solicitante?.nome }}</strong> ({{ s.solicitante?.email }})
          </div>
        </div>

        <div v-if="s.status === 'PENDENTE'" class="card-acoes">
          <button
            class="btn-rejeitar"
            :disabled="processando === s.id"
            @click="rejeitar(s.id)"
          >
            Rejeitar
          </button>
          <button
            class="btn-aprovar"
            :disabled="processando === s.id"
            @click="aprovar(s.id)"
          >
            {{ processando === s.id ? 'Processando...' : 'Aprovar exclusão' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
const toast = useToast()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useHead({ title: 'Solicitações de Exclusão' })

const tabs = [
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Aprovadas', value: 'APROVADO' },
  { label: 'Rejeitadas', value: 'REJEITADO' },
]

const solicitacoes = ref([])
const carregando = ref(true)
const filtroAtual = ref('PENDENTE')
const processando = ref(null)

const { confirmar } = useConfirm()

const modalNotif = ref(false)
const enviando = ref(false)
const notifForm = ref({ titulo: '', mensagem: '' })

function fecharModalNotif() {
  modalNotif.value = false
  notifForm.value = { titulo: '', mensagem: '' }
}

async function enviarNotificacao() {
  enviando.value = true
  try {
    const { data } = await api.post('/notificacoes/enviar-operadores', notifForm.value)
    toast.sucesso(`Notificação enviada para ${data.enviados} operador(es).`)
    fecharModalNotif()
  } catch (err) {
    toast.erro(err.response?.data?.error || 'Erro ao enviar notificação.')
  } finally {
    enviando.value = false
  }
}

async function carregar() {
  carregando.value = true
  try {
    const { data } = await api.get(`/solicitacoes-exclusao?status=${filtroAtual.value}`)
    solicitacoes.value = data
  } catch {
    solicitacoes.value = []
  } finally {
    carregando.value = false
  }
}

async function trocarFiltro(valor) {
  filtroAtual.value = valor
  await carregar()
}

async function aprovar(id) {
  const ok = await confirmar({
    titulo: 'Aprovar Exclusão',
    mensagem: 'Confirma a aprovação desta solicitação? A consulta será excluída permanentemente.',
    aviso: 'Esta ação não pode ser desfeita.',
    textoBotao: 'Sim, aprovar',
    variante: 'warning',
  })
  if (!ok) return
  processando.value = id
  try {
    await api.patch(`/solicitacoes-exclusao/${id}/aprovar`)
    solicitacoes.value = solicitacoes.value.filter(s => s.id !== id)
  } catch {
    toast.erro('Erro ao aprovar solicitação.')
  } finally {
    processando.value = null
  }
}

async function rejeitar(id) {
  processando.value = id
  try {
    await api.patch(`/solicitacoes-exclusao/${id}/rejeitar`)
    solicitacoes.value = solicitacoes.value.filter(s => s.id !== id)
  } catch {
    toast.erro('Erro ao rejeitar solicitação.')
  } finally {
    processando.value = null
  }
}

function formatarDataHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso.replace(' ', 'T'))
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatarDataCurta(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusLabel(status) {
  return { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado' }[status] || status
}

function statusClass(status) {
  return { PENDENTE: 'status-pendente', APROVADO: 'status-aprovado', REJEITADO: 'status-rejeitado' }[status] || ''
}

onMounted(carregar)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

.page-solicitacoes {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: 'Inter', sans-serif;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}

.header-direita {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  padding: 8px 18px;
  border: none;
  background: none;
  border-radius: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.estado-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: #94a3b8;
  gap: 16px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.solicitacoes-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.solicitacao-card {
  display: flex;
  gap: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s ease;
}

.solicitacao-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.card-lado-esq {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.card-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 3px 9px;
  border-radius: 99px;
  white-space: nowrap;
}

.status-pendente {
  background: #fef9c3;
  color: #854d0e;
}

.status-aprovado {
  background: #dcfce7;
  color: #14532d;
}

.status-rejeitado {
  background: #fee2e2;
  color: #7f1d1d;
}

.card-data {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

.card-conteudo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-linha-principal {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-paciente {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.card-sep {
  color: #cbd5e1;
}

.card-profissional {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.card-consulta-data {
  font-size: 13px;
  color: #64748b;
}

.card-motivo {
  font-size: 13.5px;
  color: #334155;
  background: #f8fafc;
  border-left: 3px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 0 6px 6px 0;
  margin-top: 2px;
}

.motivo-label {
  font-weight: 600;
  color: #64748b;
}

.card-solicitante {
  font-size: 12px;
  color: #94a3b8;
}

.card-acoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  min-width: 140px;
}

.btn-aprovar,
.btn-rejeitar {
  padding: 10px 16px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-aprovar {
  background: #059669;
  color: #ffffff;
}

.btn-aprovar:hover:not(:disabled) {
  background: #047857;
}

.btn-aprovar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-rejeitar {
  background: none;
  color: #ef4444;
  border: 1px solid #fca5a5;
}

.btn-rejeitar:hover:not(:disabled) {
  background: #fef2f2;
}

.btn-rejeitar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Botão notificar ── */
.btn-notificar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;
}
.btn-notificar:hover { background: #1e293b; }
.btn-notif-icon { width: 16px; height: 16px; }

/* ── Modal notificação ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 24px;
}

.modal-notif {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.modal-notif-header h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-fechar-modal {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: color 0.15s;
}
.btn-fechar-modal:hover { color: #475569; }

.modal-notif-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-notif-desc {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.req { color: #ef4444; }
.field-group input,
.field-group textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #334155;
  background: #f8fafc;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-group input:focus,
.field-group textarea:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  background: #ffffff;
}

.modal-notif-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancelar {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancelar:hover:not(:disabled) { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-enviar {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-enviar:hover:not(:disabled) { background: #047857; }
.btn-enviar:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Transição modal ── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
