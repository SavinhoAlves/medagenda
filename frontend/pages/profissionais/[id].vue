<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import { useMascaras } from '~/composables/useMascaras'

const { mascaraCpf, mascaraConselho, mascaraTelefone } = useMascaras()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const profissional = ref(null)
const especialidades = ref([])
const abaAtiva = ref('pessoais')
const modoEdicao = ref(false)
const salvando = ref(false)

useHead(computed(() => ({ title: profissional.value ? profissional.value.nome : 'Profissional' })))
const toast = useToast()

const excluindo = ref(false)
const { confirmar } = useConfirm()

const form = ref({
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  registroConselho: '',
  especialidadeId: '',
  valorConsulta: '',
  valorRetorno: ''
})

async function carregar() {
  try {
    const [profRes, espRes] = await Promise.all([
      api.get(`/profissionais/${route.params.id}`),
      api.get('/especialidades')
    ])
    profissional.value = profRes.data
    especialidades.value = espRes.data
    preencherForm(profRes.data)
  } catch (error) {
    console.error('Erro ao carregar profissional:', error)
  }
}

function preencherForm(dados) {
  form.value = {
    nome: dados.nome || '',
    cpf: dados.cpf || '',
    telefone: dados.telefone || '',
    email: dados.email || '',
    registroConselho: dados.registroConselho || '',
    especialidadeId: dados.especialidadeId || '',
    valorConsulta: dados.valorConsulta != null ? String(dados.valorConsulta) : '',
    valorRetorno:  dados.valorRetorno  != null ? String(dados.valorRetorno)  : '',
  }
}

function ativarEdicao() {
  modoEdicao.value = true
}

function cancelarEdicao() {
  preencherForm(profissional.value)
  modoEdicao.value = false
}

async function salvar() {
  try {
    salvando.value = true
    const { data } = await api.put(`/profissionais/${route.params.id}`, {
      nome: form.value.nome,
      cpf: form.value.cpf,
      telefone: form.value.telefone,
      email: form.value.email || null,
      registroConselho: form.value.registroConselho || null,
      especialidadeId: Number(form.value.especialidadeId),
      valorConsulta: form.value.valorConsulta ? Number(form.value.valorConsulta) : null,
      valorRetorno:  form.value.valorRetorno  ? Number(form.value.valorRetorno)  : null,
    })
    profissional.value = data
    modoEdicao.value = false
  } catch (error) {
    toast.erro(error.response?.data?.error || 'Erro ao salvar alterações.')
  } finally {
    salvando.value = false
  }
}

async function excluir() {
  const ok = await confirmar({
    titulo: 'Excluir Profissional',
    mensagem: 'Tem certeza que deseja excluir',
    nome: profissional.value?.nome,
    aviso: 'Esta ação não pode ser desfeita.',
    textoBotao: 'Sim, excluir',
  })
  if (!ok) return
  try {
    excluindo.value = true
    await api.delete(`/profissionais/${route.params.id}`)
    router.push('/profissionais')
  } catch (error) {
    toast.erro('Erro ao excluir profissional.')
  } finally {
    excluindo.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div v-if="profissional" class="page-wrapper">

    <div class="header-actions">
      <div class="title-container">
        <NuxtLink to="/profissionais" class="back-arrow-btn">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
        <h1 class="page-main-title">{{ profissional.nome }}</h1>
      </div>

      <div class="actions-buttons">
        <button v-if="!modoEdicao" class="btn-danger-outline" @click="excluir">Excluir</button>
        <button v-if="!modoEdicao" class="btn-primary" @click="ativarEdicao">Editar dados</button>
        <button v-if="modoEdicao" class="btn-secondary" @click="cancelarEdicao" :disabled="salvando">Cancelar</button>
        <button v-if="modoEdicao" class="btn-primary" @click="salvar" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </div>
    </div>

    <div class="profile-container">

      <aside class="profile-sidebar">
        <button :class="['sidebar-tab', { active: abaAtiva === 'pessoais' }]" @click="abaAtiva = 'pessoais'">
          Dados profissionais
        </button>
        <button :class="['sidebar-tab', { active: abaAtiva === 'contato' }]" @click="abaAtiva = 'contato'">
          Informações de contato
        </button>
      </aside>

      <main class="profile-content">

        <!-- ABA: Dados profissionais -->
        <div v-if="abaAtiva === 'pessoais'" class="section-block">
          <div class="section-header-box">
            <h2 class="section-title">Geral</h2>
            <div class="avatar-display">
              <div class="avatar-box">{{ profissional.nome.charAt(0).toUpperCase() }}</div>
              <span class="avatar-label">Perfil Ativo</span>
            </div>
          </div>

          <div class="data-form-grid">
            <div class="form-field">
              <label>Nome Completo</label>
              <input v-if="modoEdicao" v-model="form.nome" class="field-input" />
              <div v-else class="field-value">{{ profissional.nome }}</div>
            </div>

            <div class="form-field">
              <label>CPF</label>
              <input
                v-if="modoEdicao"
                :value="form.cpf"
                @input="form.cpf = mascaraCpf($event.target.value)"
                class="field-input"
                placeholder="000.000.000-00"
                maxlength="14"
              />
              <div v-else class="field-value">{{ mascaraCpf(profissional.cpf) || '-' }}</div>
            </div>

            <div class="form-field">
              <label>Especialidade Clínica</label>
              <select v-if="modoEdicao" v-model="form.especialidadeId" class="field-input">
                <option v-for="e in especialidades" :key="e.id" :value="e.id">{{ e.nome }}</option>
              </select>
              <div v-else class="field-value highlight">{{ profissional.especialidade?.nome || 'Não informada' }}</div>
            </div>

            <div class="form-field">
              <label>Registro de Conselho</label>
              <input
                v-if="modoEdicao"
                :value="form.registroConselho"
                @input="form.registroConselho = mascaraConselho($event.target.value)"
                class="field-input"
                placeholder="CRM/SP 123456"
                maxlength="25"
              />
              <div v-else class="field-value">{{ profissional.registroConselho || '-' }}</div>
            </div>

            <div class="form-field">
              <label>Valor da Consulta</label>
              <input v-if="modoEdicao" v-model="form.valorConsulta" type="number" step="0.01" min="0" class="field-input" placeholder="0,00" />
              <div v-else class="field-value highlight">
                {{ profissional.valorConsulta != null ? `R$ ${Number(profissional.valorConsulta).toFixed(2).replace('.', ',')}` : 'Não definido' }}
              </div>
            </div>

            <div class="form-field">
              <label>Valor do Retorno</label>
              <input v-if="modoEdicao" v-model="form.valorRetorno" type="number" step="0.01" min="0" class="field-input" placeholder="0,00" />
              <div v-else class="field-value highlight">
                {{ profissional.valorRetorno != null ? `R$ ${Number(profissional.valorRetorno).toFixed(2).replace('.', ',')}` : 'Não definido' }}
              </div>
            </div>
          </div>
        </div>

        <!-- ABA: Contato -->
        <div v-if="abaAtiva === 'contato'" class="section-block">
          <h2 class="section-title">Canais de Comunicação</h2>

          <div class="data-form-grid">
            <div class="form-field">
              <label>Telefone / WhatsApp</label>
              <input
                v-if="modoEdicao"
                :value="form.telefone"
                @input="form.telefone = mascaraTelefone($event.target.value)"
                class="field-input"
                placeholder="(00) 00000-0000"
                maxlength="15"
              />
              <div v-else class="field-value">{{ mascaraTelefone(profissional.telefone) || '-' }}</div>
            </div>

            <div class="form-field">
              <label>E-mail Corporativo</label>
              <input v-if="modoEdicao" v-model="form.email" type="email" class="field-input" placeholder="exemplo@clinica.com" />
              <div v-else class="field-value">{{ profissional.email || 'Não informado' }}</div>
            </div>
          </div>
        </div>

      </main>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper {
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* ─── Cabeçalho ─────────────────────────── */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-arrow-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #059669;
}

.page-main-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
  margin: 0;
}

.actions-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-primary {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  transition: all 0.2s ease;
}

.btn-primary:hover { background: #047857; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover { background: #f1f5f9; }
.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-danger-outline {
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger-outline:hover { background: #fef2f2; border-color: #f87171; }

/* ─── Layout ─────────────────────────────── */
.profile-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  align-items: start;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 10px;
}

.sidebar-tab {
  background: none;
  border: none;
  text-align: left;
  padding: 13px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-tab:hover { background: #f8fafc; color: #0f172a; }
.sidebar-tab.active { background: rgba(5, 150, 105, 0.06); color: #059669; font-weight: 600; }

.profile-content {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

/* ─── Seção ──────────────────────────────── */
.section-header-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
  margin-bottom: 28px;
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.avatar-display { display: flex; flex-direction: column; align-items: center; gap: 8px; }

.avatar-box {
  width: 68px;
  height: 68px;
  background: rgba(5, 150, 105, 0.08);
  color: #059669;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.avatar-label {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
  padding: 2px 8px;
  border-radius: 20px;
}

/* ─── Grid de campos ─────────────────────── */
.data-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-value {
  height: 46px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.field-value.highlight { color: #059669; font-weight: 600; }

.field-input {
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #334155;
  background: #ffffff;
  outline: none;
  transition: all 0.2s ease;
}

.field-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

@media (max-width: 1024px) {
  .profile-container { grid-template-columns: 1fr; }
  .data-form-grid { grid-template-columns: 1fr; }
  .page-wrapper { padding: 24px; }
}

</style>
