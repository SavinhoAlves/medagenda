<script setup>
import { ref, watch, reactive, computed } from 'vue'
import api from '../../services/api'
import { useCurrentUser } from '~/composables/useCurrentUser'

const props = defineProps({
  aberto:    { type: Boolean },
  form:      { type: Object,  default: () => ({}) },
  pacientes: { type: Array,   default: null },
  profissionais: { type: Array, default: null },
  isAdmin:   { type: Boolean, default: false },
})

const emit = defineEmits(['fechar', 'salvar', 'excluido', 'iniciar'])

const router = useRouter()
const { usuario } = useCurrentUser()
const auth = useAuthStore()
const isAdminUser = computed(() => auth.isAdmin)
const isMedico    = computed(() => auth.isMedico)

const listaPacientes    = ref([])
const listaProfissionais = ref([])
const listaConvenios    = ref([])
const conveniosDoPaciente = ref([])
const carregando  = ref(false)
const salvando    = ref(false)
const editando    = ref(false)

const buscaPaciente = ref('')
const pacienteFoco  = ref(false)

const telaExcluir   = ref(false)
const justificativa = ref('')
const excluindo     = ref(false)
const enviando      = ref(false)

const procedimentos = [
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'RETORNO',  label: 'Retorno'  },
  { value: 'EXAME',    label: 'Exame'    },
]

const localForm = reactive({
  id: null, pacienteId: '', profissionalId: '',
  dataInicio: '', dataFim: '', procedimento: 'CONSULTA',
  convenioId: '', sala: '', observacoes: '',
  status: '', valor: '',
})

const modoEdicao = computed(() => !!localForm.id)

const podeIniciarConsulta = computed(() => {
  const statusOk = ['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO'].includes(localForm.status)
  if (!statusOk || !localForm.dataInicio) return false
  return isAdminUser.value || isMedico.value
})
const conveniosDisponiveis = computed(() => listaConvenios.value)

const pacientesFiltrados = computed(() => {
  const q = buscaPaciente.value.trim().toLowerCase()
  if (!q) return listaPacientes.value.slice(0, 8)
  return listaPacientes.value.filter(p => p.nome.toLowerCase().includes(q)).slice(0, 8)
})

const pacienteNome = computed(() =>
  listaPacientes.value.find(p => p.id === Number(localForm.pacienteId))?.nome || '—'
)
const profissionalSelecionado = computed(() =>
  listaProfissionais.value.find(p => p.id === Number(localForm.profissionalId))
)
const convenioSelecionado = computed(() =>
  conveniosDisponiveis.value.find(c => c.id === Number(localForm.convenioId))
)
const procedimentoLabel = computed(() =>
  procedimentos.find(p => p.value === localForm.procedimento)?.label || localForm.procedimento
)

const tituloModal = computed(() => {
  if (telaExcluir.value === 'confirmar') return 'Excluir consulta'
  if (telaExcluir.value === 'solicitar') return 'Solicitar exclusão'
  if (telaExcluir.value === 'enviado')   return 'Solicitação enviada'
  if (modoEdicao.value && !editando.value) return 'Detalhes da consulta'
  if (editando.value) return 'Editar consulta'
  return 'Nova consulta'
})
const subtituloModal = computed(() => {
  if (telaExcluir.value) return ''
  if (modoEdicao.value && !editando.value) return 'Informações do agendamento'
  if (editando.value) return 'Altere os dados do agendamento'
  return 'Preencha os dados do agendamento'
})

function formatarParaInput(data) {
  if (!data) return ''
  const d = new Date(data)
  if (isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function formatarExibicao(valor) {
  if (!valor) return '—'
  const d = new Date(valor)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatarPeriodo(inicio, fim) {
  if (!inicio) return '—'
  const di = new Date(inicio)
  if (isNaN(di.getTime())) return '—'
  const df = fim ? new Date(fim) : null
  const data = di.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const hi   = di.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (df && !isNaN(df.getTime())) {
    const hf = df.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${data} • ${hi} – ${hf}`
  }
  return `${data} • ${hi}`
}

function formatarValor(v) {
  if (v == null || v === '') return null
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function imprimirFicha() {
  const nomePac = pacienteNome.value
  const nomePro = profissionalSelecionado.value?.nome || '—'
  const espec   = profissionalSelecionado.value?.especialidade?.nome || ''
  const dataI   = formatarExibicao(localForm.dataInicio)
  const dataF   = formatarExibicao(localForm.dataFim)
  const tipo    = procedimentoLabel.value
  const conv    = convenioSelecionado.value?.nome || 'Particular'
  const sala    = localForm.sala || '—'
  const obs     = localForm.observacoes || ''

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ficha - ${nomePac}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:48px 40px;color:#1e293b}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #059669}
    .logo{font-size:18px;font-weight:800;color:#059669}
    .meta{font-size:12px;color:#94a3b8;text-align:right;line-height:1.6}
    h2{font-size:14px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px}
    .section{margin-bottom:28px}
    .row{display:flex;padding:10px 0;border-bottom:1px solid #f1f5f9}
    .lbl{width:150px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;flex-shrink:0}
    .val{font-size:14px;color:#1e293b}
    .obs-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:13px;color:#475569;line-height:1.6}
    @media print{body{padding:24px 20px}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">+ MedAgenda</div>
    <div class="meta">Ficha de Consulta<br>${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
  <div class="section">
    <h2>Agendamento</h2>
    <div class="row"><span class="lbl">Paciente</span><span class="val">${nomePac}</span></div>
    <div class="row"><span class="lbl">Profissional</span><span class="val">${nomePro}${espec ? ' — ' + espec : ''}</span></div>
    <div class="row"><span class="lbl">Início</span><span class="val">${dataI}</span></div>
    <div class="row"><span class="lbl">Término</span><span class="val">${dataF}</span></div>
    <div class="row"><span class="lbl">Tipo</span><span class="val">${tipo}</span></div>
    <div class="row"><span class="lbl">Convênio</span><span class="val">${conv}</span></div>
    <div class="row"><span class="lbl">Sala</span><span class="val">${sala}</span></div>
  </div>
  ${obs ? `<div class="section"><h2>Observações</h2><div class="obs-box">${obs}</div></div>` : ''}
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=720,height=680')
  if (win) { win.document.write(html); win.document.close() }
}

async function carregarConveniosDoPaciente(id) {
  if (!id) { conveniosDoPaciente.value = []; return }
  try {
    const { data } = await api.get(`/pacientes/${id}/convenios`)
    conveniosDoPaciente.value = data
    // Auto-select patient's main convenio if field is empty
    if (data.length > 0 && !localForm.convenioId) {
      const item = data[0]
      const convenioId = item.convenioId ?? item.id
      if (listaConvenios.value.some(c => c.id === convenioId)) {
        localForm.convenioId = convenioId
      }
    }
  } catch { conveniosDoPaciente.value = [] }
}

function selecionarPaciente(p) {
  localForm.pacienteId = p.id
  buscaPaciente.value  = p.nome
  pacienteFoco.value   = false
}

async function carregarDados() {
  carregando.value = true
  try {
    const tarefas = [api.get('/convenios')]
    if (!props.pacientes?.length)     tarefas.push(api.get('/pacientes'))
    if (!props.profissionais?.length) tarefas.push(api.get('/profissionais'))
    const res = await Promise.all(tarefas)
    let i = 0
    listaConvenios.value     = res[i++].data
    listaPacientes.value     = props.pacientes?.length     ? props.pacientes     : res[i++].data
    listaProfissionais.value = props.profissionais?.length ? props.profissionais : res[i++].data
  } catch (err) {
    console.error('[ModalConsulta] Erro ao carregar dados:', err)
  } finally {
    carregando.value = false
  }
}

watch(() => props.aberto, async (aberto) => {
  if (!aberto) return
  telaExcluir.value = false
  justificativa.value = ''
  editando.value = false
  await carregarDados()
  const f = props.form || {}
  const agora   = new Date()
  const em30min = new Date(agora.getTime() + 30 * 60 * 1000)
  localForm.id             = f.id || null
  localForm.pacienteId     = f.pacienteId    || ''
  localForm.profissionalId = f.profissionalId || ''
  buscaPaciente.value      = listaPacientes.value.find(p => p.id === Number(f.pacienteId))?.nome || ''
  localForm.dataInicio     = formatarParaInput(f.dataInicio) || formatarParaInput(agora)
  localForm.dataFim        = formatarParaInput(f.dataFim)    || formatarParaInput(em30min)
  localForm.procedimento   = f.procedimento || 'CONSULTA'
  localForm.convenioId     = f.convenioId   || ''
  localForm.sala           = f.sala         || ''
  localForm.observacoes    = f.observacoes  || ''
  localForm.status         = f.status       || ''
  localForm.valor          = f.valor != null ? String(f.valor) : ''
  conveniosDoPaciente.value = []
  if (localForm.pacienteId) await carregarConveniosDoPaciente(localForm.pacienteId)
})

watch(() => localForm.pacienteId, async (novo, anterior) => {
  if (!props.aberto) return
  await carregarConveniosDoPaciente(novo)
  if (anterior && novo !== anterior) localForm.convenioId = ''
})

watch(buscaPaciente, (v) => {
  const nomeAtual = listaPacientes.value.find(p => p.id === Number(localForm.pacienteId))?.nome || ''
  if (v !== nomeAtual) localForm.pacienteId = ''
})

watch([() => localForm.profissionalId, () => localForm.procedimento], ([profId, proc]) => {
  if (!props.aberto || localForm.id) return // só preenche em nova consulta
  const prof = listaProfissionais.value.find(p => p.id === Number(profId))
  if (!prof) return
  const v = proc === 'RETORNO' ? prof.valorRetorno : prof.valorConsulta
  if (v != null) localForm.valor = String(v)
})

function confirmar() {
  if (!localForm.pacienteId) {
    alert('Selecione um paciente da lista.')
    return
  }
  const convenio = conveniosDisponiveis.value.find(c => c.id === Number(localForm.convenioId))
  salvando.value = true
  emit('salvar', { ...localForm, convenio: convenio?.nome || '' })
  salvando.value = false
}

async function handleIniciar() {
  try {
    await api.patch(`/consultas/${localForm.id}/status`, { status: 'EM_ANDAMENTO' })
    emit('fechar')
    await router.push(`/consultas/${localForm.id}`)
  } catch {
    // emit handled by parent
    emit('iniciar', { id: localForm.id })
  }
}

function abrirExcluir() {
  justificativa.value = ''
  telaExcluir.value = props.isAdmin ? 'confirmar' : 'solicitar'
}

async function executarExclusao() {
  if (!justificativa.value.trim()) return
  excluindo.value = true
  try {
    await api.delete(`/consultas/${localForm.id}`)
    emit('excluido', localForm.id)
    emit('fechar')
  } catch (err) {
    console.error('[ModalConsulta] Erro ao excluir:', err)
  } finally {
    excluindo.value = false
  }
}

async function enviarSolicitacao() {
  if (!justificativa.value.trim()) return
  enviando.value = true
  try {
    await api.post('/solicitacoes-exclusao', {
      consultaId: localForm.id,
      motivo:     justificativa.value.trim(),
    })
    telaExcluir.value = 'enviado'
  } catch (err) {
    console.error('[ModalConsulta] Erro ao enviar solicitação:', err)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div v-if="aberto" class="overlay" @click.self="emit('fechar')">
    <div class="modal">

      <!-- ─── Header ─── -->
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div>
            <h2 class="modal-titulo">{{ tituloModal }}</h2>
            <p v-if="subtituloModal" class="modal-subtitulo">{{ subtituloModal }}</p>
          </div>
        </div>
        <button class="btn-fechar" @click="emit('fechar')">&times;</button>
      </div>

      <!-- ─── Tela: Detalhes da consulta ─── -->
      <div v-if="modoEdicao && !editando && !telaExcluir" class="modal-body">

        <div class="detail-group">
          <div class="detail-item">
            <span class="detail-label">Paciente</span>
            <span class="detail-value">{{ pacienteNome }}</span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="detail-label">Profissional</span>
            <span class="detail-value">
              {{ profissionalSelecionado?.nome || '—' }}
              <span v-if="profissionalSelecionado?.especialidade?.nome" class="espec-tag">
                {{ profissionalSelecionado.especialidade.nome }}
              </span>
            </span>
          </div>
        </div>

        <div class="detail-group">
          <div class="detail-item">
            <span class="detail-label">Data / Horário</span>
            <span class="detail-value detail-value--date">{{ formatarPeriodo(localForm.dataInicio, localForm.dataFim) }}</span>
          </div>
        </div>

        <div class="detail-group">
          <div class="detail-item">
            <span class="detail-label">Tipo</span>
            <span class="detail-value">
              <span class="tipo-badge" :data-tipo="localForm.procedimento">{{ procedimentoLabel }}</span>
            </span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="detail-label">Convênio</span>
            <span class="detail-value">{{ convenioSelecionado?.nome || 'Particular' }}</span>
          </div>
          <template v-if="localForm.valor">
            <div class="detail-divider"></div>
            <div class="detail-item">
              <span class="detail-label">Valor</span>
              <span class="detail-value detail-valor">{{ formatarValor(localForm.valor) }}</span>
            </div>
          </template>
          <template v-if="localForm.sala">
            <div class="detail-divider"></div>
            <div class="detail-item">
              <span class="detail-label">Sala</span>
              <span class="detail-value">{{ localForm.sala }}</span>
            </div>
          </template>
        </div>

        <div v-if="localForm.observacoes" class="detail-group detail-group--obs">
          <span class="detail-label">Observações</span>
          <p class="detail-obs-text">{{ localForm.observacoes }}</p>
        </div>

        <!-- Botão principal de atendimento -->
        <div v-if="podeIniciarConsulta" class="iniciar-wrap">
          <button type="button" class="btn-iniciar-atend" @click="handleIniciar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
            </svg>
            {{ localForm.status === 'EM_ANDAMENTO' ? 'Continuar Atendimento' : 'Iniciar Atendimento' }}
          </button>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-excluir-link" @click="abrirExcluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Excluir
          </button>
          <div class="footer-right">
            <button type="button" class="btn-imprimir" @click="imprimirFicha">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir ficha
            </button>
            <button type="button" class="btn-editar" @click="editando = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Tela: Formulário (novo ou editar) ─── -->
      <div v-else-if="!telaExcluir" class="modal-body">
        <form @submit.prevent="confirmar">

          <div class="form-grid-2">
            <div class="field-group">
              <label>Paciente <span class="req">*</span></label>
              <div class="ta-wrap">
                <svg class="ta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  v-model="buscaPaciente"
                  class="field-input ta-input"
                  :placeholder="carregando ? 'Carregando...' : 'Buscar paciente...'"
                  :disabled="carregando"
                  autocomplete="off"
                  @focus="pacienteFoco = true"
                  @blur="setTimeout(() => { pacienteFoco = false }, 180)"
                />
                <span v-if="localForm.pacienteId" class="ta-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <ul v-if="pacienteFoco && pacientesFiltrados.length" class="ta-dd">
                  <li
                    v-for="p in pacientesFiltrados"
                    :key="p.id"
                    class="ta-item"
                    :class="{ 'ta-item--active': p.id === Number(localForm.pacienteId) }"
                    @mousedown.prevent="selecionarPaciente(p)"
                  >
                    <span class="ta-av">{{ p.nome.charAt(0).toUpperCase() }}</span>
                    <span class="ta-nome">{{ p.nome }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="field-group">
              <label>Profissional <span class="req">*</span></label>
              <select v-model="localForm.profissionalId" class="field-input" required :disabled="carregando">
                <option value="" disabled>Selecione...</option>
                <option v-for="p in listaProfissionais" :key="p.id" :value="p.id">
                  {{ p.nome }}{{ p.especialidade?.nome ? ` — ${p.especialidade.nome}` : '' }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="field-group">
              <label>Início <span class="req">*</span></label>
              <input type="datetime-local" v-model="localForm.dataInicio" class="field-input" required />
            </div>
            <div class="field-group">
              <label>Término <span class="req">*</span></label>
              <input type="datetime-local" v-model="localForm.dataFim" class="field-input" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="field-group">
              <label>Tipo</label>
              <select v-model="localForm.procedimento" class="field-input">
                <option v-for="p in procedimentos" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div class="field-group">
              <label>Convênio</label>
              <select v-model="localForm.convenioId" class="field-input" :disabled="carregando">
                <option value="">Particular</option>
                <option v-for="c in conveniosDisponiveis" :key="c.id" :value="c.id">
                  {{ c.nome }}{{ c.numeroCarteira ? ` · ${c.numeroCarteira}` : '' }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="field-group">
              <label>Valor (R$)</label>
              <input type="number" v-model="localForm.valor" class="field-input" step="0.01" min="0" placeholder="0,00" />
            </div>
            <div class="field-group">
              <label>Sala / Consultório</label>
              <input type="text" v-model="localForm.sala" class="field-input" placeholder="Ex: Sala 3, Bloco B" />
            </div>
          </div>

          <div class="field-group">
            <label>Observações</label>
            <textarea v-model="localForm.observacoes" class="field-input field-textarea" rows="3" placeholder="Anotações internas..."></textarea>
          </div>

          <div class="modal-footer">
            <div></div>
            <div class="footer-right">
              <button
                type="button"
                class="btn-cancelar"
                @click="editando ? (editando = false) : emit('fechar')"
                :disabled="salvando"
              >
                {{ editando ? 'Voltar' : 'Cancelar' }}
              </button>
              <button type="submit" class="btn-salvar" :disabled="carregando || salvando">
                {{ salvando ? 'Salvando...' : (modoEdicao ? 'Salvar alterações' : 'Confirmar agendamento') }}
              </button>
            </div>
          </div>

        </form>
      </div>

      <!-- ─── Tela: Admin confirma exclusão ─── -->
      <div v-else-if="telaExcluir === 'confirmar'" class="modal-body tela-exclusao">
        <div class="excluir-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="excluir-titulo">Excluir esta consulta?</h3>
        <p class="excluir-desc">Esta ação é permanente e não pode ser desfeita. Informe o motivo para fins de registro.</p>

        <div class="field-group" style="width: 100%;">
          <label>Justificativa <span class="req">*</span></label>
          <textarea
            v-model="justificativa"
            class="field-input field-textarea"
            rows="3"
            placeholder="Ex: Consulta criada em duplicidade..."
          ></textarea>
        </div>

        <div class="excluir-footer">
          <button class="btn-cancelar" @click="telaExcluir = false" :disabled="excluindo">Voltar</button>
          <button
            class="btn-excluir-confirmar"
            @click="executarExclusao"
            :disabled="!justificativa.trim() || excluindo"
          >
            {{ excluindo ? 'Excluindo...' : 'Confirmar exclusão' }}
          </button>
        </div>
      </div>

      <!-- ─── Tela: Não-admin solicita exclusão ─── -->
      <div v-else-if="telaExcluir === 'solicitar'" class="modal-body tela-exclusao">
        <div class="excluir-icon excluir-icon--info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 class="excluir-titulo">Solicitar exclusão</h3>
        <p class="excluir-desc">Somente administradores podem excluir consultas. Informe o motivo e a solicitação será enviada para aprovação.</p>

        <div class="field-group" style="width: 100%;">
          <label>Motivo da solicitação <span class="req">*</span></label>
          <textarea
            v-model="justificativa"
            class="field-input field-textarea"
            rows="3"
            placeholder="Descreva o motivo da exclusão..."
          ></textarea>
        </div>

        <div class="excluir-footer">
          <button class="btn-cancelar" @click="telaExcluir = false">Voltar</button>
          <button class="btn-salvar" @click="enviarSolicitacao" :disabled="!justificativa.trim() || enviando">
            {{ enviando ? 'Enviando...' : 'Enviar solicitação' }}
          </button>
        </div>
      </div>

      <!-- ─── Tela: Solicitação enviada ─── -->
      <div v-else-if="telaExcluir === 'enviado'" class="modal-body tela-exclusao">
        <div class="excluir-icon excluir-icon--ok">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="26" height="26">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 class="excluir-titulo">Solicitação enviada</h3>
        <p class="excluir-desc">O administrador foi notificado e irá avaliar a solicitação de exclusão.</p>
        <button class="btn-salvar" style="margin-top: 8px;" @click="emit('fechar')">Fechar</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 12px; }

.header-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.modal-titulo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px; font-weight: 700; color: #0f172a;
  margin: 0 0 2px;
}

.modal-subtitulo {
  font-size: 12px; color: #94a3b8; margin: 0;
  font-family: 'Inter', sans-serif;
}

.btn-fechar {
  background: none; border: none;
  font-size: 26px; line-height: 1;
  color: #94a3b8; cursor: pointer; padding: 4px;
  transition: color 0.15s;
}
.btn-fechar:hover { color: #475569; }

/* Body */
.modal-body { overflow-y: auto; padding: 24px; }

/* ── Detail view ── */
.detail-group {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.detail-group--obs {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
}

.detail-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0 16px;
}

.detail-label {
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: #1e293b;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.detail-value--date {
  font-size: 13px;
  color: #334155;
  text-transform: capitalize;
}

.detail-obs-text {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.espec-tag {
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 5px;
  padding: 2px 7px;
}

.tipo-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f0fdf4;
  color: #059669;
}

.tipo-badge[data-tipo="RETORNO"] {
  background: #eff6ff;
  color: #2563eb;
}

.tipo-badge[data-tipo="EXAME"] {
  background: #fff7ed;
  color: #ea580c;
}

/* Form */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }

.field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field-group:last-child { margin-bottom: 0; }

.field-group label {
  font-size: 12.5px; font-weight: 600;
  color: #475569; font-family: 'Inter', sans-serif;
}

.req { color: #ef4444; }

.field-input {
  height: 40px;
  border: 1px solid #cbd5e1; border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px; font-family: 'Inter', sans-serif;
  color: #1e293b; background: #f8fafc;
  outline: none; transition: all 0.15s;
  box-sizing: border-box; width: 100%;
}
.field-input:focus {
  border-color: #059669; background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}
.field-input::placeholder { color: #94a3b8; }
.field-input:disabled { opacity: 0.55; cursor: not-allowed; }

.field-textarea { height: auto; padding: 10px 12px; resize: vertical; line-height: 1.5; }

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
}

.footer-right { display: flex; gap: 10px; align-items: center; }

.btn-excluir-link {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none;
  color: #94a3b8; font-size: 13px;
  font-family: 'Inter', sans-serif; font-weight: 500;
  cursor: pointer; padding: 0;
  transition: color 0.15s;
}
.btn-excluir-link:hover { color: #dc2626; }

.btn-cancelar {
  background: #f1f5f9; border: none; border-radius: 8px;
  padding: 10px 20px; font-size: 13.5px; font-weight: 600;
  font-family: 'Inter', sans-serif; color: #475569;
  cursor: pointer; transition: background 0.15s;
}
.btn-cancelar:hover { background: #e2e8f0; }
.btn-cancelar:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-imprimir {
  display: flex; align-items: center; gap: 7px;
  background: #f1f5f9; border: none; border-radius: 8px;
  padding: 10px 16px; font-size: 13.5px; font-weight: 600;
  font-family: 'Inter', sans-serif; color: #475569;
  cursor: pointer; transition: background 0.15s;
}
.btn-imprimir:hover { background: #e2e8f0; }

.btn-salvar {
  display: flex; align-items: center; gap: 7px;
  background: #059669; border: none; border-radius: 8px;
  padding: 10px 24px; font-size: 13.5px; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif; color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  transition: all 0.2s;
}
.btn-salvar:hover:not(:disabled) { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-editar {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 16px; font-size: 13.5px; font-weight: 600;
  font-family: 'Inter', sans-serif; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.btn-editar:hover { background: #f1f5f9; }

.iniciar-wrap {
  margin: 0 0 14px;
}

.btn-iniciar-atend {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%;
  background: #059669; border: none; border-radius: 10px;
  padding: 13px 20px; font-size: 14.5px; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif; color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.32);
  transition: all 0.15s;
}
.btn-iniciar-atend:hover { background: #047857; box-shadow: 0 6px 20px rgba(5,150,105,.42); transform: translateY(-1px); }

.detail-valor { color: #059669 !important; font-weight: 700 !important; }

/* Tela de exclusão */
.tela-exclusao {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 32px 28px;
}

.excluir-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: #fef2f2; color: #dc2626;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.excluir-icon--info { background: #eff6ff; color: #2563eb; }
.excluir-icon--ok   { background: #f0fdf4; color: #059669; }

.excluir-titulo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px; font-weight: 700; color: #0f172a;
  margin: 0;
}

.excluir-desc {
  font-size: 13.5px; color: #64748b; line-height: 1.6;
  margin: 0; max-width: 400px;
}

.excluir-footer {
  display: flex; gap: 10px; justify-content: center;
  width: 100%; padding-top: 4px;
}

.btn-excluir-confirmar {
  background: #dc2626; border: none; border-radius: 8px;
  padding: 10px 22px; font-size: 13.5px; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif; color: #ffffff;
  cursor: pointer; transition: background 0.2s;
}
.btn-excluir-confirmar:hover:not(:disabled) { background: #b91c1c; }
.btn-excluir-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Patient typeahead ── */
.ta-wrap {
  position: relative;
}

.ta-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
}

.ta-input {
  padding-left: 36px !important;
  padding-right: 32px !important;
}

.ta-check {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #059669;
  pointer-events: none;
}

.ta-dd {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12);
  z-index: 100;
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 220px;
  overflow-y: auto;
}

.ta-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.1s;
}
.ta-item:hover, .ta-item--active { background: #f0fdf4; }

.ta-av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  flex-shrink: 0;
}

.ta-nome {
  font-size: 13.5px;
  color: #0f172a;
  font-weight: 500;
}
</style>
