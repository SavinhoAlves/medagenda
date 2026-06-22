<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '~/services/api'
import { useMascaras } from '~/composables/useMascaras'

const props = defineProps({
  pacienteId: { type: Number, required: true }
})

const emit = defineEmits(['fechar', 'excluido'])

const toast = useToast()
const { mascaraCpf, mascaraTelefone, mascaraCep, mascaraRg, mascaraCns } = useMascaras()

const paciente = ref(null)
const loading = ref(true)
const salvando = ref(false)
const excluindo = ref(false)
const abaAtiva = ref('pessoais')
const dataNascimentoStr = ref('')
const { confirmar } = useConfirm()

// ── Convênios ──
const conveniosVinculados = ref([])
const conveniosDisponiveis = ref([])
const carregandoConvenios = ref(false)
const vinculando = ref(false)
const novoConvenio = ref({ convenioId: '', numeroCarteira: '' })
const mostrarFormConvenio = ref(false)
const editandoConvenioId = ref(null)
const editCarteiraTemp = ref('')
const erroConvenios = ref(false)

async function carregarConvenios() {
  carregandoConvenios.value = true
  erroConvenios.value = false
  try {
    const [vinculados, disponiveis] = await Promise.all([
      api.get(`/pacientes/${props.pacienteId}/convenios`),
      api.get('/convenios'),
    ])
    conveniosVinculados.value = vinculados.data
    conveniosDisponiveis.value = disponiveis.data
  } catch (err) {
    erroConvenios.value = true
    console.error('[ProntuarioPaciente] Erro ao carregar convênios:', err?.response?.status, err?.message)
  } finally {
    carregandoConvenios.value = false
  }
}

function recarregarConvenios() {
  conveniosCarregados = false
  carregarConvenios()
}

const conveniosParaVincular = computed(() => {
  const vinculadosIds = new Set(conveniosVinculados.value.map(c => c.id))
  return conveniosDisponiveis.value.filter(c => !vinculadosIds.has(c.id))
})

async function vincularConvenio() {
  if (!novoConvenio.value.convenioId) return
  vinculando.value = true
  try {
    const { data } = await api.post(`/pacientes/${props.pacienteId}/convenios`, {
      convenioId: Number(novoConvenio.value.convenioId),
      numeroCarteira: novoConvenio.value.numeroCarteira || null,
    })
    conveniosVinculados.value.push(data)
    novoConvenio.value = { convenioId: '', numeroCarteira: '' }
    mostrarFormConvenio.value = false
    toast.sucesso('Convênio vinculado com sucesso!')
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao vincular convênio.')
  } finally {
    vinculando.value = false
  }
}

function iniciarEdicaoCarteirinha(c) {
  editandoConvenioId.value = c.id
  editCarteiraTemp.value = c.numeroCarteira || ''
}

async function salvarCarteirinha(convenioId) {
  try {
    await api.patch(`/pacientes/${props.pacienteId}/convenios/${convenioId}`, {
      numeroCarteira: editCarteiraTemp.value || null,
    })
    const c = conveniosVinculados.value.find(v => v.id === convenioId)
    if (c) c.numeroCarteira = editCarteiraTemp.value || null
    editandoConvenioId.value = null
    toast.sucesso('Carteirinha atualizada.')
  } catch {
    toast.erro('Erro ao atualizar carteirinha.')
  }
}

async function desvincularConvenio(convenioId) {
  try {
    await api.delete(`/pacientes/${props.pacienteId}/convenios/${convenioId}`)
    conveniosVinculados.value = conveniosVinculados.value.filter(c => c.id !== convenioId)
    toast.sucesso('Convênio removido.')
  } catch {
    toast.erro('Erro ao remover convênio.')
  }
}

const abas = [
  { key: 'pessoais',      label: 'Dados pessoais' },
  { key: 'complementares', label: 'Complementares' },
  { key: 'convenios',     label: 'Convênios' },
  { key: 'historico',     label: 'Histórico' },
]

function isoParaData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const dia = String(d.getUTCDate()).padStart(2, '0')
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${d.getUTCFullYear()}`
}

function mascaraDataInput(v) {
  return String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 10)
}

function formatarDataHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function carregar() {
  loading.value = true
  try {
    const { data } = await api.get(`/pacientes/${props.pacienteId}`)
    paciente.value = data
    dataNascimentoStr.value = isoParaData(data.dataNascimento)
  } catch {
    toast.erro('Erro ao carregar prontuário.')
    emit('fechar')
  } finally {
    loading.value = false
  }
}

async function salvar() {
  salvando.value = true
  try {
    await api.put(`/pacientes/${props.pacienteId}`, {
      ...paciente.value,
      dataNascimento: dataNascimentoStr.value,
    })
    toast.sucesso('Alterações salvas com sucesso!')
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao salvar.')
  } finally {
    salvando.value = false
  }
}

async function excluir() {
  const ok = await confirmar({
    titulo: 'Excluir Paciente',
    mensagem: 'Tem certeza que deseja excluir',
    nome: paciente.value?.nome,
    aviso: 'Todos os dados serão removidos permanentemente.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  excluindo.value = true
  try {
    await api.delete(`/pacientes/${props.pacienteId}`)
    toast.sucesso('Paciente excluído.')
    emit('excluido', props.pacienteId)
  } catch {
    toast.erro('Erro ao excluir paciente.')
  } finally {
    excluindo.value = false
  }
}

let conveniosCarregados = false
let historicoCarregado = false

const historico = ref([])
const carregandoHistorico = ref(false)

async function carregarHistorico() {
  carregandoHistorico.value = true
  try {
    const { data } = await api.get(`/pacientes/${props.pacienteId}/consultas`)
    historico.value = data
  } catch (err) {
    console.error('[ProntuarioPaciente] Erro ao carregar histórico:', err?.message)
  } finally {
    carregandoHistorico.value = false
  }
}

function statusLabel(s) {
  const mapa = {
    AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', EM_ANDAMENTO: 'Em andamento',
    FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', FALTOU: 'Faltou',
  }
  return mapa[s] ?? s
}

watch(abaAtiva, (aba) => {
  if (aba === 'convenios' && !conveniosCarregados) {
    conveniosCarregados = true
    carregarConvenios()
  }
  if (aba === 'historico' && !historicoCarregado) {
    historicoCarregado = true
    carregarHistorico()
  }
})

onMounted(carregar)
</script>

<template>
  <div class="pron-overlay" @click.self="emit('fechar')">
    <div class="pron-container">

      <!-- Header -->
      <div class="pron-header">
        <div class="pron-header-left">
          <div class="header-avatar">
            {{ paciente?.nome?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div>
            <h2 class="pron-title">{{ paciente?.nome ?? 'Carregando...' }}</h2>
            <p v-if="paciente?.criadoEm" class="pron-subtitle">
              Cadastrado em {{ formatarDataHora(paciente.criadoEm) }}
            </p>
          </div>
        </div>
        <button class="btn-fechar" @click="emit('fechar')">&times;</button>
      </div>

      <!-- Body: sidebar + conteúdo -->
      <div class="pron-body">

        <!-- Sidebar de navegação -->
        <aside class="pron-sidebar">
          <button
            v-for="aba in abas"
            :key="aba.key"
            :class="['side-btn', { active: abaAtiva === aba.key }]"
            @click="abaAtiva = aba.key"
          >
            {{ aba.label }}
          </button>
        </aside>

        <!-- Conteúdo principal -->
        <div class="pron-content">

          <!-- Loading -->
          <div v-if="loading" class="pron-loading">
            <div class="spinner"></div>
            <p>Carregando prontuário...</p>
          </div>

          <template v-else-if="paciente">

            <!-- ── Dados Pessoais ── -->
            <div v-show="abaAtiva === 'pessoais'">

              <div class="card">
                <h3 class="card-title">Identificação</h3>
                <div class="form-grid">
                  <div class="field-group span-2">
                    <label>Nome completo <span class="req">*</span></label>
                    <input v-model="paciente.nome" type="text" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Data de nascimento</label>
                    <input
                      :value="dataNascimentoStr"
                      @input="dataNascimentoStr = mascaraDataInput($event.target.value)"
                      type="text" placeholder="DD/MM/AAAA" maxlength="10"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>Sexo</label>
                    <div class="radio-row">
                      <label class="radio-opt"><input type="radio" v-model="paciente.sexo" value="MASCULINO" /> Masculino</label>
                      <label class="radio-opt"><input type="radio" v-model="paciente.sexo" value="FEMININO" /> Feminino</label>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>CPF</label>
                    <input
                      :value="paciente.cpf"
                      @input="paciente.cpf = mascaraCpf($event.target.value)"
                      type="text" placeholder="000.000.000-00" maxlength="14"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>RG</label>
                    <input
                      :value="paciente.rg"
                      @input="paciente.rg = mascaraRg($event.target.value)"
                      type="text" placeholder="00.000.000-0" maxlength="12"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>CNS</label>
                    <input
                      :value="paciente.cns"
                      @input="paciente.cns = mascaraCns($event.target.value)"
                      type="text" placeholder="000 0000 0000 0000" maxlength="18"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>E-mail</label>
                    <input v-model="paciente.email" type="email" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="card-title">Telefones</h3>
                <div class="form-grid">
                  <div class="field-group">
                    <label>Celular</label>
                    <input
                      :value="paciente.telefone"
                      @input="paciente.telefone = mascaraTelefone($event.target.value)"
                      type="text" placeholder="(00) 00000-0000" maxlength="15"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>Residencial</label>
                    <input
                      :value="paciente.telefoneResidencial"
                      @input="paciente.telefoneResidencial = mascaraTelefone($event.target.value)"
                      type="text" placeholder="(00) 0000-0000" maxlength="14"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group span-2">
                    <label>Trabalho</label>
                    <input
                      :value="paciente.telefoneTrabalho"
                      @input="paciente.telefoneTrabalho = mascaraTelefone($event.target.value)"
                      type="text" placeholder="(00) 0000-0000" maxlength="14"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group span-2">
                    <label class="switch-label">
                      <span>Aceita receber lembretes por SMS</span>
                      <div class="switch">
                        <input type="checkbox" v-model="paciente.aceitaSms" />
                        <span class="slider"></span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="card-title">Endereço</h3>
                <div class="form-grid">
                  <div class="field-group">
                    <label>CEP</label>
                    <input
                      :value="paciente.cep"
                      @input="paciente.cep = mascaraCep($event.target.value)"
                      type="text" placeholder="00000-000" maxlength="9"
                      class="field-input"
                    />
                  </div>
                  <div class="field-group">
                    <label>País</label>
                    <select v-model="paciente.pais" class="field-input">
                      <option value="Brasil">Brasil</option>
                    </select>
                  </div>
                  <div class="field-group span-2">
                    <label>Endereço</label>
                    <input v-model="paciente.endereco" type="text" placeholder="Rua, Avenida..." class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Número</label>
                    <input v-model="paciente.numero" type="text" placeholder="Nº" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Complemento</label>
                    <input v-model="paciente.complemento" type="text" placeholder="Apto, sala..." class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Bairro</label>
                    <input v-model="paciente.bairro" type="text" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Cidade</label>
                    <input v-model="paciente.cidade" type="text" class="field-input" />
                  </div>
                  <div class="field-group span-2">
                    <label>Estado</label>
                    <select v-model="paciente.estado" class="field-input">
                      <option value="">Selecione...</option>
                      <option v-for="uf in ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']" :key="uf" :value="uf">{{ uf }}</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <!-- ── Dados Complementares ── -->
            <div v-show="abaAtiva === 'complementares'">

              <div class="card">
                <h3 class="card-title">Informações Pessoais</h3>
                <div class="form-grid">
                  <div class="field-group">
                    <label>Naturalidade</label>
                    <input v-model="paciente.naturalidade" type="text" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Nacionalidade</label>
                    <select v-model="paciente.nacionalidade" class="field-input">
                      <option value="Brasileiro">Brasileiro</option>
                      <option value="Estrangeiro">Estrangeiro</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Estado Civil</label>
                    <select v-model="paciente.estadoCivil" class="field-input">
                      <option value="">Selecione...</option>
                      <option value="Solteiro">Solteiro(a)</option>
                      <option value="Casado">Casado(a)</option>
                      <option value="Divorciado">Divorciado(a)</option>
                      <option value="Viúvo">Viúvo(a)</option>
                      <option value="União Estável">União Estável</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Etnia</label>
                    <select v-model="paciente.etnia" class="field-input">
                      <option value="">Selecione...</option>
                      <option value="Branca">Branca</option>
                      <option value="Preta">Preta</option>
                      <option value="Parda">Parda</option>
                      <option value="Amarela">Amarela</option>
                      <option value="Indígena">Indígena</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Escolaridade</label>
                    <select v-model="paciente.escolaridade" class="field-input">
                      <option value="">Selecione...</option>
                      <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                      <option value="Fundamental Completo">Fundamental Completo</option>
                      <option value="Médio Incompleto">Médio Incompleto</option>
                      <option value="Médio Completo">Médio Completo</option>
                      <option value="Superior Incompleto">Superior Incompleto</option>
                      <option value="Superior Completo">Superior Completo</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Profissão</label>
                    <input v-model="paciente.profissao" type="text" class="field-input" />
                  </div>
                  <div class="field-group span-2">
                    <label>Religião</label>
                    <input v-model="paciente.religiao" type="text" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="card-title">Observações</h3>
                <div class="field-group">
                  <label>Informações adicionais</label>
                  <textarea v-model="paciente.informacoesAdicionais" rows="4" placeholder="Visíveis para toda a equipe..." class="field-input field-textarea"></textarea>
                </div>
              </div>

              <div class="card">
                <h3 class="card-title">Status</h3>
                <div class="form-grid">
                  <div class="field-group">
                    <label>Situação</label>
                    <select v-model="paciente.ativo" class="field-input">
                      <option :value="true">Ativo</option>
                      <option :value="false">Inativo</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label class="switch-label">
                      <span>Óbito registrado</span>
                      <div class="switch">
                        <input type="checkbox" v-model="paciente.obito" />
                        <span class="slider"></span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            <!-- ── Convênios ── -->
            <div v-show="abaAtiva === 'convenios'">
              <div class="card">

                <!-- Cabeçalho do card -->
                <div class="conv-card-header">
                  <h3 class="card-title" style="margin: 0;">Convênios</h3>
                  <button
                    v-if="!mostrarFormConvenio"
                    class="btn-add-convenio"
                    @click="mostrarFormConvenio = true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Adicionar
                  </button>
                </div>

                <!-- Formulário inline (expansível) -->
                <div v-if="mostrarFormConvenio" class="conv-form">
                  <div class="conv-form-row">
                    <select v-model="novoConvenio.convenioId" class="field-input" :disabled="carregandoConvenios">
                      <option value="">Selecione o convênio...</option>
                      <option v-for="c in conveniosParaVincular" :key="c.id" :value="c.id">{{ c.nome }}</option>
                    </select>
                    <input
                      v-model="novoConvenio.numeroCarteira"
                      type="text"
                      placeholder="Nº da carteirinha (opcional)"
                      class="field-input conv-carteira-input"
                    />
                    <button
                      class="btn-confirmar-conv"
                      @click="vincularConvenio"
                      :disabled="!novoConvenio.convenioId || vinculando"
                    >
                      {{ vinculando ? '...' : 'Confirmar' }}
                    </button>
                    <button
                      class="btn-cancelar-conv"
                      @click="mostrarFormConvenio = false; novoConvenio = { convenioId: '', numeroCarteira: '' }"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <!-- Loading -->
                <div v-if="carregandoConvenios" class="pron-loading" style="padding: 24px 0;">
                  <div class="spinner"></div>
                </div>

                <!-- Erro ao carregar -->
                <div v-else-if="erroConvenios" class="conv-erro">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28" style="color:#f87171;">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>Não foi possível carregar os convênios.<br/>Verifique se o servidor está em execução.</p>
                  <button class="btn-add-convenio" @click="recarregarConvenios">Tentar novamente</button>
                </div>

                <!-- Lista vazia -->
                <div v-else-if="conveniosVinculados.length === 0 && !mostrarFormConvenio" class="empty-card" style="padding: 32px 0; border: none;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32" class="empty-icon">
                    <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
                  </svg>
                  <p>Nenhum convênio vinculado.</p>
                  <button
                    class="btn-add-convenio"
                    style="margin-top: 4px;"
                    @click="mostrarFormConvenio = true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Adicionar convênio
                  </button>
                </div>

                <!-- Lista de vinculados -->
                <ul v-else-if="!carregandoConvenios && !erroConvenios" class="conv-list" :class="{ 'conv-list-mt': mostrarFormConvenio }">
                  <li v-for="c in conveniosVinculados" :key="c.id" class="conv-item">
                    <div class="conv-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
                        <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
                      </svg>
                    </div>
                    <div class="conv-info">
                      <span class="conv-nome">{{ c.nome }}</span>
                      <!-- modo leitura -->
                      <template v-if="editandoConvenioId !== c.id">
                        <button class="conv-carteira-btn" @click="iniciarEdicaoCarteirinha(c)">
                          <span v-if="c.numeroCarteira">{{ c.numeroCarteira }}</span>
                          <span v-else class="conv-sem">Adicionar nº de carteirinha</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </template>
                      <!-- modo edição -->
                      <template v-else>
                        <div class="conv-edit-row">
                          <input
                            v-model="editCarteiraTemp"
                            class="conv-edit-input"
                            placeholder="Nº da carteirinha"
                            @keyup.enter="salvarCarteirinha(c.id)"
                            @keyup.esc="editandoConvenioId = null"
                            autofocus
                          />
                          <button class="conv-edit-save" @click="salvarCarteirinha(c.id)">Salvar</button>
                          <button class="conv-edit-cancel" @click="editandoConvenioId = null">Cancelar</button>
                        </div>
                      </template>
                    </div>
                    <button class="btn-desvincular" @click="desvincularConvenio(c.id)" title="Remover">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </li>
                </ul>

              </div>
            </div>

            <!-- ── Histórico ── -->
            <div v-show="abaAtiva === 'historico'">
              <div class="card">
                <h3 class="card-title">Histórico de Consultas</h3>
                <div v-if="carregandoHistorico" class="pron-loading" style="min-height: 120px;">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="historico.length === 0" class="empty-hist">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" class="empty-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <p>Nenhuma consulta registrada.</p>
                </div>
                <ul v-else class="hist-list">
                  <li v-for="c in historico" :key="c.id" class="hist-item">
                    <div class="hist-meta">
                      <span class="hist-date">{{ formatarDataHora(c.dataInicio) }}</span>
                      <span class="hist-prof">{{ c.profissional?.nome ?? '—' }}</span>
                      <span v-if="c.profissional?.especialidade" class="hist-esp">{{ c.profissional.especialidade.nome }}</span>
                    </div>
                    <span class="hist-badge" :class="c.status?.toLowerCase()">{{ statusLabel(c.status) }}</span>
                  </li>
                </ul>
              </div>
            </div>

          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="pron-footer">
        <button class="btn-excluir" @click="excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Excluir paciente
        </button>
        <div class="footer-actions">
          <button class="btn-cancelar" @click="emit('fechar')">Cancelar</button>
          <button class="btn-salvar" @click="salvar" :disabled="salvando || loading">
            {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </div>

    </div>


  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

/* ── Overlay ── */
.pron-overlay {
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

/* ── Container ── */
.pron-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 920px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.22s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

/* ── Header ── */
.pron-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.pron-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}

.pron-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.pron-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.btn-fechar {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s;
}
.btn-fechar:hover { color: #475569; }

/* ── Body ── */
.pron-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── Sidebar ── */
.pron-sidebar {
  width: 176px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 12px 0;
  overflow-y: auto;
}

.side-btn {
  display: block;
  width: 100%;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  text-align: left;
  padding: 10px 16px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.side-btn:hover { background: #f1f5f9; color: #0f172a; }
.side-btn.active {
  border-left-color: #059669;
  background: #f0fdf4;
  color: #059669;
  font-weight: 600;
}

/* ── Content ── */
.pron-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pron-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #64748b;
  font-size: 14px;
}

/* ── Cards ── */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 14px;
}

.card-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #059669;
  margin: 0 0 16px 0;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
  color: #94a3b8;
  text-align: center;
}
.empty-icon { color: #cbd5e1; }
.empty-card p { margin: 0; font-size: 14px; }

/* ── Form grid ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.span-2 { grid-column: span 2; }

.field-group label {
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  font-family: 'Inter', sans-serif;
}

.req { color: #ef4444; }

.field-input {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
  width: 100%;
}
.field-input:focus {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}
.field-input::placeholder { color: #94a3b8; }

.field-textarea {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
}

/* ── Radio ── */
.radio-row {
  display: flex;
  gap: 16px;
  align-items: center;
  height: 40px;
}

.radio-opt {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
input[type="radio"] { accent-color: #059669; }

/* ── Switch ── */
.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500 !important;
  color: #475569 !important;
  font-size: 13px !important;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 20px;
  transition: 0.2s;
}
.slider:before {
  position: absolute; content: "";
  height: 14px; width: 14px;
  left: 3px; bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}
input:checked + .slider { background: #059669; }
input:checked + .slider:before { transform: translateX(16px); }

/* ── Footer ── */
.pron-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-excluir {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0;
}
.btn-excluir:hover { color: #dc2626; }

.btn-cancelar {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancelar:hover { background: #e2e8f0; }

.btn-salvar {
  background: #059669;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 13.5px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  transition: all 0.2s;
}
.btn-salvar:hover:not(:disabled) { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Spinner ── */
.spinner {
  width: 26px; height: 26px;
  border: 3px solid rgba(5, 150, 105, 0.12);
  border-radius: 50%;
  border-top-color: #059669;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }


/* ── Convênios ── */
.conv-erro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 0;
  text-align: center;
  color: #64748b;
  font-size: 13.5px;
  line-height: 1.6;
}
.conv-erro p { margin: 0; }

.conv-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.btn-add-convenio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #6ee7b7;
  color: #059669;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-add-convenio:hover {
  background: #dcfce7;
  border-color: #059669;
}

.conv-form {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

.conv-form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.conv-form-row .field-input {
  flex: 1;
  min-width: 160px;
}

.conv-carteira-input {
  max-width: 200px;
}

.btn-confirmar-conv {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 18px;
  height: 40px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;
}
.btn-confirmar-conv:hover:not(:disabled) { background: #047857; }
.btn-confirmar-conv:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-cancelar-conv {
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  padding: 0 8px;
  height: 40px;
  white-space: nowrap;
  transition: color 0.15s;
  flex-shrink: 0;
}
.btn-cancelar-conv:hover { color: #0f172a; }

.conv-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conv-list-mt { margin-top: 4px; }

.conv-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: border-color 0.15s;
}
.conv-item:hover { border-color: #cbd5e1; }

.conv-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(5, 150, 105, 0.08);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.conv-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.conv-nome {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

.conv-carteira {
  font-size: 12px;
  color: #64748b;
}

.conv-sem {
  font-style: italic;
  color: #94a3b8;
}

.conv-carteira-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  font-family: 'Inter', sans-serif;
  transition: color 0.15s;
}
.conv-carteira-btn:hover { color: #059669; }
.conv-carteira-btn .conv-sem { font-style: italic; color: #94a3b8; }
.conv-carteira-btn:hover .conv-sem { color: #059669; }

.conv-edit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.conv-edit-input {
  height: 30px;
  border: 1px solid #059669;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
  width: 160px;
}

.conv-edit-save {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 10px;
  height: 30px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}
.conv-edit-save:hover { background: #047857; }

.conv-edit-cancel {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.15s;
}
.conv-edit-cancel:hover { color: #475569; }

.btn-desvincular {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.btn-desvincular:hover { background: #fef2f2; color: #dc2626; }

/* ── Histórico ── */
.empty-hist {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 0 16px;
  color: #94a3b8;
  text-align: center;
}
.empty-hist p { margin: 0; font-size: 13.5px; }

.hist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: border-color 0.15s;
}
.hist-item:hover { border-color: #cbd5e1; }

.hist-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hist-date {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.hist-prof {
  font-size: 12px;
  color: #475569;
}

.hist-esp {
  font-size: 11.5px;
  color: #94a3b8;
}

.hist-badge {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.hist-badge.agendada     { background: #d1fae5; color: #065f46; }
.hist-badge.confirmada   { background: #dbeafe; color: #1e40af; }
.hist-badge.em_andamento { background: #fef3c7; color: #92400e; }
.hist-badge.finalizada   { background: #ede9fe; color: #5b21b6; }
.hist-badge.cancelada    { background: #fee2e2; color: #991b1b; }
.hist-badge.faltou       { background: #fef9c3; color: #854d0e; }
</style>
