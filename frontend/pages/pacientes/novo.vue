<script setup>
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '~/services/api'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const abaAtiva = ref('dados-pessoais')

// Identifica se estamos em modo de criação ou edição
const isNovo = computed(() => !route.params.id || route.params.id === 'novo')

// Estado unificado do formulário conforme os campos das imagens
const form = ref({
  nome: '', 
  dataNascimento: '', 
  sexo: 'Masculino', 
  email: '', 
  cpf: '', 
  rg: '',
  comoConheceu: '', 
  celular: '', 
  casa: '', 
  trabalho: '', 
  aceitaSms: true,
  cep: '', 
  endereco: '', 
  numero: '', 
  complemento: '', 
  bairro: '', 
  cidade: '', 
  estado: '', 
  pais: 'Brasil',
  // Dados complementares
  naturalidade: '', 
  estadoComplementar: '', 
  nacionalidade: 'Brasileiro', 
  etnia: '', 
  religiao: '', 
  estadoCivil: '', 
  escolaridade: '', 
  profissao: '',
  obito: false, 
  ativo: true,
  // Outras informações
  cns: '', 
  informacoesAdicionais: ''
})

async function carregarDados() {
  if (isNovo.value || !route.params.id) return 
  try {
    loading.value = true
    const { data } = await api.get(`/pacientes/${route.params.id}`)
    form.value = { ...form.value, ...data }
  } catch (error) {
    console.error('Erro ao carregar paciente:', error)
  } finally {
    loading.value = false
  }
}

onMounted(carregarDados)

async function salvarPaciente() {
  loading.value = true
  try {
    if (isNovo.value) {
      await api.post('/pacientes', form.value)
    } else {
      await api.put(`/pacientes/${route.params.id}`, form.value)
    }
    router.push('/pacientes')
  } catch (error) {
    alert('Erro ao salvar paciente')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/pacientes" class="back-link">←</NuxtLink>
        <h1 class="patient-title">
          {{ isNovo ? 'ADICIONAR PACIENTE' : form.nome.toUpperCase() }}
        </h1>
      </div>
    </div>

    <div class="clinical-workspace">
      <aside class="workspace-sidebar">
        <div class="sidebar-title">Cadastros</div>
        <nav class="sidebar-nav">
          <button type="button" @click="abaAtiva = 'dados-pessoais'" :class="{ active: abaAtiva === 'dados-pessoais' }" class="nav-item">Dados pessoais</button>
          <button type="button" @click="abaAtiva = 'complementares'" :class="{ active: abaAtiva === 'complementares' }" class="nav-item">Dados complementares</button>
          <button type="button" @click="abaAtiva = 'convenios'" :class="{ active: abaAtiva === 'convenios' }" class="nav-item">Convênios</button>
          <button type="button" @click="abaAtiva = 'historico'" :class="{ active: abaAtiva === 'historico' }" class="nav-item">Histórico de consultas</button>
        </nav>
      </aside>

      <main class="workspace-content">
        <div class="form-container" :class="{ 'full-width-container': abaAtiva !== 'dados-pessoais' }">
          
          <div v-if="abaAtiva === 'dados-pessoais'" class="width-fill-parent">
            <div class="section-block">
              <h2 class="block-title">Geral</h2>
              
              <div class="form-row">
                <div class="form-group flex-8">
                  <label class="required">Nome</label>
                  <input v-model="form.nome" type="text" class="clinical-input text-field-large" />
                </div>
                <div class="form-group flex-4">
                  <label>Código</label>
                  <input type="text" disabled class="clinical-input code-input" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="required">Data de nasc.</label>
                  <input v-model="form.dataNascimento" type="text" placeholder="__/__/____" class="clinical-input small-input" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="required">Sexo</label>
                  <div class="radio-group">
                    <label class="radio-label"><input type="radio" value="Masculino" v-model="form.sexo" /> Masculino</label>
                    <label class="radio-label"><input type="radio" value="Feminino" v-model="form.sexo" /> Feminino</label>
                  </div>
                </div>
              </div>

              <div class="form-row option-row row-spacing-tight">
                <div class="check-group">
                  <input type="checkbox" id="chk-nome-civil" />
                  <label class="radio-label" for="chk-nome-civil">Nome civil <span class="info-icon">i</span></label>
                </div>
              </div>

              <div class="form-row option-row">
                <div class="check-group">
                  <input type="checkbox" id="chk-genero" />
                  <label class="radio-label" for="chk-genero">Gênero (opcional) para o paciente <span class="info-icon">i</span></label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-12">
                  <label>E-mail</label>
                  <input v-model="form.email" type="email" class="clinical-input text-field-large" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>CPF</label>
                  <input v-model="form.cpf" type="text" placeholder="___.___.___-__" class="clinical-input medium-input" />
                </div>
                <div class="form-group">
                  <label style="width: auto; padding-right: 14px;">RG</label>
                  <input v-model="form.rg" type="text" class="clinical-input medium-input" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Como conheceu?</label>
                  <select v-model="form.comoConheceu" class="clinical-select large-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="block-title">Telefones</h2>
              <div class="form-row">
                <div class="form-group">
                  <label class="required">Celular</label>
                  <input v-model="form.celular" type="text" placeholder="(__) _____-____" class="clinical-input medium-input" />
                </div>
                <div class="form-group">
                  <label style="width: auto; padding-right: 14px;" class="required">Casa</label>
                  <input v-model="form.casa" type="text" placeholder="(__) ____-____" class="clinical-input medium-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Trabalho</label>
                  <input v-model="form.trabalho" type="text" placeholder="(__) ____-____" class="clinical-input medium-input" />
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="block-title">Lembrete de Agendamento</h2>
              <div class="form-row option-row">
                <div class="switch-row">
                  <label class="switch">
                    <input type="checkbox" v-model="form.aceitaSms" />
                    <span class="slider round"></span>
                  </label>
                  <span class="switch-label">Paciente aceita receber lembrete de agendamento por SMS</span>
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="block-title">Endereço</h2>
              <div class="form-row">
                <div class="form-group">
                  <label>CEP</label>
                  <input v-model="form.cep" type="text" placeholder="_____-___" class="clinical-input medium-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group flex-8">
                  <label>Endereço</label>
                  <input v-model="form.endereco" type="text" class="clinical-input" />
                </div>
                <div class="form-group flex-4">
                  <label style="width: auto; padding-right: 14px;">Número</label>
                  <input v-model="form.numero" type="text" class="clinical-input small-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Complemento</label>
                  <input v-model="form.complemento" type="text" class="clinical-input" />
                </div>
                <div class="form-group flex-6">
                  <label style="width: auto; padding-right: 14px;">Bairro</label>
                  <input v-model="form.bairro" type="text" class="clinical-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Cidade</label>
                  <input v-model="form.cidade" type="text" class="clinical-input" />
                </div>
                <div class="form-group flex-6">
                  <label style="width: auto; padding-right: 14px;">Estado</label>
                  <select v-model="form.estado" class="clinical-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>País</label>
                  <select v-model="form.pais" class="clinical-select medium-input">
                    <option value="Brasil">Brasil</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div v-if="abaAtiva === 'complementares'" class="width-fill-parent">
            <div class="section-block">
              <h2 class="block-title">Dados Complementares</h2>
              
              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Naturalidade</label>
                  <input v-model="form.naturalidade" type="text" class="clinical-input" />
                </div>
                <div class="form-group flex-6">
                  <label>Estado</label>
                  <select v-model="form.estadoComplementar" class="clinical-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Nacionalidade</label>
                  <select v-model="form.nacionalidade" class="clinical-select">
                    <option value="Brasileiro">Brasileiro</option>
                  </select>
                </div>
                <div class="form-group flex-6">
                  <label>Etnia</label>
                  <select v-model="form.etnia" class="clinical-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Religião</label>
                  <input v-model="form.religiao" type="text" class="clinical-input" />
                </div>
                <div class="form-group flex-6">
                  <label>Estado civil</label>
                  <select v-model="form.estadoCivil" class="clinical-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-6">
                  <label>Escolaridade</label>
                  <select v-model="form.escolaridade" class="clinical-select">
                    <option value="">Selecione...</option>
                  </select>
                </div>
                <div class="form-group flex-6">
                  <label>Profissão</label>
                  <input v-model="form.profissao" type="text" class="clinical-input" />
                </div>
              </div>

              <div class="form-row option-row row-spacing-tight">
                <div class="check-group">
                  <input type="checkbox" id="chk-obito" v-model="form.obito" />
                  <label class="radio-label" for="chk-obito">Óbito</label>
                </div>
              </div>

              <div class="form-row option-row">
                <div class="check-group">
                  <input type="checkbox" id="chk-ativo" v-model="form.ativo" />
                  <label class="radio-label required" for="chk-ativo">Ativo</label>
                </div>
              </div>
            </div>

            <div class="section-block">
              <h2 class="block-title">Dados Familiares</h2>
              <div class="family-row-layout">
                <div class="form-group search-input-wrapper">
                  <label>Nome</label>
                  <div class="input-with-icon">
                    <input type="text" class="clinical-input" />
                    <span class="search-inside-icon">🔍</span>
                  </div>
                </div>
                <div class="form-group search-input-wrapper">
                  <label class="label-center">Parentesco</label>
                  <div class="input-with-icon">
                    <input type="text" class="clinical-input" />
                    <span class="search-inside-icon">🔍</span>
                  </div>
                </div>
                <div class="form-group search-input-wrapper">
                  <label>Profissão</label>
                  <input type="text" class="clinical-input" />
                </div>
                <button type="button" class="btn-blue-action">⚙️ ADICIONAR</button>
              </div>
            </div>

            <div class="section-block">
              <h2 class="block-title">Outras Informações</h2>
              <div class="form-row">
                <div class="form-group flex-12">
                  <label>CNS</label>
                  <input v-model="form.cns" type="text" class="clinical-input cns-large-input" />
                </div>
              </div>
              <div class="form-row align-items-start">
                <label class="textarea-label">Informações adicionais</label>
                <div class="textarea-container">
                  <textarea v-model="form.informacoesAdicionais" class="clinical-textarea"></textarea>
                  <span class="textarea-helper">* Esta informação será visível para todos.</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="abaAtiva === 'convenios'" class="width-fill-parent">
            <div class="section-block">
              <h2 class="block-title">Convênios</h2>
              <div class="grid-action-header-row">
                <div class="dropdown-placeholder-btn">
                  <span class="gear-icon">⚙️</span>
                  <span class="arrow-down-small">▼</span>
                </div>
                <button type="button" class="btn-add-grid-item">➕ ADICIONAR CONVÊNIO</button>
              </div>
              <div class="table-scroller-wrap">
                <table class="iclinic-legacy-grid">
                  <thead>
                    <tr>
                      <th class="col-check-th"><input type="checkbox" /></th>
                      <th class="text-left-th">Convênio</th>
                      <th class="text-left-th">Plano</th>
                      <th class="text-left-th">Matrícula</th>
                      <th class="text-left-th">Validade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="5" class="empty-history-cell">Nenhum convênio cadastrado para este paciente.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="abaAtiva === 'historico'" class="width-fill-parent">
            <div class="section-block">
              <h2 class="block-title">Histórico de Consultas</h2>
              <p class="history-helper-text">Agendamentos realizados na plataforma MedAgenda.</p>
              <div class="table-scroller-wrap">
                <table class="iclinic-legacy-grid text-sm-rows">
                  <thead>
                    <tr>
                      <th class="header-padding-history text-left-th">Data/Hora</th>
                      <th class="header-padding-history text-left-th">Profissional</th>
                      <th class="header-padding-history text-left-th">Procedimento</th>
                      <th class="header-padding-history text-left-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="history-row-hover">
                      <td class="cell-padding-history text-muted-color">03/06/2026 14:00</td>
                      <td class="cell-padding-history text-muted-color">Dr. Cristiano Costa</td>
                      <td class="cell-padding-history text-muted-color">Consulta de Retorno</td>
                      <td class="cell-padding-history text-status-success">Atendido</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        <div v-if="abaAtiva === 'dados-pessoais'" class="photo-sidebar">
          <div class="avatar-big-wrap">
            <div class="avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"/>
              </svg>
            </div>
            <div class="photo-info">
              <h3>Imagem de perfil</h3>
              <p>Sua imagem deve ter no máximo 250x250px e 1MB.</p>
              <button type="button" class="btn-outline-action">EDITAR FOTO</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div class="workspace-footer">
      <div class="footer-left-actions">
        <button v-if="!isNovo" type="button" class="btn-delete-action">🗑️ Excluir</button>
      </div>
      <div class="footer-save-actions">
        <button type="button" class="btn-secondary-action">Salvar e adicionar outro</button>
        <button type="button" class="btn-secondary-action">Salvar e continuar editando</button>
        <button type="button" @click="salvarPaciente" class="btn-primary-save" :disabled="loading">
          {{ loading ? 'SALVANDO...' : 'SALVAR' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset e Estrutura Legada iClinic */
.page-wrapper {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-link {
  color: #0066cc;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-weight: bold;
}

.patient-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  letter-spacing: 0.5px;
}

.clinical-workspace {
  display: flex;
  flex: 1;
}

.workspace-sidebar {
  width: 210px;
  background: #fdfdfd;
  border-right: 1px solid #e2e8f0;
  padding-top: 16px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  padding: 0 18px 8px 18px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  color: #0066cc;
  cursor: pointer;
}
.nav-item.active {
  background-color: #eaeef3;
  color: #334155;
  font-weight: bold;
}

.workspace-content {
  display: flex;
  padding: 24px 32px;
  gap: 32px;
  flex: 1;
}

.form-container {
  flex: 1;
  max-width: 960px;
}

.full-width-container {
  max-width: 100% !important;
}

.section-block {
  margin-bottom: 32px;
}

.width-fill-parent {
  width: 100%;
}

.block-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #0066cc;
  margin-bottom: 24px;
  letter-spacing: 0.3px;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 4px;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  align-items: center;
}

.align-items-start {
  align-items: flex-start !important;
}

.flex-4  { flex: 4; }
.flex-6  { flex: 6; }
.flex-8  { flex: 8; }
.flex-12 { flex: 12; }

.form-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.form-group label {
  width: 130px;
  font-size: 12px;
  color: #334155;
  text-align: right;
  padding-right: 14px;
  flex-shrink: 0;
}

.form-group label.required::after {
  content: "*";
  color: #cc0000;
  margin-left: 2px;
}

.clinical-input, .clinical-select {
  height: 30px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #334155;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
}

.text-field-large { max-width: 420px; }
.large-select { max-width: 320px; }
.small-input { max-width: 120px; }
.medium-input { max-width: 200px; }
.code-input { max-width: 70px; text-align: center; background-color: #fafafa; }
.cns-large-input { max-width: 320px; }

.input-with-icon {
  position: relative;
  width: 100%;
}
.input-with-icon .clinical-input {
  padding-right: 28px;
}
.search-inside-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #94a3b8;
}

.info-icon {
  margin-left: 4px;
  font-size: 11px;
  color: #0066cc;
  background: #f1f5f9;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.radio-group { display: flex; gap: 12px; }
.radio-label {
  font-size: 12px; color: #334155; display: flex;
  align-items: center; gap: 4px; cursor: pointer;
}

.option-row { padding-left: 130px; }
.row-spacing-tight { margin-bottom: 4px; }

.check-group { display: flex; align-items: center; gap: 4px; }
.check-group label { width: auto; text-align: left; padding-right: 0; }

.grid-action-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.dropdown-placeholder-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
}

.gear-icon { font-size: 14px; color: #64748b; }
.arrow-down-small { font-size: 8px; color: #94a3b8; }

.btn-add-grid-item {
  background-color: #0066cc;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  height: 30px;
  padding: 0 20px;
}

.table-scroller-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.iclinic-legacy-grid {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.iclinic-legacy-grid th {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  padding: 10px 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-left-th { text-align: left; }
.col-check-th { width: 40px; text-align: center; }

.iclinic-legacy-grid td {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
  vertical-align: middle;
}

.history-helper-text {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
}

.text-sm-rows td { font-size: 12px !important; }
.text-muted-color { color: #475569; }
.text-status-success { color: #15803d; font-weight: 500; }
.empty-history-cell { text-align: center; color: #94a3b8; font-style: italic; padding: 24px !important; }

.family-row-layout { display: flex; align-items: center; gap: 16px; width: 100%; }
.family-row-layout .search-input-wrapper { flex: 1; }
.family-row-layout .search-input-wrapper label { width: 70px; text-align: right; padding-right: 8px; }

.btn-blue-action {
  height: 30px; background-color: #0066cc; color: #ffffff; border: none;
  border-radius: 4px; padding: 0 14px; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; white-space: nowrap;
}

.textarea-label {
  width: 130px; font-size: 12px; color: #334155; text-align: right;
  padding-right: 14px; flex-shrink: 0; margin-top: 6px;
}

.textarea-container { display: flex; flex-direction: column; width: 100%; max-width: 600px; }
.clinical-textarea {
  width: 100%; height: 120px; border: 1px solid #cccccc; border-radius: 4px;
  padding: 8px; font-size: 12px; color: #334155; font-family: inherit; resize: vertical; box-sizing: border-box;
}
.textarea-helper { font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 4px; }

.switch-row { display: flex; align-items: center; gap: 12px; }
.switch-label { font-size: 12px; color: #64748b; }
.switch { position: relative; display: inline-block; width: 34px; height: 18px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .2s; border-radius: 18px; }
.slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
input:checked + .slider { background-color: #ea580c; }
input:checked + .slider:before { transform: translateX(16px); }

.photo-sidebar { width: 260px; display: flex; flex-direction: column; padding-top: 20px; }
.avatar-big-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
.avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; background-color: #e2e8f0; color: #94a3b8; display: flex; align-items: center; justify-content: center; }
.avatar-placeholder svg { width: 50px; height: 50px; }
.photo-info h3 { font-size: 13px; font-weight: 600; color: #475569; margin: 4px 0; }
.photo-info p { font-size: 11px; color: #94a3b8; margin: 0 0 12px 0; max-width: 180px; }
.btn-outline-action { background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 11px; border-radius: 4px; color: #0066cc; font-weight: 600; }

.workspace-footer {
  background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 24px;
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; bottom: 0; z-index: 10;
}
.btn-delete-action { background: transparent; border: none; color: #64748b; font-size: 12px; }
.btn-delete-action:hover { color: #cc0000; }
.footer-save-actions { display: flex; gap: 8px; }
.btn-secondary-action { background: #ffffff; border: 1px solid #cccccc; border-radius: 4px; padding: 6px 12px; font-size: 11px; font-weight: 500; color: #334155; }
.btn-primary-save { background: #0066cc; border: none; border-radius: 4px; padding: 6px 20px; font-size: 11px; font-weight: 700; color: #ffffff; }
.btn-primary-save:disabled { background-color: #94a3b8; }
</style>