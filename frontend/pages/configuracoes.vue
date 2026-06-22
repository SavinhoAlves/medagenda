<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgendaConfig } from '@/composables/useAgendaConfig'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Configurações' })

const authStore = useAuthStore()
const isAdmin   = computed(() => authStore.isAdmin)
const usuario   = computed(() => authStore.usuario)

const toast = useToast()

// ── Dados da clínica (persistidos em localStorage) ──
const CLINIC_KEY = 'clinic-config'
const sistema = ref({
  nomeClinica: '',
  telefone: '',
  email: '',
  endereco: '',
  intervaloConsulta: 30
})

function carregarSistema() {
  if (!process.client) return
  const saved = localStorage.getItem(CLINIC_KEY)
  if (saved) {
    try { Object.assign(sistema.value, JSON.parse(saved)) } catch {}
  }
}

// ── Notificações (persistidas em localStorage) ──
const NOTIF_KEY = 'notif-config'
const notificacoes = ref({ email: true, whatsapp: false, lembreteConsulta: true })

function carregarNotificacoes() {
  if (!process.client) return
  const saved = localStorage.getItem(NOTIF_KEY)
  if (saved) {
    try { Object.assign(notificacoes.value, JSON.parse(saved)) } catch {}
  }
}

// ── Horário da agenda ──
const { config: agendaConf, load: loadAgenda, salvar: salvarAgenda } = useAgendaConfig()

const horasDisponiveis = Array.from({ length: 24 }, (_, h) => ({
  value: `${String(h).padStart(2, '0')}:00`,
  label: `${String(h).padStart(2, '0')}:00`,
}))

// ── Gestão de usuários (admin only) ──
const usuarios      = ref([])
const modalUsuario  = ref(false)
const salvandoUser  = ref(false)
const erroUser      = ref('')

const novoUser = ref({ nome: '', email: '', senha: '', cargo: 'operador' })

const CARGOS = [
  { value: 'operador', label: 'Operador' },
  { value: 'medico',   label: 'Médico' },
  { value: 'admin',    label: 'Administrador' },
]

const labelCargo = (cargo) => CARGOS.find(c => c.value === cargo)?.label || cargo

async function carregarUsuarios() {
  if (!isAdmin.value) return
  try {
    const { data } = await api.get('/usuarios')
    usuarios.value = data
  } catch {}
}

function abrirModalUsuario() {
  novoUser.value = { nome: '', email: '', senha: '', cargo: 'operador' }
  erroUser.value = ''
  modalUsuario.value = true
}

async function criarUsuario() {
  erroUser.value = ''
  const { nome, email, senha, cargo } = novoUser.value
  if (!nome.trim() || !email.trim() || !senha.trim()) {
    erroUser.value = 'Preencha todos os campos.'
    return
  }
  salvandoUser.value = true
  try {
    const { data } = await api.post('/usuarios', { nome, email, senha, cargo })
    usuarios.value.unshift(data)
    modalUsuario.value = false
    toast.sucesso('Usuário criado com sucesso!')
  } catch (e) {
    erroUser.value = e.response?.data?.error || 'Erro ao criar usuário.'
  } finally {
    salvandoUser.value = false
  }
}

async function excluirUsuario(id) {
  try {
    await api.delete(`/usuarios/${id}`)
    usuarios.value = usuarios.value.filter(u => u.id !== id)
    toast.sucesso('Usuário removido.')
  } catch (e) {
    toast.erro(e.response?.data?.error || 'Erro ao remover usuário.')
  }
}

function salvarConfiguracoes() {
  salvarAgenda()
  if (process.client) {
    localStorage.setItem(CLINIC_KEY, JSON.stringify(sistema.value))
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notificacoes.value))
  }
  toast.sucesso('Configurações salvas com sucesso!')
}

onMounted(() => {
  loadAgenda()
  carregarUsuarios()
  carregarSistema()
  carregarNotificacoes()
})
</script>

<template>

  <div class="config-root">

    <!-- HEADER -->
    <div class="page-header">

      <div>

        <h1 class="page-title">
          Configurações
        </h1>

        <p class="page-subtitle">
          Gerencie as preferências do sistema
        </p>

      </div>

    </div>

    <!-- PERFIL -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon green">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>

        <div>
          <h2>Perfil do usuário</h2>
          <p>Informações da conta logada</p>
        </div>

        <span class="badge-readonly">Somente leitura</span>

      </div>

      <div class="profile-wrap">
        <div class="profile-avatar">{{ usuario?.nome?.charAt(0)?.toUpperCase() ?? '?' }}</div>
        <div class="form-grid profile-grid">
          <div class="field">
            <label>Nome</label>
            <input :value="usuario?.nome ?? '—'" type="text" disabled />
          </div>
          <div class="field">
            <label>E-mail</label>
            <input :value="usuario?.email ?? '—'" type="email" disabled />
          </div>
          <div class="field">
            <label>Cargo</label>
            <input :value="labelCargo(usuario?.cargo)" type="text" disabled />
          </div>
        </div>
      </div>

    </div>

    <!-- SISTEMA -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon blue">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>

        <div>
          <h2>Dados da clínica</h2>
          <p>Informações gerais do estabelecimento</p>
        </div>

        <span class="badge-local">Salvo localmente</span>

      </div>

      <div class="form-grid">

        <div class="field">
          <label>Nome da clínica</label>
          <input v-model="sistema.nomeClinica" type="text" placeholder="Ex: Clínica Saúde Total" />
        </div>

        <div class="field">
          <label>Telefone</label>
          <input v-model="sistema.telefone" type="text" placeholder="(00) 00000-0000" />
        </div>

        <div class="field">
          <label>E-mail de contato</label>
          <input v-model="sistema.email" type="email" placeholder="contato@clinica.com" />
        </div>

        <div class="field">
          <label>Intervalo padrão (min)</label>
          <input v-model.number="sistema.intervaloConsulta" type="number" min="10" max="120" step="5" />
        </div>

        <div class="field full">
          <label>Endereço</label>
          <input v-model="sistema.endereco" type="text" placeholder="Rua, número, bairro, cidade" />
        </div>

      </div>

    </div>

    <!-- HORÁRIO DA AGENDA -->
    <div class="config-card">
      <div class="card-header">
        <div class="card-icon orange">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h2>Horário da agenda</h2>
          <p>Período de funcionamento exibido no calendário</p>
        </div>
      </div>
      <div class="form-grid">
        <div class="field">
          <label>Início do expediente</label>
          <select v-model="agendaConf.horaInicio">
            <option v-for="h in horasDisponiveis" :key="h.value" :value="h.value">{{ h.label }}</option>
          </select>
        </div>
        <div class="field">
          <label>Término do expediente</label>
          <select v-model="agendaConf.horaFim">
            <option v-for="h in horasDisponiveis" :key="h.value" :value="h.value">{{ h.label }}</option>
          </select>
        </div>
        <div class="field full">
          <label>Formato de horário</label>
          <div class="formato-hora-toggle">
            <button
              type="button"
              class="formato-btn"
              :class="{ active: agendaConf.formatoHora === '24h' }"
              @click="agendaConf.formatoHora = '24h'"
            >
              24h &nbsp;<span class="formato-exemplo">14:30</span>
            </button>
            <button
              type="button"
              class="formato-btn"
              :class="{ active: agendaConf.formatoHora === '12h' }"
              @click="agendaConf.formatoHora = '12h'"
            >
              12h &nbsp;<span class="formato-exemplo">2:30 PM</span>
            </button>
          </div>
        </div>
      </div>
      <p class="field-hint">O calendário exibirá os horários de {{ agendaConf.horaInicio }} até {{ agendaConf.horaFim }}.</p>
    </div>

    <!-- NOTIFICAÇÕES -->
    <div class="config-card">

      <div class="card-header">

        <div class="card-icon purple">

          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 8a6 6 0 1112 0v4l1.5 2.5H4.5L6 12V8z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path
              d="M10 19a2 2 0 004 0"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>

        </div>

        <div>

          <h2>
            Notificações
          </h2>

          <p>
            Preferências de avisos e lembretes
          </p>

        </div>

      </div>

      <div class="switch-list">

        <div class="switch-item">

          <div>

            <strong>
              Notificações por e-mail
            </strong>

            <span>
              Receber atualizações por e-mail
            </span>

          </div>

          <input
            v-model="notificacoes.email"
            type="checkbox"
          />

        </div>

        <div class="switch-item">

          <div>

            <strong>
              Notificações WhatsApp
            </strong>

            <span>
              Receber mensagens automáticas
            </span>

          </div>

          <input
            v-model="notificacoes.whatsapp"
            type="checkbox"
          />

        </div>

        <div class="switch-item">

          <div>

            <strong>
              Lembrete de consultas
            </strong>

            <span>
              Enviar lembrete automático
            </span>

          </div>

          <input
            v-model="notificacoes.lembreteConsulta"
            type="checkbox"
          />

        </div>

      </div>

    </div>

    <!-- EQUIPE (admin only) -->
    <div v-if="isAdmin" class="config-card">
      <div class="card-header">
        <div class="card-icon teal">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div style="flex:1">
          <h2>Equipe</h2>
          <p>Gerencie os usuários do sistema</p>
        </div>
        <button class="btn-novo-user" @click="abrirModalUsuario">+ Novo usuário</button>
      </div>

      <table class="user-table" v-if="usuarios.length">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Cargo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td class="user-nome">{{ u.nome }}</td>
            <td class="user-email-cell">{{ u.email }}</td>
            <td><span class="cargo-badge" :class="`cargo-${u.cargo}`">{{ labelCargo(u.cargo) }}</span></td>
            <td>
              <button class="btn-del-user" @click="excluirUsuario(u.id)" title="Excluir usuário">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="user-empty">Nenhum usuário cadastrado além de você.</p>
    </div>

    <!-- Modal: novo usuário -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalUsuario" class="modal-overlay-cfg" @click.self="modalUsuario = false">
          <div class="modal-cfg">
            <div class="modal-cfg-header">
              <h3>Novo usuário</h3>
              <button @click="modalUsuario = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="modal-cfg-body">
              <div class="field">
                <label>Nome completo</label>
                <input v-model="novoUser.nome" type="text" placeholder="Nome do usuário" />
              </div>
              <div class="field">
                <label>E-mail</label>
                <input v-model="novoUser.email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div class="field">
                <label>Senha temporária</label>
                <input v-model="novoUser.senha" type="password" placeholder="Mínimo 6 caracteres" />
              </div>
              <div class="field">
                <label>Cargo</label>
                <select v-model="novoUser.cargo">
                  <option v-for="c in CARGOS" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
              <p v-if="erroUser" class="modal-erro">{{ erroUser }}</p>
            </div>
            <div class="modal-cfg-footer">
              <button class="btn-cancelar-cfg" @click="modalUsuario = false">Cancelar</button>
              <button class="btn-salvar-cfg" @click="criarUsuario" :disabled="salvandoUser">
                {{ salvandoUser ? 'Criando...' : 'Criar usuário' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ACTIONS -->
    <div class="actions">

      <button
        class="btn-save"
        @click="salvarConfiguracoes"
      >
        Salvar Configurações
      </button>

    </div>

  </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.config-root {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 32px 64px;
  font-family: 'Inter', sans-serif;
}

/* ─── Header ───────────────────────────────── */
.page-header { margin-bottom: 32px; }

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

/* ─── Cards ────────────────────────────────── */
.config-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

/* ─── Card Header com ícone ─────────────────── */
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg { width: 20px; height: 20px; }
.card-icon.green { background: rgba(5,150,105,.1); color: #059669; }
.card-icon.blue  { background: rgba(59,130,246,.1); color: #3b82f6; }
.card-icon.purple{ background: rgba(139,92,246,.1); color: #7c3aed; }

.card-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.card-header p  { font-size: 13px; color: #64748b; margin: 0; }

/* ─── Grid e campos ─────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full { grid-column: span 2; }

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: all 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.08);
}

.field input:disabled { opacity: 0.6; cursor: not-allowed; }

/* ─── Lista de Switches ─────────────────────── */
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  gap: 16px;
}

.switch-item > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.switch-item strong { font-size: 14px; font-weight: 600; color: #1e293b; }
.switch-item span   { font-size: 13px; color: #64748b; }

.switch-item input[type="checkbox"] {
  width: 42px;
  height: 24px;
  appearance: none;
  -webkit-appearance: none;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.switch-item input[type="checkbox"]::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}

.switch-item input[type="checkbox"]:checked { background: #059669; }
.switch-item input[type="checkbox"]:checked::after { transform: translateX(18px); }

/* ─── Botão Salvar ──────────────────────────── */
.actions { display: flex; justify-content: flex-end; margin-top: 8px; }

.btn-save {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5,150,105,.15);
  transition: all 0.2s ease;
}

.btn-save:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,.25); }

/* ─── Card icon adicional ───────────────────────── */
.card-icon.orange { background: rgba(245,158,11,.1); color: #d97706; }
.card-icon.teal   { background: rgba(20,184,166,.1); color: #0d9488; }

/* ─── Hint de campo ──────────────────────────────── */
.field-hint { font-size: 12.5px; color: #94a3b8; margin: 12px 0 0; }

/* ─── Tabela de usuários ─────────────────────────── */
.btn-novo-user {
  background: #059669; color: #fff;
  border: none; border-radius: 9px; padding: 8px 16px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.15s;
}
.btn-novo-user:hover { background: #047857; }

.user-table {
  width: 100%; border-collapse: collapse; margin-top: 4px;
}
.user-table th {
  font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  color: #94a3b8; padding: 10px 12px; text-align: left;
  border-bottom: 1px solid #f1f5f9;
}
.user-table td { padding: 12px 12px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.user-table tr:last-child td { border-bottom: none; }
.user-nome { font-weight: 600; color: #0f172a; font-size: 13.5px; }
.user-email-cell { font-size: 13px; color: #64748b; }

.cargo-badge {
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.3px;
}
.cargo-admin    { background: #fef3c7; color: #d97706; }
.cargo-medico   { background: #e0f2fe; color: #0284c7; }
.cargo-operador { background: #f0fdf4; color: #059669; }

.btn-del-user {
  width: 28px; height: 28px; border: none; background: none;
  border-radius: 6px; color: #cbd5e1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.btn-del-user:hover { background: #fef2f2; color: #ef4444; }
.btn-del-user svg { width: 14px; height: 14px; }

.user-empty { font-size: 13px; color: #94a3b8; margin: 0; padding: 8px 0; }

/* ─── Modal novo usuário ─────────────────────────── */
.modal-overlay-cfg {
  position: fixed; inset: 0; background: rgba(15,23,42,0.5);
  backdrop-filter: blur(4px); z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-cfg {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 18px;
  box-shadow: 0 20px 60px -10px rgba(15,23,42,0.2);
  width: 100%; max-width: 460px; overflow: hidden;
}
.modal-cfg-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px; border-bottom: 1px solid #f1f5f9;
}
.modal-cfg-header h3 {
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px;
  font-weight: 800; color: #0f172a; margin: 0;
}
.modal-cfg-header button {
  width: 30px; height: 30px; border: none; background: none;
  border-radius: 8px; color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.modal-cfg-header button:hover { background: #f1f5f9; color: #475569; }
.modal-cfg-header button svg { width: 15px; height: 15px; }

.modal-cfg-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.modal-erro { font-size: 13px; color: #ef4444; margin: 0; }

.modal-cfg-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 20px; border-top: 1px solid #f1f5f9;
}
.btn-cancelar-cfg {
  background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;
  padding: 9px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
}
.btn-cancelar-cfg:hover { background: #f1f5f9; }
.btn-salvar-cfg {
  background: #059669; color: #fff; border: none;
  padding: 9px 22px; border-radius: 10px; font-size: 13.5px; font-weight: 700;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
}
.btn-salvar-cfg:hover:not(:disabled) { background: #047857; }
.btn-salvar-cfg:disabled { opacity: 0.55; cursor: not-allowed; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-cfg { animation: modal-in 0.2s ease; }
@keyframes modal-in {
  from { transform: scale(0.95) translateY(-6px); }
  to   { transform: scale(1) translateY(0); }
}

/* ─── Badge somente leitura / local ─────────────── */
.badge-readonly,
.badge-local {
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.badge-readonly { background: #f1f5f9; color: #64748b; }
.badge-local    { background: #eff6ff; color: #3b82f6; }

/* ─── Avatar + grid de perfil ───────────────────── */
.profile-wrap {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}
.profile-avatar {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.profile-grid { flex: 1; }

/* ─── Formato de horário ─────────────────────────── */
.formato-hora-toggle {
  display: flex;
  gap: 8px;
}

.formato-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}

.formato-btn:hover { border-color: #059669; color: #059669; background: #f0fdf4; }

.formato-btn.active {
  border-color: #059669;
  background: #f0fdf4;
  color: #059669;
}

.formato-exemplo {
  font-size: 12px;
  font-weight: 500;
  color: inherit;
  opacity: 0.7;
}
</style>