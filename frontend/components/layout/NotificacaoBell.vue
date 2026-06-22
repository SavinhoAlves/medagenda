<template>
  <div class="notif-zone" ref="notifRef">
    <button
      class="notif-btn"
      :class="{ ativo: painelAberto }"
      @click="togglePanel"
      :title="naoLidas > 0 ? `${naoLidas} notificação(ões) não lida(s)` : 'Notificações'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="notif-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      <span v-if="naoLidas > 0" class="notif-badge">{{ naoLidas > 9 ? '9+' : naoLidas }}</span>
    </button>

    <Transition name="notif-fade">
      <div v-if="painelAberto" class="notif-panel">
        <div class="painel-header">
          <span class="painel-titulo">Notificações</span>
          <button v-if="naoLidas > 0" class="btn-ler-todas" @click="marcarTodas">
            Marcar como lidas
          </button>
        </div>

        <div v-if="carregando" class="painel-estado">
          <div class="spinner-sm"></div>
          <span>Carregando...</span>
        </div>

        <div v-else-if="lista.length === 0" class="painel-estado">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.418m.25-8.268a23.985 23.985 0 0 0 1.944-3.04m0 0a9 9 0 0 0-17.892.61M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p>Nenhuma notificação</p>
        </div>

        <div v-else class="notif-lista">
          <button
            v-for="n in lista"
            :key="n.id"
            class="notif-item"
            :class="{ 'nao-lida': !n.lida, 'sem-link': !n.link }"
            @click="clicar(n)"
          >
            <div class="notif-icone" :class="tipoClass(n.tipo)">
              <svg v-if="n.tipo === 'SOLICITACAO_EXCLUSAO'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>

            <div class="notif-corpo">
              <span class="notif-titulo-item">{{ n.titulo }}</span>
              <span class="notif-msg">{{ n.mensagem }}</span>
              <span class="notif-tempo">{{ tempoRelativo(n.criadoEm) }}</span>
            </div>

            <span v-if="!n.lida" class="notif-dot"></span>
          </button>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Modal de notificação (teleportado ao body para evitar z-index) -->
  <Teleport to="body">
    <Transition name="modal-notif-fade">
      <div
        v-if="notifSelecionada"
        class="notif-modal-overlay"
        @click.self="notifSelecionada = null"
      >
        <div class="notif-modal" role="dialog" aria-modal="true">
          <div class="notif-modal-head">
            <div class="notif-icone-modal" :class="tipoClass(notifSelecionada.tipo)">
              <svg v-if="notifSelecionada.tipo === 'SOLICITACAO_EXCLUSAO'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>

            <div class="notif-modal-meta">
              <span class="notif-modal-titulo">{{ notifSelecionada.titulo }}</span>
              <span class="notif-modal-tempo">{{ tempoRelativo(notifSelecionada.criadoEm) }}</span>
            </div>

            <button class="notif-modal-fechar" @click="notifSelecionada = null" title="Fechar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="notif-modal-body">
            <p class="notif-modal-msg">{{ notifSelecionada.mensagem }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const notifRef         = ref(null)
const painelAberto     = ref(false)
const carregando       = ref(false)
const naoLidas         = ref(0)
const lista            = ref([])
const notifSelecionada = ref(null)
let pollInterval = null

async function buscarCount() {
  try {
    const { data } = await api.get('/notificacoes/count')
    naoLidas.value = data.count || 0
  } catch {}
}

async function buscarLista() {
  carregando.value = true
  try {
    const { data } = await api.get('/notificacoes')
    lista.value = data
  } catch {
    lista.value = []
  } finally {
    carregando.value = false
  }
}

async function togglePanel() {
  painelAberto.value = !painelAberto.value
  if (painelAberto.value) {
    await buscarLista()
  }
}

async function clicar(notif) {
  if (!notif.lida) {
    try {
      await api.patch(`/notificacoes/${notif.id}/ler`)
      notif.lida = true
      naoLidas.value = Math.max(0, naoLidas.value - 1)
    } catch {}
  }
  if (notif.link) {
    painelAberto.value = false
    router.push(notif.link)
  } else {
    notifSelecionada.value = notif
  }
}

async function marcarTodas() {
  try {
    await api.post('/notificacoes/ler-todas')
    lista.value.forEach(n => { n.lida = true })
    naoLidas.value = 0
  } catch {}
}

function tipoClass(tipo) {
  return { SOLICITACAO_EXCLUSAO: 'icone-exclusao', GERAL: 'icone-geral' }[tipo] || 'icone-geral'
}

function tempoRelativo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d} dia${d > 1 ? 's' : ''}`
  return new Date(iso).toLocaleDateString('pt-BR')
}

const fecharFora = (e) => {
  if (notifSelecionada.value) return
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    painelAberto.value = false
  }
}

onMounted(() => {
  buscarCount()
  pollInterval = setInterval(buscarCount, 30000)
  document.addEventListener('click', fecharFora)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', fecharFora)
})
</script>

<style scoped>
.notif-zone { position: relative; }

.notif-btn {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border: none; background: none;
  border-radius: 9px; color: #64748b;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.notif-btn:hover, .notif-btn.ativo { background: #f0fdf4; color: #059669; }
.notif-icon { width: 20px; height: 20px; }

.notif-badge {
  position: absolute; top: 4px; right: 4px;
  min-width: 16px; height: 16px;
  background: #ef4444; color: #ffffff;
  font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700;
  border-radius: 99px; display: flex; align-items: center; justify-content: center;
  padding: 0 3px; line-height: 1;
  box-shadow: 0 0 0 2px #ffffff;
}

/* ── Painel ── */
.notif-panel {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 340px;
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 30px -5px rgba(15,23,42,0.1), 0 4px 8px -4px rgba(15,23,42,0.05);
  z-index: 1001; overflow: hidden;
}

.painel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.painel-titulo { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#0f172a; }
.btn-ler-todas {
  font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:#059669;
  background:none; border:none; cursor:pointer; padding:0; transition:color 0.15s;
}
.btn-ler-todas:hover { color:#047857; }

.notif-lista {
  max-height: 380px; overflow-y: auto;
  display: flex; flex-direction: column;
}

.notif-item {
  width: 100%; display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border: none; background: none; cursor: pointer; text-align: left;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s ease; position: relative;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f8fafc; }
.notif-item.nao-lida { background: #f0fdf4; }
.notif-item.nao-lida:hover { background: #dcfce7; }
.notif-item.sem-link { cursor: default; }

.notif-icone {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.notif-icone svg { width: 18px; height: 18px; }
.icone-exclusao { background: #fef2f2; color: #ef4444; }
.icone-geral    { background: #eff6ff; color: #3b82f6; }

.notif-corpo { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.notif-titulo-item {
  font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#0f172a;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.notif-msg {
  font-family:'Inter',sans-serif; font-size:12.5px; color:#475569; line-height:1.4;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.notif-tempo { font-family:'Inter',sans-serif; font-size:11px; color:#94a3b8; margin-top:2px; }

.notif-dot {
  width: 8px; height: 8px; background: #059669; border-radius: 50%;
  flex-shrink: 0; margin-top: 4px;
}

.painel-estado {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 36px 16px; color: #94a3b8;
}
.painel-estado p { font-family:'Inter',sans-serif; font-size:13px; margin:0; }
.empty-icon { width:36px; height:36px; color:#cbd5e1; }

.spinner-sm {
  width:24px; height:24px;
  border: 2px solid #e2e8f0; border-top-color:#059669;
  border-radius:50%; animation:spin 0.7s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }

/* Painel fade */
.notif-fade-enter-active, .notif-fade-leave-active { transition:opacity 0.15s ease, transform 0.15s ease; }
.notif-fade-enter-from, .notif-fade-leave-to { opacity:0; transform:translateY(-4px); }

/* ── Modal ── */
.notif-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.notif-modal {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 20px 60px -10px rgba(15,23,42,0.25);
  width: 100%; max-width: 480px;
  overflow: hidden;
}

.notif-modal-head {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.notif-icone-modal {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.notif-icone-modal svg { width: 22px; height: 22px; }

.notif-modal-meta {
  flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0;
}
.notif-modal-titulo {
  font-family:'Inter',sans-serif; font-size:15px; font-weight:700; color:#0f172a; line-height:1.3;
}
.notif-modal-tempo {
  font-family:'Inter',sans-serif; font-size:12px; color:#94a3b8;
}

.notif-modal-fechar {
  width: 32px; height: 32px;
  border: none; background: none; border-radius: 8px;
  color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.notif-modal-fechar svg { width: 16px; height: 16px; }
.notif-modal-fechar:hover { background: #f1f5f9; color: #475569; }

.notif-modal-body { padding: 20px; }
.notif-modal-msg {
  font-family:'Inter',sans-serif; font-size:14.5px; color:#475569;
  line-height: 1.65; margin: 0; white-space: pre-wrap;
}

/* Modal transition */
.modal-notif-fade-enter-active { transition:opacity 0.2s ease; }
.modal-notif-fade-leave-active { transition:opacity 0.18s ease; }
.modal-notif-fade-enter-from, .modal-notif-fade-leave-to { opacity:0; }
.modal-notif-fade-enter-active .notif-modal { animation:modal-scale-in 0.2s ease; }
@keyframes modal-scale-in {
  from { transform:scale(0.94) translateY(-8px); }
  to   { transform:scale(1) translateY(0); }
}
</style>
