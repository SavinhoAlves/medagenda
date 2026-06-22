<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '~/services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'medico']
})

useHead({ title: 'Atendimento' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const consultaId = computed(() => Number(route.params.id))

const consulta   = ref(null)
const paciente   = ref(null)
const carregando = ref(true)
const salvando   = ref(false)

const secaoAtiva = ref('resumo')

const secoes = [
  { key: 'resumo',      label: 'Resumo',        icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2' },
  { key: 'anamnese',    label: 'Anamnese',       icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  { key: 'exameFisico', label: 'Exame Físico',   icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { key: 'diagnosticos',label: 'Diagnósticos',   icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z' },
  { key: 'condutas',    label: 'Condutas',       icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4M9 8h6' },
  { key: 'exames',      label: 'Exames',         icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
  { key: 'prescricoes', label: 'Prescrições',    icon: 'M19 11V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2M19 11l-7 7-4-4' },
  { key: 'documentos',  label: 'Documentos',     icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { key: 'historico',   label: 'Histórico',      icon: 'M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3M3 4v4h4' },
]

// ── Resumo campos (editáveis inline) ─────────────────────────────────────────
const resumoCampos = ref({
  alergias:               '',
  medicamentosEmUso:      '',
  comorbidades:           '',
  observacoesImportantes: '',
})
const editandoResumo = ref(null)

const resumoCards = [
  { key: 'alergias',               label: 'Alergias',                cor: '#fef2f2', corBorda: '#fca5a5', corTexto: '#dc2626' },
  { key: 'medicamentosEmUso',      label: 'Medicamentos em uso',     cor: '#eff6ff', corBorda: '#93c5fd', corTexto: '#2563eb' },
  { key: 'comorbidades',           label: 'Comorbidades',            cor: '#fff7ed', corBorda: '#fdba74', corTexto: '#ea580c' },
  { key: 'observacoesImportantes', label: 'Observações importantes', cor: '#f0fdf4', corBorda: '#86efac', corTexto: '#059669' },
]

// ── Anamnese ──────────────────────────────────────────────────────────────────
const anamnese = ref({ queixaPrincipal: '', historiaDoencaAtual: '', historiaPregressa: '' })

// ── Exame Físico ──────────────────────────────────────────────────────────────
const exameFisico = ref({
  peso: '', altura: '', pressaoArterial: '',
  frequenciaCardiaca: '', temperatura: '', saturacao: '',
})

const imc = computed(() => {
  const p = parseFloat(exameFisico.value.peso)
  const a = parseFloat(exameFisico.value.altura) / 100
  if (!p || !a || a === 0) return null
  return (p / (a * a)).toFixed(1)
})

const imcInfo = computed(() => {
  const v = parseFloat(imc.value)
  if (isNaN(v)) return null
  if (v < 18.5) return { label: 'Abaixo do peso', cls: 'imc-baixo' }
  if (v < 25)   return { label: 'Normal',          cls: 'imc-normal' }
  if (v < 30)   return { label: 'Sobrepeso',       cls: 'imc-sobrepeso' }
  return           { label: 'Obesidade',       cls: 'imc-obesidade' }
})

// ── Diagnósticos CID-10 ───────────────────────────────────────────────────────
const diagnosticos  = ref([])
const buscaCid      = ref('')
const cidResultados = ref([])
const cidFoco       = ref(false)

const cidBase = [
  { codigo: 'A09',   descricao: 'Gastroenterite e colites de origem infecciosa' },
  { codigo: 'B34.9', descricao: 'Infecção viral não especificada' },
  { codigo: 'E11',   descricao: 'Diabetes mellitus tipo 2' },
  { codigo: 'E66',   descricao: 'Obesidade' },
  { codigo: 'F32',   descricao: 'Episódio depressivo' },
  { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada' },
  { codigo: 'G43',   descricao: 'Enxaqueca' },
  { codigo: 'I10',   descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'J00',   descricao: 'Nasofaringite aguda [resfriado comum]' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores NE' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'K21.0', descricao: 'Refluxo gastroesofágico com esofagite' },
  { codigo: 'K59.0', descricao: 'Obstipação intestinal' },
  { codigo: 'L20',   descricao: 'Dermatite atópica' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário' },
  { codigo: 'R51',   descricao: 'Cefaleia' },
  { codigo: 'Z00.0', descricao: 'Exame médico geral' },
]

watch(buscaCid, (v) => {
  if (!v.trim()) { cidResultados.value = []; return }
  const q = v.toLowerCase()
  cidResultados.value = cidBase
    .filter(c => c.codigo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q))
    .slice(0, 6)
})

function adicionarDiagnostico(cid) {
  if (!diagnosticos.value.find(d => d.codigo === cid.codigo)) {
    diagnosticos.value.push({ ...cid, tipo: diagnosticos.value.length === 0 ? 'Principal' : 'Secundário' })
  }
  buscaCid.value = ''
  cidResultados.value = []
}

function removerDiagnostico(i) { diagnosticos.value.splice(i, 1) }

// ── Condutas ──────────────────────────────────────────────────────────────────
const conduta = ref('')

// ── Exames solicitados ────────────────────────────────────────────────────────
const exames = ref([])
function addExame()     { exames.value.push({ nome: '', quantidade: 1, obs: '' }) }
function removeExame(i) { exames.value.splice(i, 1) }

// ── Prescrições ───────────────────────────────────────────────────────────────
const prescricoes = ref([])
function addPrescricao()     { prescricoes.value.push({ medicamento: '', posologia: '', frequencia: '', duracao: '' }) }
function removePrescricao(i) { prescricoes.value.splice(i, 1) }

// ── Histórico ─────────────────────────────────────────────────────────────────
const historico           = ref([])
const carregandoHistorico = ref(false)

async function carregarHistorico() {
  if (!paciente.value?.id || historico.value.length > 0) return
  carregandoHistorico.value = true
  try {
    const { data } = await api.get(`/pacientes/${paciente.value.id}/consultas`)
    historico.value = data.filter(c => c.id !== consultaId.value)
  } catch { /* silent */ }
  finally { carregandoHistorico.value = false }
}

watch(secaoAtiva, s => {
  if (s === 'historico' || s === 'resumo') carregarHistorico()
})

// ── Utilitários ───────────────────────────────────────────────────────────────
function calcularIdade(dt) {
  if (!dt) return null
  const d = new Date(dt), h = new Date()
  let a = h.getFullYear() - d.getFullYear()
  if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) a--
  return `${a} anos`
}

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatarDataHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function sexoAbrev(s) {
  return { MASCULINO: 'M', FEMININO: 'F', OUTRO: 'O' }[s] ?? ''
}

function statusLabel(s) {
  return {
    AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', EM_ANDAMENTO: 'Em andamento',
    FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', FALTOU: 'Faltou',
  }[s] ?? s
}

// ── Serialização ──────────────────────────────────────────────────────────────
function buildPayload() {
  return JSON.stringify({
    resumo:     resumoCampos.value,
    anamnese:   anamnese.value,
    exameFisico:exameFisico.value,
    diagnosticos: diagnosticos.value,
    conduta:    conduta.value,
    exames:     exames.value,
    prescricoes:prescricoes.value,
  })
}

function hidratarEstado(json) {
  if (!json) return
  let dados
  try { dados = JSON.parse(json) } catch { return }
  if (dados.resumo)      Object.assign(resumoCampos.value, dados.resumo)
  if (dados.anamnese)    Object.assign(anamnese.value, dados.anamnese)
  if (dados.exameFisico) Object.assign(exameFisico.value, dados.exameFisico)
  if (Array.isArray(dados.diagnosticos)) diagnosticos.value = dados.diagnosticos
  if (dados.conduta)     conduta.value      = dados.conduta
  if (Array.isArray(dados.exames))       exames.value       = dados.exames
  if (Array.isArray(dados.prescricoes))  prescricoes.value  = dados.prescricoes
}

// ── Ações ─────────────────────────────────────────────────────────────────────
async function salvarAtendimento() {
  salvando.value = true
  try {
    await api.put(`/consultas/${consultaId.value}`, { observacoes: buildPayload() })
    toast.sucesso('Atendimento salvo!')
  } catch { toast.erro('Erro ao salvar.') }
  finally  { salvando.value = false }
}

async function finalizarAtendimento() {
  salvando.value = true
  try {
    await api.put(`/consultas/${consultaId.value}`, { observacoes: buildPayload() })
    await api.patch(`/consultas/${consultaId.value}/status`, { status: 'FINALIZADA' })
    toast.sucesso('Atendimento finalizado!')
    router.push('/agenda')
  } catch { toast.erro('Erro ao finalizar atendimento.') }
  finally  { salvando.value = false }
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get(`/consultas/${consultaId.value}`)
    consulta.value = data
    paciente.value = data.paciente
    hidratarEstado(data.observacoes)
    await carregarHistorico()
  } catch {
    toast.erro('Consulta não encontrada.')
    router.push('/agenda')
  } finally {
    carregando.value = false
  }
})
</script>

<template>

  <!-- Loading -->
  <div v-if="carregando" class="loading-screen">
    <div class="spinner"></div>
    <p>Carregando prontuário...</p>
  </div>

  <!-- Root -->
  <div v-else class="ar-root">

    <!-- ══════════ TOP BAR ══════════ -->
    <div class="ar-topbar">
      <div class="tb-left">
        <button class="btn-back" @click="router.push('/agenda')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Agenda
        </button>
        <div class="tb-divider"></div>
        <div class="tb-prof-info">
          <span class="tb-prof-nome">{{ consulta?.profissional?.nome || 'Profissional' }}</span>
          <span v-if="consulta?.profissional?.especialidade?.nome" class="tb-prof-espec">
            {{ consulta.profissional.especialidade.nome }}
          </span>
        </div>
        <span class="tb-status-badge" :data-status="consulta?.status">{{ statusLabel(consulta?.status) }}</span>
      </div>
      <div class="tb-right">
        <button class="btn-save-top" :disabled="salvando" @click="salvarAtendimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          Salvar
        </button>
        <button class="btn-finish-top" :disabled="salvando" @click="finalizarAtendimento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ salvando ? 'Aguarde...' : 'Finalizar Atendimento' }}
        </button>
      </div>
    </div>

    <!-- ══════════ MAIN ══════════ -->
    <div class="ar-main">

      <!-- ══════════ SIDEBAR ══════════ -->
      <aside class="ar-sidebar">

        <!-- Minicard do paciente -->
        <div class="pac-minicard">
          <div class="pac-avatar">{{ paciente?.nome?.charAt(0)?.toUpperCase() ?? '?' }}</div>
          <div class="pac-data">
            <p class="pac-nome">{{ paciente?.nome }}</p>
            <p class="pac-sub">
              <span v-if="sexoAbrev(paciente?.sexo)">{{ sexoAbrev(paciente?.sexo) }}</span>
              <span v-if="calcularIdade(paciente?.dataNascimento)">{{ calcularIdade(paciente?.dataNascimento) }}</span>
            </p>
            <p v-if="consulta?.convenio" class="pac-conv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              {{ consulta.convenio }}
            </p>
            <p v-else class="pac-conv pac-particular">Particular</p>
            <p v-if="paciente?.telefone" class="pac-tel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.62 2 2 0 0 1 3.6 1.44h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
              {{ paciente.telefone }}
            </p>
            <a
              v-if="paciente?.telefone"
              :href="`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}`"
              target="_blank"
              class="pac-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.133 21.5l4.43-1.293A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.976 7.976 0 0 1-4.077-1.11l-.291-.173-3.022.882.845-3.082-.19-.308A7.996 7.996 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>

        <!-- Navegação -->
        <nav class="sb-nav">
          <button
            v-for="s in secoes"
            :key="s.key"
            class="sb-item"
            :class="{ active: secaoAtiva === s.key }"
            @click="secaoAtiva = s.key"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path :d="s.icon"/>
            </svg>
            <span>{{ s.label }}</span>
          </button>
        </nav>

      </aside>

      <!-- ══════════ CONTENT ══════════ -->
      <div class="ar-content">
        <div class="ar-scroll">

          <!-- ─────────── RESUMO ─────────── -->
          <div v-if="secaoAtiva === 'resumo'">

            <div class="sec-heading">
              <h2 class="sec-title">Resumo do Paciente</h2>
              <p class="sec-desc">Clique em qualquer campo para editar</p>
            </div>

            <!-- Cards clínicos inline-editáveis -->
            <div class="resumo-grid">
              <div
                v-for="card in resumoCards"
                :key="card.key"
                class="resumo-card"
                :style="editandoResumo === card.key ? { borderColor: card.corBorda, background: '#fff' } : {}"
                @click="editandoResumo = card.key"
              >
                <div class="rc-top">
                  <span class="rc-label" :style="{ color: card.corTexto }">{{ card.label }}</span>
                  <button
                    v-if="editandoResumo === card.key"
                    class="rc-done"
                    :style="{ color: card.corTexto }"
                    @click.stop="editandoResumo = null"
                  >Feito</button>
                </div>
                <textarea
                  v-if="editandoResumo === card.key"
                  v-model="resumoCampos[card.key]"
                  class="rc-textarea"
                  :style="{ outlineColor: card.corBorda }"
                  rows="3"
                  :placeholder="`Adicionar ${card.label.toLowerCase()}...`"
                  @click.stop
                />
                <p v-else class="rc-text" :class="{ 'rc-empty': !resumoCampos[card.key] }">
                  {{ resumoCampos[card.key] || 'Clique para adicionar...' }}
                </p>
              </div>
            </div>

            <!-- Consultas recentes -->
            <div class="resumo-hist">
              <h3 class="sec-subtitle">Consultas Anteriores</h3>
              <div v-if="carregandoHistorico" class="hist-loading">
                <div class="spinner-sm"></div>
              </div>
              <div v-else-if="!historico.length" class="hist-empty">
                Nenhuma consulta anterior registrada.
              </div>
              <div v-else class="hist-timeline">
                <div v-for="c in historico.slice(0, 5)" :key="c.id" class="ht-item">
                  <div class="ht-dot"></div>
                  <div class="ht-body">
                    <span class="ht-data">{{ formatarDataHora(c.dataInicio) }}</span>
                    <span class="ht-prof">{{ c.profissional?.nome || '—' }}</span>
                    <span class="ht-badge" :data-status="c.status?.toLowerCase()">{{ statusLabel(c.status) }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ─────────── ANAMNESE ─────────── -->
          <div v-if="secaoAtiva === 'anamnese'">
            <div class="sec-heading">
              <h2 class="sec-title">Anamnese</h2>
            </div>
            <div class="sec-card form-stack">
              <div class="form-field">
                <label class="fl">Queixa principal</label>
                <input v-model="anamnese.queixaPrincipal" class="fi" placeholder="Descreva a queixa principal do paciente..." />
              </div>
              <div class="form-field">
                <label class="fl">História da doença atual (HDA)</label>
                <textarea v-model="anamnese.historiaDoencaAtual" class="fi ta" rows="7" placeholder="Descreva o início, progressão, sintomas associados, fatores de melhora e piora..." />
              </div>
              <div class="form-field">
                <label class="fl">História pregressa</label>
                <textarea v-model="anamnese.historiaPregressa" class="fi ta" rows="5" placeholder="Doenças anteriores, internações, cirurgias, alergias conhecidas, histórico familiar..." />
              </div>
            </div>
          </div>

          <!-- ─────────── EXAME FÍSICO ─────────── -->
          <div v-if="secaoAtiva === 'exameFisico'">
            <div class="sec-heading">
              <h2 class="sec-title">Exame Físico</h2>
            </div>
            <div class="sec-card">
              <div class="vitals-grid">

                <div class="vital-box">
                  <span class="vb-label">Peso</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.peso" class="vb-input" type="number" step="0.1" min="0" placeholder="—" />
                    <span class="vb-unit">kg</span>
                  </div>
                </div>

                <div class="vital-box">
                  <span class="vb-label">Altura</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.altura" class="vb-input" type="number" min="0" placeholder="—" />
                    <span class="vb-unit">cm</span>
                  </div>
                </div>

                <div class="vital-box" :class="imcInfo?.cls">
                  <span class="vb-label">IMC</span>
                  <div class="vb-row">
                    <span class="vb-input vb-readonly">{{ imc ?? '—' }}</span>
                  </div>
                  <span v-if="imcInfo" class="imc-label">{{ imcInfo.label }}</span>
                </div>

                <div class="vital-box">
                  <span class="vb-label">Pressão Arterial</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.pressaoArterial" class="vb-input" placeholder="—" />
                    <span class="vb-unit">mmHg</span>
                  </div>
                </div>

                <div class="vital-box">
                  <span class="vb-label">Freq. Cardíaca</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.frequenciaCardiaca" class="vb-input" type="number" min="0" placeholder="—" />
                    <span class="vb-unit">bpm</span>
                  </div>
                </div>

                <div class="vital-box">
                  <span class="vb-label">Temperatura</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.temperatura" class="vb-input" type="number" step="0.1" min="0" placeholder="—" />
                    <span class="vb-unit">°C</span>
                  </div>
                </div>

                <div class="vital-box">
                  <span class="vb-label">Saturação O₂</span>
                  <div class="vb-row">
                    <input v-model="exameFisico.saturacao" class="vb-input" type="number" min="0" max="100" placeholder="—" />
                    <span class="vb-unit">%</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ─────────── DIAGNÓSTICOS ─────────── -->
          <div v-if="secaoAtiva === 'diagnosticos'">
            <div class="sec-heading">
              <h2 class="sec-title">Diagnósticos</h2>
            </div>
            <div class="sec-card">
              <div class="cid-wrap">
                <div class="cid-input-box" :class="{ focus: cidFoco }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" class="cid-icon">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    v-model="buscaCid"
                    class="cid-input"
                    placeholder="Buscar CID-10 por código ou descrição..."
                    @focus="cidFoco = true"
                    @blur="setTimeout(() => { cidFoco = false }, 180)"
                  />
                </div>
                <ul v-if="cidResultados.length && cidFoco" class="cid-dd">
                  <li
                    v-for="c in cidResultados"
                    :key="c.codigo"
                    class="cid-result"
                    @mousedown.prevent="adicionarDiagnostico(c)"
                  >
                    <span class="cid-code">{{ c.codigo }}</span>
                    <span class="cid-desc">{{ c.descricao }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="diagnosticos.length" class="diag-list">
                <div v-for="(d, i) in diagnosticos" :key="d.codigo" class="diag-item">
                  <span class="diag-code">{{ d.codigo }}</span>
                  <span class="diag-desc">{{ d.descricao }}</span>
                  <select v-model="d.tipo" class="diag-tipo">
                    <option>Principal</option>
                    <option>Secundário</option>
                    <option>Descartado</option>
                  </select>
                  <button class="btn-del" @click="removerDiagnostico(i)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <p v-else class="hint-empty">Use a busca acima para adicionar diagnósticos por CID-10.</p>
            </div>
          </div>

          <!-- ─────────── CONDUTAS ─────────── -->
          <div v-if="secaoAtiva === 'condutas'">
            <div class="sec-heading">
              <h2 class="sec-title">Condutas</h2>
            </div>
            <div class="sec-card">
              <div class="form-field">
                <label class="fl">Conduta clínica</label>
                <textarea
                  v-model="conduta"
                  class="fi ta"
                  rows="14"
                  placeholder="Descreva as condutas adotadas: orientações ao paciente, encaminhamentos, retorno, intervenções realizadas..."
                />
              </div>
            </div>
          </div>

          <!-- ─────────── EXAMES ─────────── -->
          <div v-if="secaoAtiva === 'exames'">
            <div class="sec-heading">
              <h2 class="sec-title">Exames Solicitados</h2>
            </div>
            <div class="sec-card">
              <button class="btn-add" @click="addExame">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar exame
              </button>
              <div v-if="exames.length" class="table-wrap">
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Exame / Procedimento</th>
                      <th style="width:80px">Qtd.</th>
                      <th>Observação</th>
                      <th style="width:40px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(e, i) in exames" :key="i">
                      <td><input v-model="e.nome" class="tbl-i" placeholder="Nome do exame..." /></td>
                      <td><input v-model.number="e.quantidade" class="tbl-i" type="number" min="1" /></td>
                      <td><input v-model="e.obs" class="tbl-i" placeholder="Observações..." /></td>
                      <td>
                        <button class="btn-del center" @click="removeExame(i)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="hint-empty">Nenhum exame solicitado ainda.</p>
            </div>
          </div>

          <!-- ─────────── PRESCRIÇÕES ─────────── -->
          <div v-if="secaoAtiva === 'prescricoes'">
            <div class="sec-heading">
              <h2 class="sec-title">Prescrições</h2>
            </div>
            <div class="sec-card">
              <button class="btn-add" @click="addPrescricao">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar medicamento
              </button>
              <div v-if="prescricoes.length" class="presc-list">
                <div v-for="(p, i) in prescricoes" :key="i" class="presc-item">
                  <div class="presc-num">{{ i + 1 }}</div>
                  <div class="presc-fields">
                    <input v-model="p.medicamento" class="fi" placeholder="Medicamento (nome e concentração)..." />
                    <div class="presc-grid3">
                      <div class="form-field">
                        <label class="fl">Posologia</label>
                        <input v-model="p.posologia" class="fi" placeholder="Ex: 1 comprimido" />
                      </div>
                      <div class="form-field">
                        <label class="fl">Frequência</label>
                        <input v-model="p.frequencia" class="fi" placeholder="Ex: 8 em 8h" />
                      </div>
                      <div class="form-field">
                        <label class="fl">Duração</label>
                        <input v-model="p.duracao" class="fi" placeholder="Ex: 7 dias" />
                      </div>
                    </div>
                  </div>
                  <button class="btn-del" style="margin-top: 8px" @click="removePrescricao(i)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <p v-else class="hint-empty">Nenhum medicamento prescrito ainda.</p>
            </div>
          </div>

          <!-- ─────────── DOCUMENTOS ─────────── -->
          <div v-if="secaoAtiva === 'documentos'">
            <div class="sec-heading">
              <h2 class="sec-title">Documentos</h2>
              <p class="sec-desc">Selecione o tipo de documento a emitir</p>
            </div>
            <div class="doc-grid">
              <button class="doc-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Receita Médica
              </button>
              <button class="doc-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 5 2 2 4-4"/></svg>
                Atestado Médico
              </button>
              <button class="doc-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="12" y1="17" x2="8" y2="17"/></svg>
                Declaração
              </button>
              <button class="doc-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="26" height="26"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Encaminhamento
              </button>
            </div>
          </div>

          <!-- ─────────── HISTÓRICO ─────────── -->
          <div v-if="secaoAtiva === 'historico'">
            <div class="sec-heading">
              <h2 class="sec-title">Histórico de Consultas</h2>
            </div>
            <div class="sec-card">
              <div v-if="carregandoHistorico" class="loading-center">
                <div class="spinner-sm"></div>
              </div>
              <div v-else-if="!historico.length" class="hist-empty-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" style="color:#cbd5e1"><path d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3M3 4v4h4"/></svg>
                <p>Nenhuma consulta anterior registrada para este paciente.</p>
              </div>
              <div v-else class="hist-timeline">
                <div v-for="c in historico" :key="c.id" class="ht-item">
                  <div class="ht-dot"></div>
                  <div class="ht-body">
                    <span class="ht-data">{{ formatarDataHora(c.dataInicio) }}</span>
                    <span class="ht-prof">{{ c.profissional?.nome || '—' }}</span>
                    <span class="ht-badge" :data-status="c.status?.toLowerCase()">{{ statusLabel(c.status) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="height:32px"></div>

        </div><!-- /ar-scroll -->
      </div><!-- /ar-content -->
    </div><!-- /ar-main -->
  </div><!-- /ar-root -->
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ── Root ── */
.ar-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow: hidden;
  background: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

/* ── Top bar ── */
.ar-topbar {
  flex-shrink: 0;
  height: 52px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 16px;
}

.tb-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 7px;
  white-space: nowrap;
  transition: all 0.13s;
  flex-shrink: 0;
}
.btn-back:hover { background: #f1f5f9; color: #334155; }

.tb-divider {
  width: 1px;
  height: 18px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.tb-prof-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tb-prof-nome {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tb-prof-espec {
  font-size: 11.5px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tb-status-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
  background: #fef3c7;
  color: #92400e;
}
.tb-status-badge[data-status="EM_ANDAMENTO"] { background: #fef3c7; color: #92400e; }
.tb-status-badge[data-status="FINALIZADA"]   { background: #ede9fe; color: #5b21b6; }
.tb-status-badge[data-status="AGENDADA"]     { background: #d1fae5; color: #065f46; }
.tb-status-badge[data-status="CONFIRMADA"]   { background: #dbeafe; color: #1e40af; }

.tb-right { display: flex; gap: 8px; flex-shrink: 0; }

.btn-save-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  cursor: pointer;
  transition: all 0.13s;
}
.btn-save-top:hover   { background: #f1f5f9; }
.btn-save-top:disabled{ opacity: 0.5; cursor: not-allowed; }

.btn-finish-top {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 18px;
  background: #059669;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: all 0.15s;
}
.btn-finish-top:hover   { background: #047857; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35); }
.btn-finish-top:disabled{ opacity: 0.55; cursor: not-allowed; box-shadow: none; }

/* ── Main ── */
.ar-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── Sidebar ── */
.ar-sidebar {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

/* Patient mini-card */
.pac-minicard {
  display: flex;
  gap: 11px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.pac-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.pac-data { min-width: 0; flex: 1; }

.pac-nome {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pac-sub {
  font-size: 11.5px;
  color: #64748b;
  margin: 0 0 4px;
  display: flex;
  gap: 5px;
}

.pac-conv, .pac-tel {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  margin: 0 0 2px;
}

.pac-particular { color: #94a3b8; font-style: italic; }

.pac-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  text-decoration: none;
  margin-top: 5px;
  transition: opacity 0.13s;
}
.pac-whatsapp:hover { opacity: 0.75; }

/* Sidebar nav */
.sb-nav {
  padding: 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.sb-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: none;
  background: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.12s, color 0.12s;
}
.sb-item:hover { background: #f8fafc; color: #334155; }
.sb-item.active {
  background: #f0fdf4;
  color: #059669;
  font-weight: 600;
}

/* ── Content ── */
.ar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

/* ── Section heading ── */
.sec-heading { margin-bottom: 18px; }

.sec-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px;
}

.sec-subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin: 24px 0 12px;
}

.sec-desc {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
}

/* ── Section card ── */
.sec-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px;
}

/* ── Resumo cards ── */
.resumo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.resumo-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.resumo-card:hover { border-color: #cbd5e1; }

.rc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rc-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rc-done {
  background: none;
  border: none;
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity 0.12s;
}
.rc-done:hover { opacity: 0.7; }

.rc-text {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.55;
  margin: 0;
}

.rc-empty { color: #94a3b8; font-style: italic; }

.rc-textarea {
  width: 100%;
  border: 1px solid;
  border-radius: 6px;
  padding: 8px;
  font-size: 12.5px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  resize: vertical;
  outline: 2px solid transparent;
  outline-offset: 1px;
  background: #fff;
  box-sizing: border-box;
}

/* ── Resumo history ── */
.resumo-hist {
  margin-top: 28px;
}

.hist-empty {
  font-size: 13px;
  color: #94a3b8;
  padding: 12px 0;
}

/* ── Historico timeline shared ── */
.hist-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 20px;
}

.hist-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: #e2e8f0;
}

.ht-item {
  position: relative;
  padding: 0 0 16px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.ht-dot {
  position: absolute;
  left: -20px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #059669;
  flex-shrink: 0;
}

.ht-body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.ht-data {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.ht-prof {
  font-size: 12px;
  color: #64748b;
}

.ht-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}
.ht-badge[data-status="agendada"]      { background: #d1fae5; color: #065f46; }
.ht-badge[data-status="confirmada"]    { background: #dbeafe; color: #1e40af; }
.ht-badge[data-status="em_andamento"]  { background: #fef3c7; color: #92400e; }
.ht-badge[data-status="finalizada"]    { background: #ede9fe; color: #5b21b6; }
.ht-badge[data-status="cancelada"]     { background: #fee2e2; color: #991b1b; }
.ht-badge[data-status="faltou"]        { background: #fef9c3; color: #854d0e; }

/* ── Forms ── */
.form-stack { display: flex; flex-direction: column; gap: 16px; }

.form-field { display: flex; flex-direction: column; gap: 5px; }

.fl { font-size: 12px; font-weight: 600; color: #475569; }

.fi {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 13px;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.fi:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.09); }
.fi::placeholder { color: #94a3b8; }
.fi.ta { resize: vertical; line-height: 1.6; }

/* ── Vitals ── */
.vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.vital-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s;
}
.vital-box:focus-within { border-color: #059669; }

.vb-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vb-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;
}

.vb-input {
  border: none;
  background: none;
  font-size: 24px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  width: 100%;
  min-width: 0;
  padding: 0;
}
.vb-input::placeholder { color: #e2e8f0; font-weight: 400; font-size: 20px; }

.vb-readonly {
  font-size: 24px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  color: #0f172a;
}

.vb-unit {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  flex-shrink: 0;
}

.imc-label {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  margin-top: 4px;
  width: fit-content;
}

.imc-normal    { border-color: #6ee7b7 !important; }
.imc-normal    .imc-label { background: #d1fae5; color: #065f46; }
.imc-sobrepeso { border-color: #fcd34d !important; }
.imc-sobrepeso .imc-label { background: #fef3c7; color: #92400e; }
.imc-obesidade { border-color: #fca5a5 !important; }
.imc-obesidade .imc-label { background: #fee2e2; color: #991b1b; }
.imc-baixo     { border-color: #93c5fd !important; }
.imc-baixo     .imc-label { background: #dbeafe; color: #1e40af; }

/* ── CID ── */
.cid-wrap { position: relative; margin-bottom: 18px; }

.cid-input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 14px;
  background: #f8fafc;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cid-input-box.focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.09); background: #fff; }

.cid-icon { color: #94a3b8; flex-shrink: 0; }

.cid-input {
  flex: 1;
  border: none;
  background: none;
  padding: 12px 0;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  outline: none;
}

.cid-dd {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px -4px rgba(0,0,0,0.1);
  z-index: 50;
  list-style: none;
  margin: 0;
  padding: 4px;
}

.cid-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.1s;
}
.cid-result:hover { background: #f0fdf4; }

.cid-code {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  min-width: 50px;
  flex-shrink: 0;
}
.cid-desc { font-size: 13px; color: #334155; }

.diag-list { display: flex; flex-direction: column; gap: 8px; }

.diag-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
}

.diag-code {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  color: #059669;
  flex-shrink: 0;
}

.diag-desc {
  flex: 1;
  font-size: 13px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diag-tipo {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  color: #475569;
  background: #fff;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Buttons ── */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #059669;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.13s;
  margin-bottom: 14px;
}
.btn-add:hover { background: #dcfce7; }

.btn-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.13s;
  flex-shrink: 0;
}
.btn-del:hover { background: #fef2f2; color: #dc2626; }
.btn-del.center { margin: auto; }

/* ── Table ── */
.table-wrap {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tbl { width: 100%; border-collapse: collapse; }

.tbl th {
  background: #f8fafc;
  padding: 9px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #e2e8f0;
}

.tbl td { padding: 5px 5px; border-bottom: 1px solid #f1f5f9; }
.tbl tr:last-child td { border-bottom: none; }

.tbl-i {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background: transparent;
  outline: none;
  transition: border-color 0.12s, background 0.12s;
  box-sizing: border-box;
}
.tbl-i:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 2px rgba(5,150,105,0.08); }

/* ── Prescrições ── */
.presc-list { display: flex; flex-direction: column; gap: 10px; }

.presc-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.presc-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #059669;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 10px;
}

.presc-fields { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

.presc-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

/* ── Documentos ── */
.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.doc-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.doc-btn:hover { background: #f0fdf4; border-color: #6ee7b7; color: #059669; }

/* ── Historico completo ── */
.hist-empty-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #94a3b8;
  text-align: center;
}
.hist-empty-full p { margin: 0; font-size: 14px; }

/* ── Utilities ── */
.hint-empty {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 24px 0 4px;
  margin: 0;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

/* ── Loading ── */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  gap: 12px;
  color: #64748b;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.hist-loading {
  display: flex;
  padding: 12px 0;
}

.spinner {
  width: 28px; height: 28px;
  border: 3px solid rgba(5, 150, 105, 0.15);
  border-radius: 50%;
  border-top-color: #059669;
  animation: spin 0.7s linear infinite;
}

.spinner-sm {
  width: 20px; height: 20px;
  border: 2px solid rgba(5, 150, 105, 0.15);
  border-radius: 50%;
  border-top-color: #059669;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .resumo-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .ar-main { flex-direction: column; }
  .ar-sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #e2e8f0; }
  .sb-nav { flex-direction: row; flex-wrap: wrap; }
  .sb-item { width: auto; font-size: 12px; }
  .ar-scroll { padding: 16px; }
  .resumo-grid { grid-template-columns: 1fr; }
  .presc-grid3 { grid-template-columns: 1fr; }
  .tb-prof-espec { display: none; }
  .tb-status-badge { display: none; }
}
</style>
