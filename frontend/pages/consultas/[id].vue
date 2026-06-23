<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../../services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'medico']
})

useHead({ title: 'Prontuário Eletrônico' })

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const consultaId = computed(() => Number(route.params.id))
const consulta   = ref(null)
const paciente   = ref(null)
const carregando = ref(true)
const salvando   = ref(false)
const secaoAtiva = ref('historico')

// ── Status ────────────────────────────────────────────────────────────────────
const atendimentoIniciado   = computed(() => ['EM_ANDAMENTO', 'FINALIZADA'].includes(consulta.value?.status))
const atendimentoFinalizado = computed(() => consulta.value?.status === 'FINALIZADA')

// ── Seções ────────────────────────────────────────────────────────────────────
const SECOES_TODAS = [
  { key: 'historico',         label: 'Histórico de Consulta',    icon: 'M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3M3 4v4h4' },
  { key: 'acompanhamento',    label: 'Tabela de Acompanhamento', icon: 'M3 3h18v18H3zM3 9h18M9 3v18' },
  { key: 'anamnese',          label: 'Anamnese',                 icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  { key: 'exameFisico',       label: 'Exame Físico',             icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { key: 'resultados',        label: 'Resultados de Exames',     icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 12h6' },
  { key: 'diagnosticos',      label: 'Hipótese Diagnóstica',     icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z' },
  { key: 'condutas',          label: 'Condutas',                 icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4M9 8h6' },
  { key: 'examesProcedimentos', label: 'Exames e Procedimentos', icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
  { key: 'prescricoes',       label: 'Prescrições',              icon: 'M19 11V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2M19 11l-7 7-4-4' },
  { key: 'documentos',        label: 'Documentos e Atestados',   icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
  { key: 'imagens',           label: 'Imagens e Anexos',         icon: 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z' },
]

const secoesDisponiveis = computed(() =>
  atendimentoIniciado.value ? SECOES_TODAS : SECOES_TODAS.slice(0, 1)
)

// ── Acompanhamento ────────────────────────────────────────────────────────────
const acompanhamento   = ref([])
const addAcomp         = () => acompanhamento.value.push({ exame: '', data: '' })
const removeAcomp      = (i) => acompanhamento.value.splice(i, 1)

// ── Anamnese ──────────────────────────────────────────────────────────────────
const anamnese = ref({ queixaPrincipal: '', historiaDoencaAtual: '', historicoFamiliar: '', alergias: '' })

// ── Exame Físico ──────────────────────────────────────────────────────────────
const ef = ref({ peso: '', altura: '', pressaoArterial: '', frequenciaCardiaca: '', temperatura: '', saturacao: '', descricao: '' })

const imc = computed(() => {
  const p = parseFloat(ef.value.peso), a = parseFloat(ef.value.altura) / 100
  if (!p || !a || isNaN(p) || isNaN(a)) return null
  return (p / (a * a)).toFixed(1)
})
const imcLabel = computed(() => {
  const v = parseFloat(imc.value); if (isNaN(v)) return null
  if (v < 18.5) return 'Abaixo do peso'; if (v < 25) return 'Normal'
  if (v < 30) return 'Sobrepeso'; return 'Obesidade'
})

// ── Resultados de Exames ──────────────────────────────────────────────────────
const resultados = ref({ laboratoriais: '', imagem: '' })

// ── CID-10 ────────────────────────────────────────────────────────────────────
const diagnosticos = ref([])
const buscaCid     = ref('')
const cidResultados = ref([])
const cidFoco      = ref(false)
const cidBase = [
  { codigo: 'A09', descricao: 'Gastroenterite e colites de origem infecciosa' },
  { codigo: 'B34.9', descricao: 'Infecção viral não especificada' },
  { codigo: 'E11', descricao: 'Diabetes mellitus tipo 2' },
  { codigo: 'E66', descricao: 'Obesidade' },
  { codigo: 'F32', descricao: 'Episódio depressivo' },
  { codigo: 'F41.1', descricao: 'Transtorno de ansiedade generalizada' },
  { codigo: 'G43', descricao: 'Enxaqueca' },
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'J00', descricao: 'Nasofaringite aguda [resfriado comum]' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores NE' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'K21.0', descricao: 'Refluxo gastroesofágico com esofagite' },
  { codigo: 'K59.0', descricao: 'Obstipação intestinal' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário' },
  { codigo: 'R51', descricao: 'Cefaleia' },
  { codigo: 'Z00.0', descricao: 'Exame médico geral' },
]
watch(buscaCid, (v) => {
  if (!v.trim()) { cidResultados.value = []; return }
  const q = v.toLowerCase()
  cidResultados.value = cidBase.filter(c => c.codigo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q)).slice(0, 8)
})
function adicionarDiagnostico(cid) {
  if (!diagnosticos.value.find(d => d.codigo === cid.codigo))
    diagnosticos.value.push({ ...cid, tipo: diagnosticos.value.length === 0 ? 'Principal' : 'Secundário' })
  buscaCid.value = ''; cidResultados.value = []
}
function removerDiagnostico(i) { diagnosticos.value.splice(i, 1) }

// ── Condutas ──────────────────────────────────────────────────────────────────
const conduta = ref('')

// ── Exames e Procedimentos ────────────────────────────────────────────────────
const paginasExames = ref([])
const paginaAtual   = ref(0)
function addPagina() {
  paginasExames.value.push({ tipo: 'SADT', indicacaoClinica: '', itens: [{ nome: '', quantidade: 1 }] })
  paginaAtual.value = paginasExames.value.length - 1
}
function removePagina(i) {
  paginasExames.value.splice(i, 1)
  paginaAtual.value = Math.max(0, Math.min(paginaAtual.value, paginasExames.value.length - 1))
}
function addItem(p)    { p.itens.push({ nome: '', quantidade: 1 }) }
function removeItem(p, i) { p.itens.splice(i, 1) }

// ── Prescrições ───────────────────────────────────────────────────────────────
const prescricoes    = ref([])
const addPrescricao  = () => prescricoes.value.push({ medicamento: '', posologia: '', frequencia: '', duracao: '' })
const removePrescricao = (i) => prescricoes.value.splice(i, 1)

// ── Documentos ────────────────────────────────────────────────────────────────
const documentos = ref([])
const docAtual   = ref(null)
const docTipos   = ['Receita Médica', 'Atestado Médico', 'Declaração de Comparecimento', 'Encaminhamento', 'Laudo Médico']

function novoDoc(tipo) {
  docAtual.value = { id: null, tipo, conteudo: '' }
}
function editarDoc(d) {
  docAtual.value = { ...d }
}
function salvarDoc() {
  if (!docAtual.value) return
  if (docAtual.value.id) {
    const idx = documentos.value.findIndex(d => d.id === docAtual.value.id)
    if (idx !== -1) documentos.value[idx].conteudo = docAtual.value.conteudo
  } else {
    documentos.value.push({ id: Date.now(), tipo: docAtual.value.tipo, conteudo: docAtual.value.conteudo, dataCriacao: new Date().toISOString() })
    docAtual.value.id = documentos.value[documentos.value.length - 1].id
  }
  toast.sucesso('Documento salvo!')
}
function removerDoc(id) {
  documentos.value = documentos.value.filter(d => d.id !== id)
  if (docAtual.value?.id === id) docAtual.value = null
}

// ── Imagens e Anexos ──────────────────────────────────────────────────────────
const imagens    = ref([])
const isDragging = ref(false)
const fileInputRef = ref(null)
function onDrop(e) {
  isDragging.value = false
  processarArquivos(e.dataTransfer.files)
}
function onFileChange(e) { processarArquivos(e.target.files) }
function processarArquivos(files) {
  for (const f of files) {
    imagens.value.push({ nome: f.name, tamanho: formatarTamanho(f.size), tipo: f.type, url: URL.createObjectURL(f) })
  }
}
function formatarTamanho(b) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}
function removerImagem(i) { imagens.value.splice(i, 1) }

// ── Histórico ─────────────────────────────────────────────────────────────────
const historico           = ref([])
const carregandoHistorico = ref(false)
async function carregarHistorico() {
  if (!paciente.value?.id || historico.value.length) return
  carregandoHistorico.value = true
  try {
    const { data } = await api.get(`/pacientes/${paciente.value.id}/consultas`)
    historico.value = data.filter(c => c.id !== consultaId.value)
  } catch { /* silent */ }
  finally { carregandoHistorico.value = false }
}
watch(secaoAtiva, s => { if (s === 'historico') carregarHistorico() })

// ── Utilitários ───────────────────────────────────────────────────────────────
const convenioNome = computed(() => {
  const m = consulta.value?.descricao?.match(/^Convênio:\s*(.+)$/)
  return m ? m[1] : null
})
function calcularIdade(dt) {
  if (!dt) return '—'
  const d = new Date(dt), h = new Date()
  let a = h.getFullYear() - d.getFullYear()
  if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) a--
  return `${a} anos`
}
function formatarData(iso) {
  if (!iso) return '—'
  return new Date(String(iso).replace(' ', 'T')).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatarDataHora(iso) {
  if (!iso) return '—'
  const d = new Date(String(iso).replace(' ', 'T'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function sexoLabel(s) { return { MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro' }[s] ?? (s || '—') }
function statusLabel(s) {
  return { AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', EM_ANDAMENTO: 'Em andamento', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', FALTOU: 'Faltou' }[s] ?? (s || '—')
}

// ── Serialização ──────────────────────────────────────────────────────────────
function serializarProntuario() {
  return JSON.stringify({
    anamnese: anamnese.value, exameFisico: ef.value, resultados: resultados.value,
    diagnosticos: diagnosticos.value, conduta: conduta.value,
    paginasExames: paginasExames.value,
    exames: paginasExames.value.flatMap(p => p.itens.map(it => ({ nome: it.nome, quantidade: it.quantidade }))),
    prescricoes: prescricoes.value, documentos: documentos.value, acompanhamento: acompanhamento.value,
  })
}
function desserializarProntuario(json) {
  if (!json) return
  try {
    const d = JSON.parse(json)
    if (d.anamnese)    Object.assign(anamnese.value, d.anamnese)
    if (d.exameFisico) Object.assign(ef.value, d.exameFisico)
    if (d.resultados)  Object.assign(resultados.value, d.resultados)
    if (Array.isArray(d.diagnosticos)) diagnosticos.value = d.diagnosticos
    if (d.conduta) conduta.value = d.conduta
    if (d.documentoTexto && !d.conduta) conduta.value = d.documentoTexto
    if (Array.isArray(d.paginasExames) && d.paginasExames.length) paginasExames.value = d.paginasExames
    else if (Array.isArray(d.exames) && d.exames.length)
      paginasExames.value = [{ tipo: 'SADT', indicacaoClinica: '', itens: d.exames.map(e => ({ nome: e.nome || '', quantidade: e.quantidade || 1 })) }]
    if (Array.isArray(d.prescricoes))   prescricoes.value = d.prescricoes
    if (Array.isArray(d.documentos))    documentos.value = d.documentos
    if (Array.isArray(d.acompanhamento)) acompanhamento.value = d.acompanhamento
  } catch { /* silent */ }
}

// ── Ações ─────────────────────────────────────────────────────────────────────
async function iniciarAtendimento() {
  salvando.value = true
  try {
    const { data } = await api.patch(`/consultas/${consultaId.value}/status`, { status: 'EM_ANDAMENTO' })
    consulta.value = { ...consulta.value, status: data.status }
    toast.sucesso('Atendimento iniciado!')
  } catch { toast.erro('Erro ao iniciar atendimento.') }
  finally { salvando.value = false }
}
async function salvarAtendimento() {
  salvando.value = true
  try {
    await api.put(`/consultas/${consultaId.value}`, { observacoes: serializarProntuario() })
    toast.sucesso('Prontuário salvo!')
  } catch { toast.erro('Erro ao salvar.') }
  finally { salvando.value = false }
}
async function finalizarAtendimento() {
  salvando.value = true
  try {
    await api.put(`/consultas/${consultaId.value}`, { observacoes: serializarProntuario() })
    await api.patch(`/consultas/${consultaId.value}/status`, { status: 'FINALIZADA' })
    consulta.value = { ...consulta.value, status: 'FINALIZADA' }
    toast.sucesso('Atendimento finalizado!')
  } catch { toast.erro('Erro ao finalizar.') }
  finally { salvando.value = false }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/consultas/${consultaId.value}`)
    consulta.value = data
    paciente.value = data.paciente
    desserializarProntuario(data.observacoes)
    await carregarHistorico()
  } catch {
    toast.erro('Consulta não encontrada.')
    router.push('/agenda')
  } finally { carregando.value = false }
})
</script>

<template>

  <!-- Loading -->
  <div v-if="carregando" class="emr-loading">
    <div class="w-8 h-8 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin"></div>
    <span class="text-sm font-medium">Carregando prontuário...</span>
  </div>

  <div v-else class="emr-root">

    <!-- ══ TOPBAR ══ -->
    <header class="flex items-center justify-between h-12 px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <button @click="router.push('/agenda')"
          class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Agenda
        </button>
        <div class="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
        <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          {{ consulta?.profissional?.nome }}<template v-if="consulta?.profissional?.especialidade?.nome"> · {{ consulta.profissional.especialidade.nome }}</template>
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
          :class="{
            'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20': consulta?.status === 'EM_ANDAMENTO',
            'bg-teal-500/10   text-teal-600   dark:text-teal-400   border-teal-500/20':   ['AGENDADA','CONFIRMADA'].includes(consulta?.status),
            'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20': consulta?.status === 'FINALIZADA',
            'bg-red-500/10    text-red-600    dark:text-red-400    border-red-500/20':    ['CANCELADA','FALTOU'].includes(consulta?.status),
            'bg-slate-100     text-slate-500  dark:bg-slate-700/30 dark:text-slate-400 border-slate-200 dark:border-slate-600/30': !consulta?.status,
          }">{{ statusLabel(consulta?.status) }}</span>
      </div>

      <!-- Botões condicionais -->
      <div class="flex items-center gap-2">
        <template v-if="!atendimentoIniciado && !['CANCELADA','FALTOU'].includes(consulta?.status)">
          <button @click="iniciarAtendimento" :disabled="salvando"
            class="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-md shadow-md shadow-teal-600/20 transition-all disabled:opacity-50">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
            {{ salvando ? 'Iniciando...' : 'Iniciar Atendimento' }}
          </button>
        </template>
        <template v-else-if="atendimentoIniciado">
          <button @click="salvarAtendimento" :disabled="salvando"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors disabled:opacity-50">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Salvar
          </button>
          <button v-if="!atendimentoFinalizado" @click="finalizarAtendimento" :disabled="salvando"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-md shadow-md transition-all disabled:opacity-50">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {{ salvando ? 'Aguarde...' : 'Finalizar Atendimento' }}
          </button>
          <span v-else class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Atendimento concluído</span>
        </template>
      </div>
    </header>

    <!-- ══ CORPO ══ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- ══ SIDEBAR ══ -->
      <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 overflow-y-auto">

        <!-- Card paciente -->
        <div class="p-3 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {{ paciente?.nome?.charAt(0)?.toUpperCase() ?? '?' }}
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{{ paciente?.nome }}</h2>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ formatarData(consulta?.dataInicio || consulta?.dataConsulta) }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1 text-[11.5px]">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400" v-if="paciente?.dataNascimento">
              <svg class="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              {{ calcularIdade(paciente.dataNascimento) }} · {{ sexoLabel(paciente?.sexo) }}
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span v-if="convenioNome" class="text-slate-600 dark:text-slate-300">{{ convenioNome }}</span>
              <span v-else class="text-slate-400 dark:text-slate-500 italic">Particular</span>
            </div>
          </div>
        </div>

        <!-- Navegação -->
        <nav class="flex-1 p-2">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pt-1.5 pb-1">
            {{ atendimentoIniciado ? 'Prontuário' : 'Pré-consulta' }}
          </p>
          <button v-for="s in secoesDisponiveis" :key="s.key" @click="secaoAtiva = s.key"
            class="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-all"
            :class="secaoAtiva === s.key
              ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'">
            <svg class="w-3.5 h-3.5 shrink-0"
              :class="secaoAtiva === s.key ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="s.icon"/>
            </svg>
            {{ s.label }}
          </button>

          <!-- Botão Iniciar no menu quando não iniciado -->
          <div v-if="!atendimentoIniciado && !['CANCELADA','FALTOU','FINALIZADA'].includes(consulta?.status)" class="p-2 mt-3">
            <button @click="iniciarAtendimento" :disabled="salvando"
              class="w-full flex items-center justify-center gap-2 px-3 py-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-50">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
              Iniciar Atendimento
            </button>
          </div>
        </nav>
      </aside>

      <!-- ══ CONTEÚDO ══ -->
      <main class="flex-1 overflow-y-auto p-4">
        <div>

          <!-- ─── HISTÓRICO ─── -->
          <section v-show="secaoAtiva === 'historico'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Histórico de Consulta</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Consultas anteriores registradas para este paciente.</p>
            </div>
            <div v-if="carregandoHistorico" class="flex justify-center py-12">
              <div class="w-6 h-6 border-2 border-teal-600/20 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
            <div v-else-if="!historico.length" class="flex flex-col items-center gap-3 py-14 text-slate-400 dark:text-slate-500">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3M3 4v4h4"/></svg>
              <p class="text-sm">Nenhuma consulta anterior registrada.</p>
            </div>
            <div v-else class="relative pl-6">
              <div class="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-600"></div>
              <div v-for="c in historico" :key="c.id" class="relative pb-5">
                <div class="absolute -left-4 top-1 w-3 h-3 rounded-full bg-white dark:bg-slate-800 border-2 border-teal-500"></div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ formatarDataHora(c.dataInicio) }}</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{ c.profissional?.nome || '—' }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-green-100  dark:bg-green-900/20  text-green-700  dark:text-green-400':  c.status === 'AGENDADA',
                      'bg-blue-100   dark:bg-blue-900/20   text-blue-700   dark:text-blue-400':   c.status === 'CONFIRMADA',
                      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400': c.status === 'EM_ANDAMENTO',
                      'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400': c.status === 'FINALIZADA',
                      'bg-red-100    dark:bg-red-900/20    text-red-700    dark:text-red-400':    ['CANCELADA','FALTOU'].includes(c.status),
                      'bg-slate-100  dark:bg-slate-700     text-slate-600  dark:text-slate-300':  !c.status,
                    }">{{ statusLabel(c.status) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── ACOMPANHAMENTO ─── -->
          <section v-show="secaoAtiva === 'acompanhamento'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Tabela de Acompanhamento</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500">Exames de monitoramento e suas datas de referência.</p>
              </div>
              <button @click="addAcomp"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar linha
              </button>
            </div>
            <div v-if="acompanhamento.length" class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px]">Exame / Parâmetro</th>
                    <th class="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] w-40">Data</th>
                    <th class="w-10"></th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/50">
                  <tr v-for="(row, i) in acompanhamento" :key="i">
                    <td class="px-2 py-1.5">
                      <input v-model="row.exame"
                        class="w-full text-sm px-2 py-1.5 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-teal-400 focus:outline-none bg-transparent dark:text-slate-200 dark:placeholder:text-slate-600"
                        placeholder="Nome do exame..." />
                    </td>
                    <td class="px-2 py-1.5">
                      <input v-model="row.data" type="date"
                        class="w-full text-sm px-2 py-1.5 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-teal-400 focus:outline-none bg-transparent dark:text-slate-200 dark:bg-slate-800" />
                    </td>
                    <td class="px-2 py-1.5 text-center">
                      <button @click="removeAcomp(i)" class="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-xs text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-600 rounded-lg">
              Nenhum item adicionado. Clique em "Adicionar linha".
            </p>
          </section>

          <!-- ─── ANAMNESE ─── -->
          <section v-show="secaoAtiva === 'anamnese'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Anamnese</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Histórico narrado pelo paciente durante a entrevista médica.</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Queixa principal e duração</label>
              <textarea v-model="anamnese.queixaPrincipal" rows="2"
                class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                placeholder="Ex: Cefaleia há 3 dias, associada a náuseas..."></textarea>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">História da moléstia atual (HMA)</label>
              <CampoTextoComModelo v-model="anamnese.historiaDoencaAtual" :rows="8" model-key="anamnese-hma"
                placeholder="Descrição cronológica dos sintomas..."/>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Histórico pessoal / familiar</label>
                <textarea v-model="anamnese.historicoFamiliar" rows="4"
                  class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-y"
                  placeholder="Hipertensão, Diabetes, etc."></textarea>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Alergias conhecidas</label>
                <textarea v-model="anamnese.alergias" rows="4"
                  class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-y"
                  placeholder="Restrições medicamentosas ou alimentares..."></textarea>
              </div>
            </div>
          </section>

          <!-- ─── EXAME FÍSICO ─── -->
          <section v-show="secaoAtiva === 'exameFisico'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Sinais Vitais e Exame Físico</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Parâmetros fisiológicos aferidos durante a consulta.</p>
            </div>
            <div class="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <div v-for="v in [
                { label: 'Peso', key: 'peso', unit: 'kg', type: 'number', step: '0.1' },
                { label: 'Altura', key: 'altura', unit: 'cm', type: 'number', step: '1' },
                { label: 'Pressão Art.', key: 'pressaoArterial', unit: 'mmHg', type: 'text' },
                { label: 'Freq. Cardíaca', key: 'frequenciaCardiaca', unit: 'bpm', type: 'number' },
                { label: 'Temperatura', key: 'temperatura', unit: '°C', type: 'number', step: '0.1' },
                { label: 'Saturação O₂', key: 'saturacao', unit: '%', type: 'number' },
              ]" :key="v.key" class="flex flex-col gap-1">
                <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ v.label }}</label>
                <div class="flex items-baseline gap-1">
                  <input v-model="ef[v.key]" :type="v.type" :step="v.step"
                    class="w-full text-xl font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-500" placeholder="—">
                  <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">{{ v.unit }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">IMC</label>
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-2 text-center h-[46px] flex flex-col justify-center">
                  <span class="text-xl font-bold text-teal-700 dark:text-teal-400">{{ imc || '—' }}</span>
                  <p v-if="imcLabel" class="text-[9px] font-semibold text-teal-600 dark:text-teal-400">{{ imcLabel }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Achados do exame clínico geral</label>
              <CampoTextoComModelo v-model="ef.descricao" :rows="6" model-key="exame-fisico-descricao"
                placeholder="Estado geral, cardiovascular, respiratório, abdômen, neurológico..."/>
            </div>
          </section>

          <!-- ─── RESULTADOS DE EXAMES ─── -->
          <section v-show="secaoAtiva === 'resultados'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Resultados de Exames</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Análise dos resultados de exames laboratoriais e de imagem.</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Exames Laboratoriais</label>
              <CampoTextoComModelo v-model="resultados.laboratoriais" :rows="6" model-key="resultados-lab"
                placeholder="Hemograma, bioquímica, urina, microbiologia..."/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Exames de Imagem</label>
              <CampoTextoComModelo v-model="resultados.imagem" :rows="6" model-key="resultados-imagem"
                placeholder="Radiografia, tomografia, ultrassom, ressonância..."/>
            </div>
          </section>

          <!-- ─── DIAGNÓSTICOS ─── -->
          <section v-show="secaoAtiva === 'diagnosticos'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Hipótese Diagnóstica (CID-10)</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Vincule os códigos CID-10 às condições identificadas.</p>
            </div>
            <div class="relative">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Buscar diagnóstico</label>
              <input v-model="buscaCid" type="text"
                class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="Digite o código CID ou nome da patologia..."
                @focus="cidFoco = true" @blur="setTimeout(() => cidFoco = false, 180)" />
              <div v-if="cidResultados.length && cidFoco"
                class="absolute inset-x-0 top-[calc(100%+4px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                <button v-for="c in cidResultados" :key="c.codigo" @mousedown.prevent="adicionarDiagnostico(c)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-none text-left">
                  <span class="font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded shrink-0">{{ c.codigo }}</span>
                  <span class="text-slate-700 dark:text-slate-200 truncate">{{ c.descricao }}</span>
                </button>
              </div>
            </div>
            <div v-if="diagnosticos.length" class="flex flex-col gap-2">
              <div v-for="(d, i) in diagnosticos" :key="d.codigo"
                class="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  :class="d.tipo === 'Principal' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'">
                  {{ d.tipo === 'Principal' ? 'P' : 'S' }}
                </span>
                <span class="font-bold text-xs text-teal-700 dark:text-teal-400 shrink-0">{{ d.codigo }}</span>
                <span class="text-xs text-slate-700 dark:text-slate-200 flex-1 truncate">{{ d.descricao }}</span>
                <select v-model="d.tipo"
                  class="text-xs border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 outline-none">
                  <option>Principal</option><option>Secundário</option><option>Descartado</option>
                </select>
                <button @click="removerDiagnostico(i)" class="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-600 rounded-lg">
              Nenhum diagnóstico adicionado.
            </p>
          </section>

          <!-- ─── CONDUTAS ─── -->
          <section v-show="secaoAtiva === 'condutas'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Condutas</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Orientações, encaminhamentos e intervenções definidas nesta consulta.</p>
            </div>
            <CampoTextoComModelo v-model="conduta" :rows="16" model-key="condutas"
              placeholder="Descreva as condutas: repouso, orientações ao paciente, retorno, encaminhamentos..."/>
          </section>

          <!-- ─── EXAMES E PROCEDIMENTOS ─── -->
          <section v-show="secaoAtiva === 'examesProcedimentos'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Exames e Procedimentos</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500">Pedidos de exames por formulário de solicitação.</p>
              </div>
              <button @click="addPagina"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Novo pedido
              </button>
            </div>

            <p v-if="!paginasExames.length" class="text-xs text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-600 rounded-lg">
              Nenhum pedido criado. Clique em "Novo pedido".
            </p>

            <div v-else>
              <div class="flex gap-1 flex-wrap mb-4">
                <button v-for="(p, i) in paginasExames" :key="i" @click="paginaAtual = i"
                  class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                  :class="paginaAtual === i
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600'">
                  <span>{{ p.tipo }} {{ i + 1 }}</span>
                  <span @click.stop="removePagina(i)" class="opacity-50 hover:opacity-100 ml-0.5">&times;</span>
                </button>
              </div>

              <div v-if="paginasExames[paginaAtual]" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-2">Tipo:</label>
                  <button v-for="t in ['SADT', 'PARTICULAR']" :key="t" @click="paginasExames[paginaAtual].tipo = t"
                    class="px-3 py-1 text-xs font-bold rounded-md border transition-all"
                    :class="paginasExames[paginaAtual].tipo === t
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'">
                    {{ t }}
                  </button>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Indicação Clínica</label>
                  <textarea v-model="paginasExames[paginaAtual].indicacaoClinica" rows="2"
                    class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg p-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                    placeholder="Justificativa clínica para a solicitação..."></textarea>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Itens solicitados</label>
                    <button @click="addItem(paginasExames[paginaAtual])"
                      class="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Adicionar item
                    </button>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div v-for="(it, j) in paginasExames[paginaAtual].itens" :key="j" class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{{ j + 1 }}</span>
                      <input v-model="it.nome"
                        class="flex-1 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="Nome do exame / procedimento..." />
                      <input v-model.number="it.quantidade" type="number" min="1"
                        class="w-16 text-sm text-center border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-teal-500" />
                      <button @click="removeItem(paginasExames[paginaAtual], j)" class="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── PRESCRIÇÕES ─── -->
          <section v-show="secaoAtiva === 'prescricoes'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Prescrições</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500">Medicamentos prescritos nesta consulta.</p>
              </div>
              <button @click="addPrescricao"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar
              </button>
            </div>
            <div v-if="prescricoes.length" class="flex flex-col gap-3">
              <div v-for="(p, i) in prescricoes" :key="i"
                class="flex items-start gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <span class="w-6 h-6 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-2.5">{{ i + 1 }}</span>
                <div class="flex-1 flex flex-col gap-2 min-w-0">
                  <input v-model="p.medicamento"
                    class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="Medicamento (nome + concentração)..." />
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Posologia</label>
                      <input v-model="p.posologia"
                        class="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="Ex: 1 cp" />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Frequência</label>
                      <input v-model="p.frequencia"
                        class="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="Ex: 8/8h" />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Duração</label>
                      <input v-model="p.duracao"
                        class="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="Ex: 7 dias" />
                    </div>
                  </div>
                </div>
                <button @click="removePrescricao(i)" class="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1 mt-1 shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-600 rounded-lg">
              Nenhum medicamento prescrito. Clique em "Adicionar".
            </p>
          </section>

          <!-- ─── DOCUMENTOS ─── -->
          <section v-show="secaoAtiva === 'documentos'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Documentos e Atestados</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Crie e edite documentos médicos para este paciente.</p>
            </div>
            <div class="flex gap-4">
              <!-- Lista e tipos -->
              <div class="w-48 shrink-0 flex flex-col gap-2">
                <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Criar documento</p>
                <button v-for="tipo in docTipos" :key="tipo" @click="novoDoc(tipo)"
                  class="text-left text-xs font-medium px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 text-slate-600 dark:text-slate-300 rounded-lg transition-all">
                  {{ tipo }}
                </button>
                <template v-if="documentos.length">
                  <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3 mb-1">Salvos</p>
                  <button v-for="d in documentos" :key="d.id" @click="editarDoc(d)"
                    class="flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg border transition-all"
                    :class="docAtual?.id === d.id
                      ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700 text-slate-600 dark:text-slate-300'">
                    <span class="font-medium truncate">{{ d.tipo }}</span>
                    <span @click.stop="removerDoc(d.id)" class="text-slate-300 dark:text-slate-500 hover:text-red-500 ml-1 shrink-0 transition-colors">&times;</span>
                  </button>
                </template>
              </div>

              <!-- Editor -->
              <div class="flex-1 flex flex-col gap-3">
                <div v-if="docAtual" class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ docAtual.tipo }}</span>
                    <button @click="salvarDoc" class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                      Salvar documento
                    </button>
                  </div>
                  <textarea v-model="docAtual.conteudo" rows="18"
                    class="w-full font-mono text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl p-4 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-y"
                    :placeholder="`Digite o conteúdo do ${docAtual.tipo}...`"></textarea>
                </div>
                <div v-else class="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 gap-2">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/></svg>
                  <p class="text-xs">Selecione um tipo de documento para criar ou editar.</p>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── IMAGENS ─── -->
          <section v-show="secaoAtiva === 'imagens'" class="flex flex-col gap-3">
            <div class="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Imagens e Anexos</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500">Arquivos, fotos clínicas e documentos digitalizados.</p>
            </div>
            <div
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onDrop"
              @click="fileInputRef?.click()"
              class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
              :class="isDragging
                ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-700/30'">
              <input ref="fileInputRef" type="file" multiple class="hidden" @change="onFileChange" />
              <svg class="w-10 h-10 mx-auto mb-3" :class="isDragging ? 'text-teal-500' : 'text-slate-300 dark:text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0-3 3m3-3v12"/>
              </svg>
              <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Arraste arquivos aqui ou clique para selecionar</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Imagens, PDFs e documentos</p>
            </div>
            <div v-if="imagens.length" class="flex flex-col gap-2">
              <div v-for="(img, i) in imagens" :key="i"
                class="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="img.tipo.startsWith('image/')" :src="img.url" class="w-full h-full object-cover" />
                  <svg v-else class="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ img.nome }}</p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ img.tamanho }}</p>
                </div>
                <a :href="img.url" :download="img.nome" class="text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </a>
                <button @click="removerImagem(i)" class="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </section>

          <div class="h-4"></div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.emr-root {
  position: fixed;
  inset: 0;
  top: 64px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: var(--bg-app);
  overflow: hidden;
}
.emr-loading {
  position: fixed;
  inset: 0;
  top: 64px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-app);
  gap: 12px;
  color: var(--text-sub);
}
</style>
