<script setup>
import { ref, onMounted } from 'vue'
import appointmentService from '~/services/appointmentService'
import patientService from '~/services/patientService'
import professionalService from '~/services/professionalService'
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'
import ModalAgendamento from '../components/agenda/ModalConsulta.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'

const router = useRouter()

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Agenda' })

const { isAdmin } = useCurrentUser()
const toast = useToast()

const modalAberto = ref(false)
const consultas = ref([])
const pacientes = ref([])
const profissionais = ref([])
const formInicial = ref({})

function toLocalISO(dateStr) {
  if (!dateStr) return null
  const d = new Date(String(dateStr).replace(' ', 'T'))
  if (isNaN(d.getTime())) return null
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function mapearEvento(consulta) {
  const retorno = consulta.retorno === true
  return {
    id: String(consulta.id),
    title: consulta.paciente?.nome || 'Sem nome',
    start: toLocalISO(consulta.dataInicio),
    end:   toLocalISO(consulta.dataFim),
    backgroundColor: retorno ? '#ef4444' : '#059669',
    borderColor:     retorno ? '#dc2626' : '#047857',
    textColor: '#ffffff',
    extendedProps: { consulta }
  }
}

async function carregarDados() {
  try {
    const [consultasRes, pacientesRes, profissionaisRes] = await Promise.all([
      appointmentService.listarTodas(),
      patientService.listarTodos(),
      professionalService.listarTodos()
    ])
    consultas.value = consultasRes.data.map(mapearEvento)
    pacientes.value = pacientesRes.data
    profissionais.value = profissionaisRes.data
  } catch (error) {
    console.error('[Agenda] Erro ao carregar dados:', error)
  }
}

function abrirNovoAgendamento(info) {
  const agora = new Date()
  const em30min = new Date(agora.getTime() + 30 * 60 * 1000)
  formInicial.value = {
    dataInicio: info?.startStr || agora.toISOString().substring(0, 16),
    dataFim: info?.endStr || em30min.toISOString().substring(0, 16),
  }
  modalAberto.value = true
}

function abrirEdicao(consulta) {
  formInicial.value = { ...consulta }
  modalAberto.value = true
}

async function salvarConsulta(dados) {
  try {
    const payload = {
      pacienteId:     Number(dados.pacienteId),
      profissionalId: Number(dados.profissionalId),
      dataInicio:     new Date(dados.dataInicio),
      dataFim:        new Date(dados.dataFim),
      observacoes:    dados.observacoes || null,
      sala:           dados.sala || null,
      procedimento:   dados.procedimento || 'CONSULTA',
      convenio:       dados.convenio || null,
      valor:          dados.valor ? Number(dados.valor) : null,
    }
    if (dados.id) {
      await appointmentService.atualizar(Number(dados.id), payload)
      toast.sucesso('Consulta atualizada com sucesso!')
    } else {
      await appointmentService.criar(payload)
      toast.sucesso('Consulta agendada com sucesso!')
    }
    modalAberto.value = false
    await carregarDados()
  } catch (error) {
    console.error('[Agenda] Erro ao salvar consulta:', error)
    toast.erro('Erro ao salvar o agendamento.')
  }
}

async function iniciarAtendimento(consulta) {
  try {
    await appointmentService.alterarStatus(consulta.id, 'EM_ANDAMENTO')
    modalAberto.value = false
    await router.push(`/consultas/${consulta.id}/atendimento`)
  } catch {
    toast.erro('Erro ao iniciar atendimento.')
  }
}

async function aoExcluido(id) {
  consultas.value = consultas.value.filter(c => c.id !== String(id))
  toast.sucesso('Consulta excluída.')
}

async function atualizarHorario(info) {
  try {
    const evento = info.event
    if (!evento?.id) return
    await appointmentService.atualizar(Number(evento.id), {
      dataInicio: new Date(evento.start),
      dataFim: new Date(evento.end)
    })
    await carregarDados()
  } catch (error) {
    console.error('[Agenda] Erro ao mover evento:', error)
    info.revert?.()
  }
}

onMounted(carregarDados)
</script>

<template>
  <div class="agenda-page">

    <div class="page-top">
      <div>
        <h1>Agenda</h1>
        <p>Gerencie consultas e horários da clínica</p>
      </div>
      <button class="btn-nova-consulta" @click="abrirNovoAgendamento(null)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova Consulta
      </button>
    </div>

    <AgendaCalendar
      :eventos="consultas"
      :is-admin="isAdmin"
      @novo="abrirNovoAgendamento"
      @mover="atualizarHorario"
      @redimensionar="atualizarHorario"
      @editar="abrirEdicao"
    />

    <ModalAgendamento
      :aberto="modalAberto"
      :form="formInicial"
      :pacientes="pacientes"
      :profissionais="profissionais"
      :is-admin="isAdmin"
      @fechar="modalAberto = false"
      @salvar="salvarConsulta"
      @excluido="aoExcluido"
      @iniciar="iniciarAtendimento"
    />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.agenda-page {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #f8fafc;
  box-sizing: border-box;
}

.page-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-top h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.page-top p {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #64748b;
}

.btn-nova-consulta {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 11px 20px;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  transition: all 0.2s;
}

.btn-nova-consulta:hover {
  background: #047857;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
  transform: translateY(-1px);
}
</style>
