<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { ref, onMounted, computed } from 'vue'
import api from '~/services/api'
import { useMascaras } from '~/composables/useMascaras'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { mascaraCpf, mascaraTelefone, mascaraCep, mascaraRg, mascaraCns } = useMascaras()

const paciente = ref(null)
const loading = ref(true)
const salvando = ref(false)
const abaAtiva = ref('dados-pessoais')
const dataNascimentoStr = ref('')
const excluindo = ref(false)
const { confirmar } = useConfirm()

useHead(computed(() => ({ title: paciente.value ? paciente.value.nome : 'Paciente' })))

function isoParaData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const dia = String(d.getUTCDate()).padStart(2, '0')
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${d.getUTCFullYear()}`
}

function formatarDataHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function mascaraDataInput(v) {
  return String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 10)
}

async function carregarPaciente() {
  loading.value = true
  try {
    const { data } = await api.get(`/pacientes/${route.params.id}`)
    paciente.value = data
    dataNascimentoStr.value = isoParaData(data.dataNascimento)
  } catch {
    toast.erro('Erro ao carregar prontuário.')
  } finally {
    loading.value = false
  }
}

async function salvarPaciente() {
  salvando.value = true
  try {
    await api.put(`/pacientes/${route.params.id}`, {
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

async function excluirPaciente() {
  const ok = await confirmar({
    titulo: 'Excluir Paciente',
    mensagem: 'Tem certeza que deseja excluir',
    nome: paciente.value?.nome,
    aviso: 'Todos os dados serão removidos permanentemente.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  try {
    await api.delete(`/pacientes/${route.params.id}`)
    router.push('/pacientes')
  } catch {
    toast.erro('Erro ao excluir paciente.')
  }
}

function imprimir() { window.print() }

onMounted(carregarPaciente)
</script>

<template>
  <div class="page-wrapper">

    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/pacientes" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </NuxtLink>
        <h1 v-if="paciente" class="patient-title">{{ paciente.nome }}</h1>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Carregando prontuário...</p>
    </div>

    <div v-else-if="paciente" class="clinical-workspace">

      <!-- Sidebar de navegação -->
      <aside class="workspace-sidebar">
        <div class="sidebar-title">Prontuário</div>
        <nav class="sidebar-nav">
          <button @click="abaAtiva = 'dados-pessoais'" :class="['nav-item', { active: abaAtiva === 'dados-pessoais' }]">Dados pessoais</button>
          <button @click="abaAtiva = 'complementares'" :class="['nav-item', { active: abaAtiva === 'complementares' }]">Dados complementares</button>
          <button @click="abaAtiva = 'convenios'" :class="['nav-item', { active: abaAtiva === 'convenios' }]">Convênios</button>
          <button @click="abaAtiva = 'historico'" :class="['nav-item', { active: abaAtiva === 'historico' }]">Histórico de consultas</button>
        </nav>
      </aside>

      <div class="workspace-main-wrapper">
        <main class="workspace-content">
          <div class="form-container">

            <!-- ── Dados Pessoais ── -->
            <div v-if="abaAtiva === 'dados-pessoais'" class="form-section">

              <div class="section-block">
                <h2 class="block-title">Identificação</h2>

                <div class="field-group">
                  <label>Nome completo <span class="obrigatorio">*</span></label>
                  <input type="text" v-model="paciente.nome" class="field-input" />
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label>Data de nascimento</label>
                    <input
                      type="text"
                      :value="dataNascimentoStr"
                      @input="dataNascimentoStr = mascaraDataInput($event.target.value)"
                      placeholder="DD/MM/AAAA"
                      maxlength="10"
                      class="field-input field-sm"
                    />
                  </div>
                  <div class="field-group">
                    <label>Sexo</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="paciente.sexo" value="MASCULINO" /> Masculino
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="paciente.sexo" value="FEMININO" /> Feminino
                      </label>
                    </div>
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label>CPF</label>
                    <input
                      type="text"
                      :value="paciente.cpf"
                      @input="paciente.cpf = mascaraCpf($event.target.value)"
                      placeholder="000.000.000-00"
                      maxlength="14"
                      class="field-input field-md"
                    />
                  </div>
                  <div class="field-group">
                    <label>RG</label>
                    <input
                      type="text"
                      :value="paciente.rg"
                      @input="paciente.rg = mascaraRg($event.target.value)"
                      placeholder="00.000.000-0"
                      maxlength="12"
                      class="field-input field-md"
                    />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label>CNS</label>
                    <input
                      type="text"
                      :value="paciente.cns"
                      @input="paciente.cns = mascaraCns($event.target.value)"
                      placeholder="000 0000 0000 0000"
                      maxlength="18"
                      class="field-input field-md"
                    />
                  </div>
                  <div class="field-group flex-grow">
                    <label>E-mail</label>
                    <input type="email" v-model="paciente.email" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="section-block">
                <h2 class="block-title">Telefones</h2>

                <div class="field-row">
                  <div class="field-group">
                    <label>Celular</label>
                    <input
                      type="text"
                      :value="paciente.telefone"
                      @input="paciente.telefone = mascaraTelefone($event.target.value)"
                      placeholder="(00) 00000-0000"
                      maxlength="15"
                      class="field-input field-md"
                    />
                  </div>
                  <div class="field-group">
                    <label>Residencial</label>
                    <input
                      type="text"
                      :value="paciente.telefoneResidencial"
                      @input="paciente.telefoneResidencial = mascaraTelefone($event.target.value)"
                      placeholder="(00) 0000-0000"
                      maxlength="14"
                      class="field-input field-md"
                    />
                  </div>
                  <div class="field-group">
                    <label>Trabalho</label>
                    <input
                      type="text"
                      :value="paciente.telefoneTrabalho"
                      @input="paciente.telefoneTrabalho = mascaraTelefone($event.target.value)"
                      placeholder="(00) 0000-0000"
                      maxlength="14"
                      class="field-input field-md"
                    />
                  </div>
                </div>

                <div class="sms-row">
                  <label class="switch">
                    <input type="checkbox" v-model="paciente.aceitaSms" />
                    <span class="slider round"></span>
                  </label>
                  <span class="sms-label">Paciente aceita receber lembretes por SMS</span>
                </div>
              </div>

              <div class="section-block">
                <h2 class="block-title">Endereço</h2>

                <div class="field-row">
                  <div class="field-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      :value="paciente.cep"
                      @input="paciente.cep = mascaraCep($event.target.value)"
                      placeholder="00000-000"
                      maxlength="9"
                      class="field-input field-sm"
                    />
                  </div>
                  <div class="field-group">
                    <label>País</label>
                    <select v-model="paciente.pais" class="field-input field-sm">
                      <option value="Brasil">Brasil</option>
                    </select>
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group flex-grow">
                    <label>Endereço</label>
                    <input type="text" v-model="paciente.endereco" placeholder="Rua, Avenida..." class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Número</label>
                    <input type="text" v-model="paciente.numero" placeholder="Nº" class="field-input field-xs" />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label>Complemento</label>
                    <input type="text" v-model="paciente.complemento" placeholder="Apto, sala..." class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Bairro</label>
                    <input type="text" v-model="paciente.bairro" class="field-input" />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label>Cidade</label>
                    <input type="text" v-model="paciente.cidade" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Estado</label>
                    <select v-model="paciente.estado" class="field-input field-sm">
                      <option value="">Selecione...</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Dados Complementares ── -->
            <div v-if="abaAtiva === 'complementares'" class="form-section">

              <div class="section-block">
                <h2 class="block-title">Informações Pessoais</h2>

                <div class="field-row">
                  <div class="field-group">
                    <label>Naturalidade</label>
                    <input type="text" v-model="paciente.naturalidade" class="field-input" />
                  </div>
                  <div class="field-group">
                    <label>Nacionalidade</label>
                    <select v-model="paciente.nacionalidade" class="field-input">
                      <option value="Brasileiro">Brasileiro</option>
                      <option value="Estrangeiro">Estrangeiro</option>
                    </select>
                  </div>
                </div>

                <div class="field-row">
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
                </div>

                <div class="field-row">
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
                    <input type="text" v-model="paciente.profissao" class="field-input" />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field-group flex-grow">
                    <label>Religião</label>
                    <input type="text" v-model="paciente.religiao" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="section-block">
                <h2 class="block-title">Informações Adicionais</h2>
                <div class="field-group">
                  <label>Observações</label>
                  <textarea v-model="paciente.informacoesAdicionais" rows="5" placeholder="Observações visíveis para toda a equipe..." class="field-input field-textarea"></textarea>
                </div>
              </div>

              <div class="section-block">
                <h2 class="block-title">Status</h2>
                <div class="field-row">
                  <div class="field-group">
                    <label>Situação</label>
                    <select v-model="paciente.ativo" class="field-input field-sm">
                      <option :value="true">Ativo</option>
                      <option :value="false">Inativo</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label class="switch-inline">
                      <span>Óbito</span>
                      <label class="switch">
                        <input type="checkbox" v-model="paciente.obito" />
                        <span class="slider round"></span>
                      </label>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Convênios ── -->
            <div v-if="abaAtiva === 'convenios'" class="form-section">
              <div class="empty-section">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                  <rect x="2" y="5" width="20" height="14" rx="3"/>
                  <path d="M2 10h20"/>
                </svg>
                <p>Nenhum convênio vinculado a este paciente.</p>
              </div>
            </div>

            <!-- ── Histórico ── -->
            <div v-if="abaAtiva === 'historico'" class="form-section">
              <div class="empty-section">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <p>Nenhuma consulta registrada.</p>
              </div>
            </div>

          </div>

          <!-- Coluna direita: avatar + ações rápidas -->
          <div class="photo-sidebar">
            <div class="avatar-block">
              <div class="avatar-circle">
                {{ paciente.nome?.charAt(0).toUpperCase() }}
              </div>
              <div class="avatar-info">
                <p class="avatar-name">{{ paciente.nome }}</p>
                <p class="avatar-id">ID #{{ paciente.id }}</p>
              </div>
            </div>

            <button class="btn-print" @click="imprimir">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir ficha
            </button>

            <span v-if="paciente.criadoEm" class="creation-stamp">
              Cadastrado em {{ formatarDataHora(paciente.criadoEm) }}
            </span>
          </div>
        </main>

        <footer class="workspace-footer">
          <button @click="excluirPaciente" class="btn-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Excluir paciente
          </button>
          <div class="footer-actions">
            <NuxtLink to="/pacientes" class="btn-cancelar">Cancelar</NuxtLink>
            <button @click="salvarPaciente" class="btn-salvar" :disabled="salvando">
              {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </footer>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper {
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  padding: 14px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-link {
  color: #059669;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.back-link:hover { color: #047857; }

.patient-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Workspace */
.clinical-workspace {
  display: flex;
  flex: 1;
}

/* Sidebar */
.workspace-sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding-top: 20px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  padding: 0 16px 10px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
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
.nav-item:hover { background: #f8fafc; color: #0f172a; }
.nav-item.active {
  border-left-color: #059669;
  background: #f0fdf4;
  color: #059669;
  font-weight: 600;
}

/* Main area */
.workspace-main-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.workspace-content {
  display: flex;
  padding: 28px 32px;
  gap: 32px;
  flex: 1;
  align-items: flex-start;
}

.form-container {
  flex: 1;
  min-width: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Section blocks */
.section-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.block-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #059669;
  margin: 0 0 16px 0;
}

/* Field layout */
.field-row {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.flex-grow { flex: 1; }

.field-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.obrigatorio { color: #ef4444; }

/* Inputs */
.field-input {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 10px;
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
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}

.field-input.field-xs { width: 72px; }
.field-input.field-sm { width: 140px; }
.field-input.field-md { width: 185px; }

.field-input.field-textarea {
  height: auto;
  padding: 10px;
  resize: vertical;
  line-height: 1.5;
}

/* Radio */
.radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
  height: 38px;
}

.radio-label {
  font-size: 13px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
}

input[type="radio"] { accent-color: #059669; }

/* SMS switch */
.sms-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.sms-label {
  font-size: 13px;
  color: #475569;
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
  top: 0; left: 0; right: 0; bottom: 0;
  background: #cbd5e1; transition: .2s; border-radius: 20px;
}
.slider:before {
  position: absolute; content: "";
  height: 14px; width: 14px; left: 3px; bottom: 3px;
  background: white; transition: .2s; border-radius: 50%;
}
input:checked + .slider { background: #059669; }
input:checked + .slider:before { transform: translateX(16px); }

.switch-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

/* Photo sidebar */
.photo-sidebar {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.avatar-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(5,150,105,0.1);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 800;
}

.avatar-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  word-break: break-word;
}

.avatar-id {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.btn-print {
  width: 100%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}
.btn-print:hover { background: #e2e8f0; color: #1e293b; }

.creation-stamp {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  line-height: 1.4;
}

/* Empty state */
.empty-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  text-align: center;
}
.empty-section p { margin: 0; font-size: 14px; }

/* Footer */
.workspace-footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-delete {
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
}
.btn-delete:hover { color: #dc2626; }

.footer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
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
  box-shadow: 0 4px 12px rgba(5,150,105,0.2);
  transition: all 0.2s;
}
.btn-salvar:hover:not(:disabled) { background: #047857; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

/* Loading */
.state-card {
  padding: 80px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid rgba(5,150,105,0.1);
  border-radius: 50%;
  border-top-color: #059669;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

</style>
