<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Serviços de API
import appointmentService from '~/services/appointmentService'
import patientService from '~/services/patientService'
import professionalService from '~/services/professionalService'

// Componentes da Agenda
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'
// ✅ AJUSTADO: Nome do arquivo alinhado com o componente criado anteriormente
import ModalAgendamento from '../components/agenda/ModalConsulta.vue'

// ======================
// ESTADOS
// ======================
const modalAberto = ref(false)

const consultas = ref([])
const pacientes = ref([])
const profissionais = ref([])

// Form estruturado com todos os campos limpos de fábrica
const form = ref({
  pacienteId: '',
  profissionalId: '',
  dataInicio: '',
  dataFim: '',
  observacoes: '',
  tipoRegistro: 'AGENDAR',
  procedimento: 'RETORNO',
  quantidade: 1,
  teleconsulta: false,
  telefoneCelular: '',
  telefoneResidencial: '',
  email: '',
  convenio: '',
  recorrencia: 'NAO_REPETE'
})

// ======================
// CARREGAR DADOS DO BACKEND
// ======================
async function carregarDados() {
  try {
    console.log('🔍 [Agenda.vue] Buscando dados do back-end...')
    const [consultasRes, pacientesRes, profissionaisRes] = await Promise.all([
      appointmentService.listarTodas(),
      patientService.listarTodos(),
      professionalService.listarTodos()
    ])

    consultas.value = consultasRes.data.map((consulta) => {
      const ehRetorno =
        consulta.retorno === 1 ||
        consulta.retorno === true

      const corFundo = ehRetorno
        ? '#f39494'
        : '#a3d7f5'

      const corTexto = ehRetorno
        ? '#661414'
        : '#003366'

      return {
        id: String(consulta.id),

        title: consulta.paciente?.nome || 'Sem nome',

        start: consulta.dataInicio,
        end: consulta.dataFim,

        backgroundColor: corFundo,
        textColor: corTexto,
        borderColor: corFundo,

        extendedProps: {
          consulta: {
            ...consulta,

            corFundo,
            corTexto,

            pacienteNome:
              consulta.paciente?.nome || 'Sem nome'
          }
        }
      }
    })

    pacientes.value = pacientesRes.data
    profissionais.value = profissionaisRes.data 
    
    console.log('🚀 [Agenda.vue] Tudo carregado e mapeado com sucesso!')

  } catch (error) {
    console.error('❌ [Agenda.vue] Erro ao carregar dados:', error)
  }
}

// ======================
// AÇÕES DO MODAL
// ======================
function abrirNovoAgendamento(info) {
  const dataPadrao = new Date().toISOString().substring(0, 16)
  
  form.value = {
    pacienteId: '',
    profissionalId: '',
    // ✅ O FullCalendar envia strings perfeitas em startStr e endStr
    dataInicio: info?.startStr || dataPadrao, 
    dataFim: info?.endStr || dataPadrao,
    observacoes: '',
    tipoRegistro: 'AGENDAR',
    procedimento: 'RETORNO',
    quantidade: 1,
    teleconsulta: false,
    telefoneCelular: '',
    telefoneResidencial: '',
    email: '',
    convenio: '',
    recorrencia: 'NAO_REPETE'
  }
  modalAberto.value = true
}

// ✅ ATUALIZADO: Recebe o payload emitido de dentro do modal já sanitizado
async function salvarConsulta(dadosFormulario) {
  try {
    const payload = {
      pacienteId: Number(dadosFormulario.pacienteId),
      profissionalId: Number(dadosFormulario.profissionalId),
      dataInicio: new Date(dadosFormulario.dataInicio),
      dataFim: new Date(dadosFormulario.dataFim),
      observacoes: dadosFormulario.observacoes || null,
      tipoRegistro: dadosFormulario.tipoRegistro,
      procedimento: dadosFormulario.procedimento,
      quantidade: Number(dadosFormulario.quantidade),
      teleconsulta: dadosFormulario.teleconsulta,
      telefoneCelular: dadosFormulario.telefoneCelular,
      telefoneResidencial: dadosFormulario.telefoneResidencial,
      email: dadosFormulario.email,
      convenio: dadosFormulario.convenio,
      recorrencia: dadosFormulario.recorrencia
    }

    console.log('📤 Enviando payload para o backend:', payload)
    await appointmentService.criar(payload)

    modalAberto.value = false
    await carregarDados() // Atualiza os eventos na tela na hora

  } catch (error) {
    console.error('❌ Erro ao salvar consulta no servidor:', error)
  }
}

// ======================
// ATUALIZAR HORÁRIO (Drag-and-Drop / Resize)
// ======================
// ✅ Altere para esta versão na sua pages/agenda.vue:
async function atualizarHorario(infoDoCalendario) {
  try {
    // O FullCalendar envia um objeto contendo a propriedade 'event'
    const evento = infoDoCalendario.event; 

    if (!evento || !evento.id) return;

    await appointmentService.atualizar(Number(evento.id), {
      dataInicio: new Date(evento.start),
      dataFim: new Date(evento.end)
    })

    await carregarDados()

  } catch (error) {
    console.error('Erro ao atualizar horário via calendário:', error)
  }
}

// ======================
// CICLO DE VIDA
// ======================
onMounted(async () => {
  await carregarDados()
})
</script>

<template>
  <div class="agenda-page">

    <div class="page-top">
      <div>
        <h1>Agenda Médica</h1>
        <p>Gerencie consultas e horários em tempo real</p>
      </div>
      
      <button class="btn-novo-agendamento" @click="abrirNovoAgendamento(null)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nova Consulta
      </button>
    </div>

    <div class="status-legend">
      <span class="legend-item"><span class="badge agendada"></span> Agendada</span>
      <span class="legend-item"><span class="badge confirmada"></span> Confirmada</span>
      <span class="legend-item"><span class="badge andamento"></span> Em Andamento</span>
      <span class="legend-item"><span class="badge finalizada"></span> Finalizada</span>
    </div>

    <AgendaCalendar
      :eventos="consultas"
      @novo="abrirNovoAgendamento"
      @mover="atualizarHorario"
      @redimensionar="atualizarHorario"
    />

    <ModalAgendamento
      :aberto="modalAberto"
      :form="form"
      :pacientes="pacientes"
      :profissionais="profissionais"
      @fechar="modalAberto = false"
      @salvar="salvarConsulta"
    />

  </div>
</template>

<style scoped>
.agenda-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f8fafc;
}

.page-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
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

.btn-novo-agendamento {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
}

.btn-novo-agendamento:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.25);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.status-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 6px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.badge.agendada { background: #10b981; }
.badge.confirmada { background: #3b82f6; }
.badge.andamento { background: #f59e0b; }
.badge.finalizada { background: #8b5cf6; }
</style>