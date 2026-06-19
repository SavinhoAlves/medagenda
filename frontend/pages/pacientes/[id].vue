<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const paciente = ref(null)
const loading = ref(true)
const abaAtiva = ref('dados-pessoais')

useHead(computed(() => ({ title: paciente.value ? paciente.value.nome : 'Paciente' })))
const toast = useToast()

// --- Modal Excluir ---
const exibirModalExcluir = ref(false)
const excluindo = ref(false)
function abrirModalExcluir() { exibirModalExcluir.value = true }
function fecharModalExcluir() { exibirModalExcluir.value = false }

async function carregarPaciente() {
  try {
    loading.value = true
    
    // 2. Recupera o token da store ou do localStorage como plano de contingência (F5)
    const token = authStore.accessToken || authStore.token || localStorage.getItem('token')

    // 3. Passa o cabeçalho Authorization com o Bearer Token
    const response = await api.get(`/pacientes/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    paciente.value = response.data
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
  } finally {
    loading.value = false
  }
}

async function salvarPaciente() {
  try {
    const token = authStore.accessToken || authStore.token || localStorage.getItem('token')
    
    await api.put(`/pacientes/${route.params.id}`, paciente.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    toast.sucesso('Alterações salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar paciente:', error)
  }
}

async function excluirPaciente() {
  try {
    excluindo.value = true
    const token = authStore.accessToken || authStore.token || localStorage.getItem('token')
    await api.delete(`/pacientes/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    router.push('/pacientes')
  } catch (error) {
    console.error('Erro ao excluir paciente:', error)
    fecharModalExcluir()
  } finally {
    excluindo.value = false
  }
}

onMounted(() => {
  carregarPaciente()
})
</script>

<template>
  <div class="page-wrapper">
    
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/pacientes" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </NuxtLink>
        <h1 v-if="paciente" class="patient-title">{{ paciente.nome }}</h1>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Acessando ficha clínica do paciente...</p>
    </div>

    <div v-else-if="paciente" class="clinical-workspace">
      
      <aside class="workspace-sidebar">
        <div class="sidebar-title">Cadastros</div>
        <nav class="sidebar-nav">
          <button @click="abaAtiva = 'dados-pessoais'" :class="['nav-item', { active: abaAtiva === 'dados-pessoais' }]">
            Dados pessoais
          </button>
          <button @click="abaAtiva = 'complementares'" :class="['nav-item', { active: abaAtiva === 'complementares' }]">
            Dados complementares
          </button>
          <button @click="abaAtiva = 'convenios'" :class="['nav-item', { active: abaAtiva === 'convenios' }]">
            Convênios
          </button>
          <button @click="abaAtiva = 'historico'" :class="['nav-item', { active: abaAtiva === 'historico' }]">
            Histórico de consultas
          </button>
        </nav>
      </aside>

      <div class="workspace-main-wrapper">
        <main class="workspace-content">
          <div class="form-container">
            
            <div v-if="abaAtiva === 'dados-pessoais'" class="form-section">
              
              <div class="section-block">
                <h2 class="block-title">Geral</h2>
                
                <div class="form-row">
                  <div class="form-group flex-8">
                    <label class="required">Nome</label>
                    <input type="text" v-model="paciente.nome" class="clinical-input">
                  </div>
                  <div class="form-group flex-4 align-right-row">
                    <label>Código</label>
                    <input type="text" :value="668598 + (paciente.id || 0)" disabled class="clinical-input code-input">
                    <span class="info-icon" title="Código interno">ℹ</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-5">
                    <label class="required">Data de nasc.</label>
                    <input type="text" placeholder="16/03/1977" class="clinical-input small-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-12">
                    <label class="required">Sexo</label>
                    <div class="radio-group">
                      <label class="radio-label"><input type="radio" name="sexo" checked> Masculino</label>
                      <label class="radio-label"><input type="radio" name="sexo"> Feminino</label>
                    </div>
                  </div>
                </div>

                <div class="form-row option-row">
                  <div class="form-group flex-12 check-group">
                    <input type="checkbox" id="nome-civil">
                    <label for="nome-civil">Nome civil <span class="info-icon">ℹ</span></label>
                  </div>
                </div>

                <div class="form-row option-row">
                  <div class="form-group flex-12 check-group">
                    <input type="checkbox" id="genero-opc">
                    <label for="genero-opc">Gênero (opcional) para o paciente <span class="info-icon">ℹ</span></label>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-7">
                    <label>E-mail</label>
                    <input type="email" v-model="paciente.email" class="clinical-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-6">
                    <label>CPF</label>
                    <input type="text" v-model="paciente.cpf" placeholder="___.___.___-__" class="clinical-input medium-input">
                  </div>
                  <div class="form-group flex-6 align-right-row">
                    <label>RG</label>
                    <input type="text" class="clinical-input medium-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-7">
                    <label>Como conheceu?</label>
                    <select class="clinical-select">
                      <option value="">Selecione...</option>
                    </select>
                  </div>
                </div>

              </div>

              <div class="section-block">
                <h2 class="block-title">Telefones</h2>
                
                <div class="form-row">
                  <div class="form-group flex-5">
                    <label class="required">Celular</label>
                    <input type="text" v-model="paciente.telefone" placeholder="(22) 98133-0080" class="clinical-input medium-input">
                  </div>
                  <div class="form-group flex-7 align-right-row">
                    <label class="required">Casa</label>
                    <input type="text" placeholder="(__) ____-____" class="clinical-input medium-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-5">
                    <label>Trabalho</label>
                    <input type="text" placeholder="(__) ____-____" class="clinical-input medium-input">
                  </div>
                </div>

              </div>

              <div class="section-block">
                <h2 class="block-title">Lembrete de Agendamento</h2>
                
                <div class="form-row option-row switch-row">
                  <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                  </label>
                  <span class="switch-label">Paciente aceita receber lembrete de agendamento por SMS</span>
                </div>
                
                <div class="form-row option-row success-row">
                  <span class="check-mark">✓</span>
                  <span class="success-label">Seus pacientes podem responder o SMS</span>
                </div>
              </div>

              <div class="section-block">
                <h2 class="block-title">Endereço</h2>
                
                <div class="form-row">
                  <div class="form-group flex-5">
                    <label>CEP</label>
                    <input type="text" placeholder="_____-___" class="clinical-input small-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-9">
                    <label>Endereço</label>
                    <input type="text" class="clinical-input">
                  </div>
                  <div class="form-group flex-3 align-right-row">
                    <label>Número</label>
                    <input type="text" class="clinical-input code-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-6">
                    <label>Complemento</label>
                    <input type="text" class="clinical-input">
                  </div>
                  <div class="form-group flex-6 align-right-row">
                    <label>Bairro</label>
                    <input type="text" class="clinical-input">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-6">
                    <label>Cidade</label>
                    <input type="text" class="clinical-input">
                  </div>
                  <div class="form-group flex-6 align-right-row">
                    <label>Estado</label>
                    <select class="clinical-select state-select">
                      <option value=""></option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group flex-6">
                    <label>País</label>
                    <select class="clinical-select state-select">
                      <option value="Brasil">Brasil</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div class="photo-sidebar">
            <div class="avatar-big-wrap">
              <div class="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="photo-info">
                <h3>Imagem de perfil</h3>
                <p>Sua imagem deve ter no máximo 250x250px e 1MB.</p>
                <button class="btn-outline-action">EDITAR FOTO</button>
              </div>
            </div>

            <button class="btn-print" @click="window.print()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              IMPRIMIR
            </button>
            <span class="creation-stamp">Paciente cadastrado em 02/09/2024 às 16:41</span>
          </div>
        </main>

        <footer class="workspace-footer">
          <button @click="abrirModalExcluir" class="btn-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            EXCLUIR
          </button>
          <div class="footer-save-actions">
            <button @click="salvarPaciente" class="btn-secondary-action">SALVAR E ADICIONAR OUTRO</button>
            <button @click="salvarPaciente" class="btn-secondary-action">SALVAR E CONTINUAR EDITANDO</button>
            <button @click="salvarPaciente" class="btn-primary-save">SALVAR</button>
          </div>
        </footer>
      </div>

    </div>

    <!-- Modal: Confirmar Exclusão -->
    <div v-if="exibirModalExcluir" class="modal-overlay" @click.self="fecharModalExcluir">
      <div class="modal-confirm">
        <div class="modal-confirm-header">
          <h2>Excluir Paciente</h2>
          <button class="btn-fechar" @click="fecharModalExcluir">&times;</button>
        </div>
        <div class="modal-confirm-body">
          <div class="excluir-content">
            <div class="excluir-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="26" height="26">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p>Tem certeza que deseja excluir <strong>{{ paciente?.nome }}</strong>? Todos os dados serão removidos permanentemente.</p>
          </div>
          <div class="modal-confirm-footer">
            <button class="btn-cancelar-modal" @click="fecharModalExcluir" :disabled="excluindo">Cancelar</button>
            <button class="btn-excluir-modal" @click="excluirPaciente" :disabled="excluindo">
              {{ excluindo ? 'Excluindo...' : 'Sim, excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Layout Geral */
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
}

.patient-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  margin: 0;
}

/* Divisão do Workspace */
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
}

/* Área de Formulário Principal */
.workspace-main-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.workspace-content {
  display: flex;
  padding: 24px 32px;
  gap: 32px;
  flex: 1;
}

.form-container {
  flex: 1;
  max-width: 900px;
}

.section-block {
  margin-bottom: 32px;
}

.block-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #0066cc;
  margin-bottom: 24px;
  letter-spacing: 0.3px;
}

/* Grid de Linhas Alinhadas Horizontalmente */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  align-items: center;
}

.flex-3  { flex: 3; }
.flex-4  { flex: 4; }
.flex-5  { flex: 5; }
.flex-6  { flex: 6; }
.flex-7  { flex: 7; }
.flex-8  { flex: 8; }
.flex-9  { flex: 9; }
.flex-12 { flex: 12; }

.form-group {
  display: flex;
  align-items: center;
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

.align-right-row {
  justify-content: flex-end;
}
.align-right-row label {
  width: auto;
}

/* Inputs Padronizados iClinic */
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

.small-input { max-width: 160px; }
.medium-input { max-width: 200px; }
.code-input { max-width: 70px; text-align: center; }
.state-select { max-width: 80px; }

.info-icon {
  margin-left: 6px;
  font-size: 11px;
  color: #0066cc;
  background: #f1f5f9;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

/* Componentes de Seleção Opcionais */
.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  font-size: 12px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.option-row {
  padding-left: 130px;
}

.check-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.check-group input { margin: 0; }
.check-group label {
  width: auto;
  text-align: left;
  padding-right: 0;
  display: flex;
  align-items: center;
}

/* Módulo de SMS e Toggle Slider */
.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.switch-label {
  font-size: 12px;
  color: #64748b;
}

.success-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #16a34a;
  font-size: 12px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
  flex-shrink: 0;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1; transition: .2s;
}
.slider:before {
  position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px;
  background-color: white; transition: .2s;
}
input:checked + .slider { background-color: #ea580c; }
input:checked + .slider:before { transform: translateX(16px); }
.slider.round { border-radius: 18px; }
.slider.round:before { border-radius: 50%; }

/* Foto / Impressão Direita */
.photo-sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-big-wrap {
  display: flex;
  gap: 10px;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-placeholder svg { width: 28px; height: 28px; }

.photo-info h3 { font-size: 11.5px; font-weight: 600; color: #475569; margin: 0 0 2px 0; }
.photo-info p { font-size: 10px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.3; }

.btn-outline-action {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 4px 8px;
  font-size: 10.5px;
  border-radius: 4px;
  color: #0066cc;
  cursor: pointer;
}

.btn-print {
  width: 100%;
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.creation-stamp {
  font-size: 10.5px;
  color: #64748b;
  text-align: center;
}

/* Rodapé de Ações Inferior Fixo */
.workspace-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-delete {
  background: none;
  border: none;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  text-transform: uppercase;
}
.btn-delete:hover { color: #dc2626; }

.footer-save-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary-action {
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
}

.btn-primary-save {
  background: #0066cc;
  border: none;
  border-radius: 4px;
  padding: 6px 20px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
}

/* Spinner */
.state-card { padding: 60px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(0,102,204,0.1); border-radius: 50%; border-top-color: #0066cc; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal de confirmação */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-confirm { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; animation: aparecer .2s ease-out; }
.modal-confirm-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.modal-confirm-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-fechar { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
.modal-confirm-body { padding: 24px; }
.excluir-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding-bottom: 20px; }
.excluir-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; }
.excluir-content p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
.modal-confirm-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.btn-cancelar-modal { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn-excluir-modal { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn-excluir-modal:hover { background: #b91c1c; }
.btn-excluir-modal:disabled, .btn-cancelar-modal:disabled { opacity: 0.6; cursor: not-allowed; }
@keyframes aparecer { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
</style>