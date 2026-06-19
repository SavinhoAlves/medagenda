<template>
  <div v-if="aberto" class="modal-overlay" @click.self="emit('fechar')">
    <div class="modal-container">
      
      <header class="modal-header">
        <div class="header-titulo">
          <component :is="form.id ? CalendarClock : CalendarPlus" class="icone-header" />
          <h2>{{ form.id ? 'Editar Agendamento' : 'Novo Agendamento' }}</h2>
        </div>
        <button class="btn-fechar" @click="emit('fechar')" title="Fechar">
          <X :size="20" />
        </button>
      </header>

      <form @submit.prevent="manipularSalvar" class="modal-form">
        
        <div class="form-group">
          <label for="paciente">
            <User :size="16" class="icone-input" /> Paciente <span class="obrigatorio">*</span>
          </label>
          <select id="paciente" v-model="localForm.pacienteId" required :disabled="carregando">
            <option value="" disabled>Selecione um paciente...</option>
            <option v-for="p in listaPacientes" :key="p.id" :value="p.id">
              {{ p.nome }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="profissional">
            <Stethoscope :size="16" class="icone-input" /> Profissional <span class="obrigatorio">*</span>
          </label>
          <select id="profissional" v-model="localForm.profissionalId" required :disabled="carregando">
            <option value="" disabled>Selecione um profissional...</option>
            <option v-for="prof in listaProfissionais" :key="prof.id" :value="prof.id">
              {{ prof.nome }} — {{ prof.especialidade?.nome || 'Geral' }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dataInicio">
              <Clock :size="16" class="icone-input" /> Início <span class="obrigatorio">*</span>
            </label>
            <input 
              type="datetime-local" 
              id="dataInicio" 
              v-model="localForm.dataInicio" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="dataFim">
              <Clock :size="16" class="icone-input" /> Término <span class="obrigatorio">*</span>
            </label>
            <input 
              type="datetime-local" 
              id="dataFim" 
              v-model="localForm.dataFim" 
              required 
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="procedimento">
              <Activity :size="16" class="icone-input" /> Procedimento
            </label>
            <select id="procedimento" v-model="localForm.procedimento">
              <option v-for="item in listaProcedimentos" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="convenio">
              <CreditCard :size="16" class="icone-input" /> Convênio
            </label>
            <select id="convenio" v-model="localForm.convenioId" :disabled="carregando">
              <option value="">Particular / Nenhum</option>
              <option v-for="item in conveniosDisponiveis" :key="item.id" :value="item.id">
                {{ item.nome }}{{ item.numeroCarteira ? ` — Carteira: ${item.numeroCarteira}` : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="sala">
            <MapPin :size="16" class="icone-input" /> Sala / Consultório
          </label>
          <input type="text" id="sala" v-model="localForm.sala" placeholder="Ex: Sala 204, Bloco B" />
        </div>

        <div class="form-group">
          <label for="observacoes">
            <FileText :size="16" class="icone-input" /> Observações Internas
          </label>
          <textarea 
            id="observacoes" 
            v-model="localForm.observacoes" 
            rows="3" 
            placeholder="Informações adicionais sobre o agendamento..."
          ></textarea>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('fechar')" :disabled="carregando">
            Cancelar
          </button>
          <button type="submit" class="btn-salvar" :disabled="carregando">
            <Check :size="16" style="margin-right: 4px;" />
            {{ carregando ? 'Salvando...' : (form.id ? 'Atualizar' : 'Confirmar') }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import api from '../../services/api'

// Importando os ícones desejados do Lucide Vue
import { 
  X, 
  User, 
  Stethoscope, 
  Clock, 
  Activity, 
  CreditCard, 
  MapPin, 
  FileText, 
  CalendarPlus, 
  CalendarClock,
  Check
} from 'lucide-vue-next'

const props = defineProps({
  aberto: Boolean,
  form: {
    type: Object,
    default: () => ({})
  },
  pacientes: {
    type: Array,
    default: null
  },
  profissionais: {
    type: Array,
    default: null
  }
})

const emit = defineEmits(['fechar', 'salvar'])

// Estados dos dados vindo do banco
const listaPacientes = ref([])
const listaProfissionais = ref([])
const listaConvenios = ref([])
const conveniosDoPaciente = ref([])
const carregando = ref(false)

// Tipos de procedimento mapeados para os campos retorno/titulo da Consulta
const listaProcedimentos = [
  { value: 'CONSULTA', label: 'Consulta Médica' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'EXAME', label: 'Exame Diagnóstico' }
]

const conveniosDisponiveis = computed(() => {
  if (conveniosDoPaciente.value.length > 0) {
    return conveniosDoPaciente.value
  }
  return listaConvenios.value
})

const localForm = reactive({
  id: null,
  pacienteId: '',
  profissionalId: '',
  dataInicio: '',
  dataFim: '',
  procedimento: 'CONSULTA',
  convenioId: '',
  sala: '',
  observacoes: ''
})

async function carregarConveniosDoPaciente(pacienteId) {
  if (!pacienteId) {
    conveniosDoPaciente.value = []
    return
  }

  try {
    const res = await api.get(`/pacientes/${pacienteId}/convenios`)
    conveniosDoPaciente.value = res.data
  } catch (error) {
    console.error('Erro ao buscar convênios do paciente:', error)
    conveniosDoPaciente.value = []
  }
}

async function carregarDadosDoBanco() {
  try {
    carregando.value = true

    const tarefas = [api.get('/convenios')]

    if (!props.pacientes?.length) {
      tarefas.push(api.get('/pacientes'))
    }

    if (!props.profissionais?.length) {
      tarefas.push(api.get('/profissionais'))
    }

    const resultados = await Promise.all(tarefas)
    let indice = 0

    listaConvenios.value = resultados[indice++].data

    if (!props.pacientes?.length) {
      listaPacientes.value = resultados[indice++].data
    } else {
      listaPacientes.value = props.pacientes
    }

    if (!props.profissionais?.length) {
      listaProfissionais.value = resultados[indice++].data
    } else {
      listaProfissionais.value = props.profissionais
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  } finally {
    carregando.value = false
  }
}

function obterProcedimento(consulta) {
  if (consulta.retorno) return 'RETORNO'
  if (consulta.titulo === 'Exame Diagnóstico') return 'EXAME'
  return 'CONSULTA'
}

function obterConvenioIdPorNome(nomeConvenio) {
  if (!nomeConvenio) return ''

  const todasListas = [...conveniosDoPaciente.value, ...listaConvenios.value]
  const convenio = todasListas.find(
    (item) => item.nome.toLowerCase() === nomeConvenio.toLowerCase()
  )

  return convenio?.id ?? ''
}

function formatarDataParaInput(data) {
  if (!data) return ''
  const d = new Date(data)
  if (isNaN(d.getTime())) return ''
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  const hora = String(d.getHours()).padStart(2, '0')
  const minuto = String(d.getMinutes()).padStart(2, '0')
  return `${ano}-${mes}-${dia}T${hora}:${minuto}`
}

watch(() => props.aberto, async (novoValor) => {
  if (novoValor) {
    await carregarDadosDoBanco()

    if (props.form && props.form.id) {
      localForm.id = props.form.id
      localForm.pacienteId = props.form.pacienteId
      localForm.profissionalId = props.form.profissionalId
      localForm.dataInicio = formatarDataParaInput(props.form.dataInicio)
      localForm.dataFim = formatarDataParaInput(props.form.dataFim)
      localForm.sala = props.form.sala || ''
      localForm.observacoes = props.form.observacoes || ''
      localForm.procedimento = obterProcedimento(props.form)

      await carregarConveniosDoPaciente(props.form.pacienteId)

      const nomeConvenio = props.form.descricao?.replace('Convênio: ', '') || ''
      localForm.convenioId = obterConvenioIdPorNome(nomeConvenio)
    } else {
      localForm.id = null
      localForm.pacienteId = ''
      localForm.profissionalId = ''
      localForm.dataInicio = formatarDataParaInput(props.form?.dataInicio || new Date())
      localForm.dataFim = formatarDataParaInput(props.form?.dataFim || new Date(Date.now() + 30 * 60 * 1000))
      localForm.sala = ''
      localForm.observacoes = ''
      localForm.procedimento = 'CONSULTA'
      localForm.convenioId = ''
      conveniosDoPaciente.value = []
    }
  }
})

watch(() => localForm.pacienteId, async (pacienteId, pacienteAnterior) => {
  if (!props.aberto) return

  await carregarConveniosDoPaciente(pacienteId)

  if (pacienteAnterior && pacienteId !== pacienteAnterior) {
    localForm.convenioId = ''
  }
})

function manipularSalvar() {
  const convenioSelecionado = conveniosDisponiveis.value.find(
    (item) => item.id === Number(localForm.convenioId)
  )

  emit('salvar', {
    ...localForm,
    convenio: convenioSelecionado?.nome || ''
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4); /* Backdrop moderno ligeiramente azulado */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 8px;
  width: 520px;
  max-width: 90%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.modal-header {
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icone-header {
  color: #2563eb;
  width: 20px;
  height: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.btn-fechar {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
}

.btn-fechar:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icone-input {
  color: #94a3b8;
}

.obrigatorio {
  color: #ef4444;
}

input, select, textarea {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  color: #334155;
  background-color: #fff;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancelar {
  background-color: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-cancelar:hover {
  background-color: #e2e8f0;
}

.btn-salvar {
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.btn-salvar:hover {
  background-color: #1d4ed8;
}

.btn-salvar:disabled, .btn-cancelar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>