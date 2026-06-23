<template>
  <!-- Floating button -->
  <button @click="toggle" class="ai-fab" :class="{ 'is-open': isOpen }" :title="isOpen ? 'Fechar assistente' : 'Assistente IA'">
    <Transition name="fab-icon" mode="out-in">
      <X v-if="isOpen" key="close" class="w-6 h-6" />
      <Sparkles v-else key="open" class="w-6 h-6" />
    </Transition>
  </button>

  <!-- Backdrop -->
  <Transition name="ai-fade">
    <div v-if="isOpen" class="ai-backdrop" @click="isOpen = false" />
  </Transition>

  <!-- Panel -->
  <Transition name="ai-slide">
    <div v-if="isOpen" class="ai-panel">
      <!-- Header -->
      <div class="ai-header">
        <div class="flex items-center gap-2">
          <div class="ai-logo">
            <Sparkles class="w-4 h-4" />
          </div>
          <div>
            <p class="ai-title">Assistente IA</p>
            <p v-if="paginaAtual" class="ai-subtitle">{{ paginaAtual }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button @click="limparChat" title="Nova conversa" class="ai-icon-btn">
            <RotateCcw class="w-4 h-4" />
          </button>
          <button @click="isOpen = false" class="ai-icon-btn">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Mode tabs -->
      <div class="ai-tabs">
        <button
          v-for="m in modos"
          :key="m.id"
          @click="setModo(m.id)"
          :class="['ai-tab', { active: modo === m.id }]"
        >
          <component :is="m.icon" class="w-3.5 h-3.5 shrink-0" />
          {{ m.label }}
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesRef" class="ai-messages">
        <div v-if="mensagens.length === 0" class="ai-empty">
          <component :is="modoAtual.icon" class="w-10 h-10 ai-empty-icon" />
          <p class="ai-empty-text">{{ modoAtual.desc }}</p>
        </div>

        <template v-for="(msg, i) in mensagens" :key="i">
          <div :class="['ai-msg', msg.role]">
            <div
              class="ai-bubble"
              v-if="msg.role === 'assistant'"
              v-html="renderMd(msg.content)"
            />
            <div class="ai-bubble" v-else>{{ msg.content }}</div>
          </div>

          <!-- Save button after last assistant response in chat mode -->
          <div
            v-if="msg.role === 'assistant' && modo === 'chat' && i === mensagens.length - 1 && !carregando"
            class="ai-save-row"
          >
            <button @click="abrirSalvar" class="ai-save-btn">
              <BookmarkPlus class="w-3.5 h-3.5" />
              Salvar sugestão
            </button>
          </div>

          <!-- Copy code button after last assistant response in code mode -->
          <div
            v-if="msg.role === 'assistant' && modo === 'codigo' && i === mensagens.length - 1 && !carregando"
            class="ai-save-row"
          >
            <button @click="copiarResposta(msg.content)" class="ai-copy-btn">
              <Copy class="w-3.5 h-3.5" />
              {{ copiado ? 'Copiado!' : 'Copiar resposta' }}
            </button>
          </div>
        </template>

        <!-- Loading indicator -->
        <div v-if="carregando" class="ai-msg assistant">
          <div class="ai-bubble ai-typing">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="ai-input-wrap">
        <textarea
          ref="inputRef"
          v-model="input"
          @keydown.enter.exact.prevent="enviar"
          :placeholder="modoAtual.inputPlaceholder"
          class="ai-textarea"
          rows="2"
          :disabled="carregando"
        />
        <div class="ai-input-footer">
          <span class="ai-hint">Enter enviar · Shift+Enter nova linha</span>
          <button
            @click="enviar"
            :disabled="!input.trim() || carregando"
            class="ai-send-btn"
          >
            <Send class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Save modal backdrop -->
  <Transition name="ai-fade">
    <div v-if="salvandoModal" class="ai-modal-backdrop" @click="salvandoModal = false" />
  </Transition>

  <!-- Save modal -->
  <Transition name="ai-modal-pop">
    <div v-if="salvandoModal" class="ai-modal-wrap">
      <div class="ai-modal">
        <div class="ai-modal-header">
          <BookmarkPlus class="w-5 h-5 text-violet-500" />
          <h3 class="ai-modal-title">Salvar Sugestão</h3>
        </div>
        <input
          v-model="salvarTitulo"
          placeholder="Título da sugestão"
          class="ai-form-input"
          @keydown.enter.prevent="confirmarSalvar"
        />
        <textarea
          v-model="salvarDesc"
          placeholder="Descrição (será salva junto com o texto da IA)"
          class="ai-form-input ai-form-textarea"
          rows="4"
        />
        <div class="ai-modal-footer">
          <button @click="salvandoModal = false" class="ai-btn-cancel">Cancelar</button>
          <button
            @click="confirmarSalvar"
            :disabled="!salvarTitulo.trim() || salvandoReq"
            class="ai-btn-confirm"
          >
            <BookmarkPlus v-if="!salvandoReq" class="w-4 h-4" />
            <span>{{ salvandoReq ? 'Salvando...' : 'Salvar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  Sparkles, X, RotateCcw, MessageCircle, FileText,
  HelpCircle, Code2, Send, BookmarkPlus, Copy
} from 'lucide-vue-next'
import api from '~/services/api'
import { useToast } from '~/composables/useToast'

const route  = useRoute()
const toast  = useToast()

const isOpen        = ref(false)
const modo          = ref('chat')
const mensagens     = ref([])
const input         = ref('')
const carregando    = ref(false)
const messagesRef   = ref(null)
const inputRef      = ref(null)
const salvandoModal = ref(false)
const salvarTitulo  = ref('')
const salvarDesc    = ref('')
const salvandoReq   = ref(false)
const copiado       = ref(false)

const modos = [
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    desc: 'Converse com a IA, tire dúvidas e envie sugestões de melhoria para o sistema.',
    inputPlaceholder: 'Escreva uma sugestão ou pergunta...',
  },
  {
    id: 'specs',
    label: 'Specs',
    icon: FileText,
    desc: 'Descreva uma funcionalidade e a IA gerará uma especificação técnica completa em Markdown.',
    inputPlaceholder: 'Ex: Quero um módulo de relatórios de consultas por período...',
  },
  {
    id: 'contextual',
    label: 'Ajuda',
    icon: HelpCircle,
    desc: 'A IA conhece a página atual e seu cargo. Tire dúvidas sobre como usar o sistema.',
    inputPlaceholder: 'Como faço para...?',
  },
  {
    id: 'codigo',
    label: 'Código',
    icon: Code2,
    desc: 'Descreva uma feature e a IA gerará o código Vue/Node.js completo para implementá-la.',
    inputPlaceholder: 'Ex: Crie um componente de seleção de horários disponíveis...',
  },
]

const modoAtual = computed(() => modos.find(m => m.id === modo.value) || modos[0])

const PAGE_LABELS = {
  '/agenda':        'Agenda',
  '/consultas':     'Consultas',
  '/pacientes':     'Pacientes',
  '/dashboard':     'Dashboard',
  '/convenios':     'Convênios',
  '/especialidades':'Especialidades',
  '/profissionais': 'Profissionais',
  '/configuracoes': 'Configurações',
  '/solicitacoes':  'Solicitações',
}

const paginaAtual = computed(() => {
  const p = route.path
  for (const [path, label] of Object.entries(PAGE_LABELS)) {
    if (p === path || p.startsWith(path + '/')) return label
  }
  return null
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) nextTick(() => inputRef.value?.focus())
}

function setModo(id) {
  if (modo.value === id) return
  modo.value = id
  mensagens.value = []
  input.value = ''
}

function limparChat() {
  mensagens.value = []
  input.value = ''
}

async function enviar() {
  const texto = input.value.trim()
  if (!texto || carregando.value) return

  mensagens.value.push({ role: 'user', content: texto })
  input.value = ''
  carregando.value = true
  nextTick(scrollBottom)

  try {
    const { data } = await api.post('/ia/chat', {
      mensagens: mensagens.value.map(m => ({ role: m.role, content: m.content })),
      modo: modo.value,
      paginaAtual: paginaAtual.value,
    })
    mensagens.value.push({ role: 'assistant', content: data.resposta })
  } catch (err) {
    const detail = err.response?.data?.error || err.message || 'Erro desconhecido'
    mensagens.value.push({
      role: 'assistant',
      content: `**Erro ao contatar a IA:** ${detail}\n\nVerifique se a chave \`ANTHROPIC_API_KEY\` está configurada no \`.env\` do backend.`,
    })
  } finally {
    carregando.value = false
    nextTick(scrollBottom)
  }
}

function scrollBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function abrirSalvar() {
  const lastUser = [...mensagens.value].reverse().find(m => m.role === 'user')
  const lastAI   = [...mensagens.value].reverse().find(m => m.role === 'assistant')
  salvarTitulo.value = (lastUser?.content || '').substring(0, 100)
  salvarDesc.value   = lastAI?.content || ''
  salvandoModal.value = true
}

async function confirmarSalvar() {
  if (!salvarTitulo.value.trim()) return
  salvandoReq.value = true
  try {
    const lastAI = [...mensagens.value].reverse().find(m => m.role === 'assistant')
    await api.post('/ia/sugestoes', {
      titulo:       salvarTitulo.value.trim(),
      descricao:    salvarDesc.value.trim() || lastAI?.content || '',
      modo:         modo.value,
      paginaContexto: paginaAtual.value,
    })
    toast.success('Sugestão salva com sucesso!')
    salvandoModal.value = false
    salvarTitulo.value  = ''
    salvarDesc.value    = ''
  } catch {
    toast.error('Erro ao salvar sugestão')
  } finally {
    salvandoReq.value = false
  }
}

async function copiarResposta(content) {
  try {
    await navigator.clipboard.writeText(content)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  } catch {
    toast.error('Não foi possível copiar')
  }
}

function renderMd(text) {
  if (!text) return ''

  // Split on fenced code blocks first, keep delimiters
  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g)

  return parts.map(part => {
    if (part.startsWith('```')) {
      const lang = (part.match(/^```(\w*)/) || [])[1] || ''
      const code = part.replace(/^```[\w]*\n?/, '').replace(/```$/, '')
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const langLabel = lang ? `<span class="md-lang">${lang}</span>` : ''
      return `<pre class="md-pre">${langLabel}<code>${escaped}</code></pre>`
    }

    return part
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<div class="md-h3">$1</div>')
      .replace(/^## (.+)$/gm, '<div class="md-h2">$1</div>')
      .replace(/^# (.+)$/gm, '<div class="md-h1">$1</div>')
      .replace(/^- (.+)$/gm, '<div class="md-li">$1</div>')
      .replace(/^\d+\. (.+)$/gm, '<div class="md-li md-oli">$1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
  }).join('')
}
</script>

<style scoped>
/* ─── Floating Button ─────────────────────────────────────────── */
.ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 60;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;
}
.ai-fab:hover { transform: scale(1.08); box-shadow: 0 6px 26px rgba(124, 58, 237, 0.55); }
.ai-fab.is-open { background: linear-gradient(135deg, #6d28d9, #4338ca); }

/* ─── Backdrop ────────────────────────────────────────────────── */
.ai-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  z-index: 50;
}

/* ─── Panel ───────────────────────────────────────────────────── */
.ai-panel {
  position: fixed;
  right: 0;
  top: var(--topbar-h, 64px);
  bottom: 0;
  width: 440px;
  z-index: 55;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.1);
}

/* ─── Header ──────────────────────────────────────────────────── */
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  shrink: 0;
}
.ai-logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ai-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.2;
  margin: 0;
}
.ai-subtitle {
  font-size: 11px;
  color: var(--text-sub);
  margin: 0;
}
.ai-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.ai-icon-btn:hover { background: var(--bg-app); color: var(--text-main); }

/* ─── Mode Tabs ───────────────────────────────────────────────── */
.ai-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.ai-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-sub);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.ai-tab:hover { background: var(--bg-app); color: var(--text-main); }
.ai-tab.active { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }

/* ─── Messages Area ───────────────────────────────────────────── */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.ai-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  gap: 10px;
}
.ai-empty-icon { color: var(--text-sub); opacity: 0.4; }
.ai-empty-text { font-size: 13px; color: var(--text-sub); max-width: 280px; line-height: 1.5; }

/* ─── Message Bubbles ─────────────────────────────────────────── */
.ai-msg { display: flex; flex-direction: column; }
.ai-msg.user { align-items: flex-end; }
.ai-msg.assistant { align-items: flex-start; }

.ai-bubble {
  max-width: 92%;
  padding: 10px 13px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}
.ai-msg.user .ai-bubble {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  border-bottom-right-radius: 3px;
}
.ai-msg.assistant .ai-bubble {
  background: var(--bg-app);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 3px;
}

/* ─── Typing Indicator ────────────────────────────────────────── */
.ai-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-sub);
  animation: bounce 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ─── Save / Copy rows ────────────────────────────────────────── */
.ai-save-row { display: flex; justify-content: flex-start; padding-left: 2px; }

.ai-save-btn, .ai-copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ai-save-btn { color: #7c3aed; }
.ai-save-btn:hover { background: rgba(124, 58, 237, 0.08); }
.ai-copy-btn { color: var(--text-sub); }
.ai-copy-btn:hover { background: var(--bg-app); color: var(--text-main); }

/* ─── Markdown Styles (inside .ai-bubble) ─────────────────────── */
:deep(.md-pre) {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
  position: relative;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  line-height: 1.5;
  white-space: pre;
}
:deep(.md-lang) {
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
:deep(.md-code) {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11.5px;
  font-family: 'Fira Code', monospace;
}
.ai-msg.user :deep(.md-code) { background: rgba(255,255,255,0.15); color: #fff; }
:deep(.md-h1) { font-size: 15px; font-weight: 700; color: var(--text-main); margin: 10px 0 4px; }
:deep(.md-h2) { font-size: 14px; font-weight: 700; color: var(--text-main); margin: 8px 0 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 3px; }
:deep(.md-h3) { font-size: 13px; font-weight: 600; color: var(--text-main); margin: 6px 0 3px; }
:deep(.md-li) { padding-left: 14px; position: relative; margin: 2px 0; }
:deep(.md-li)::before { content: '•'; position: absolute; left: 3px; color: #7c3aed; }
:deep(.md-oli)::before { content: '›'; }

/* ─── Input Area ──────────────────────────────────────────────── */
.ai-input-wrap {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}
.ai-textarea {
  width: 100%;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 13px;
  line-height: 1.5;
  padding: 9px 12px;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.ai-textarea:focus { border-color: #7c3aed; }
.ai-textarea::placeholder { color: var(--text-sub); }
.ai-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.ai-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.ai-hint { font-size: 10px; color: var(--text-sub); }

.ai-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.ai-send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ─── Save Modal ──────────────────────────────────────────────── */
.ai-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 70;
}
.ai-modal-wrap {
  position: fixed;
  inset: 0;
  z-index: 75;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  pointer-events: none;
}
.ai-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: all;
}
.ai-modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}
.ai-form-input {
  width: 100%;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 13px;
  padding: 9px 12px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.ai-form-input:focus { border-color: #7c3aed; }
.ai-form-input::placeholder { color: var(--text-sub); }
.ai-form-textarea { resize: vertical; line-height: 1.5; }
.ai-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.ai-btn-cancel {
  padding: 7px 14px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.ai-btn-cancel:hover { background: var(--bg-app); }
.ai-btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 7px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.ai-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── Transitions ─────────────────────────────────────────────── */
.ai-fade-enter-active, .ai-fade-leave-active { transition: opacity 0.2s; }
.ai-fade-enter-from, .ai-fade-leave-to { opacity: 0; }

.ai-slide-enter-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.ai-slide-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.ai-slide-enter-from, .ai-slide-leave-to { transform: translateX(100%); }

.ai-modal-pop-enter-active { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; }
.ai-modal-pop-leave-active { transition: transform 0.15s, opacity 0.15s; }
.ai-modal-pop-enter-from, .ai-modal-pop-leave-to { transform: scale(0.95); opacity: 0; }

.fab-icon-enter-active, .fab-icon-leave-active { transition: transform 0.15s, opacity 0.15s; }
.fab-icon-enter-from { transform: rotate(90deg) scale(0.5); opacity: 0; }
.fab-icon-leave-to { transform: rotate(-90deg) scale(0.5); opacity: 0; }
</style>
