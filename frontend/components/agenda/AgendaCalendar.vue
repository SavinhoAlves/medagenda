<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

const props = defineProps({
  eventos: { type: Array, required: true, default: () => [] },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['novo', 'mover', 'redimensionar', 'editar'])

const calendarRef = ref(null)
const toast = useToast()

const eventosPorDia = computed(() => {
  const mapa = {}
  props.eventos.forEach(e => {
    if (!e.start) return
    const dia = new Date(e.start).toISOString().split('T')[0]
    mapa[dia] = (mapa[dia] || 0) + 1
  })
  return mapa
})

function atualizarBadges() {
  if (typeof document === 'undefined' || !calendarRef.value) return
  const api = calendarRef.value.getApi()
  if (api.view.type !== 'dayGridMonth') return

  // Remove badges anteriores
  document.querySelectorAll('.day-badge-inject').forEach(el => el.remove())

  // Injeta badge em cada dia com eventos
  Object.entries(eventosPorDia.value).forEach(([dia, count]) => {
    const cell = document.querySelector(`td.fc-daygrid-day[data-date="${dia}"]`)
    if (!cell) return
    const frame = cell.querySelector('.fc-daygrid-day-frame')
    if (!frame) return
    const wrap = document.createElement('div')
    wrap.className = 'day-badge-inject'
    const label = count === 1 ? '1 consulta' : `${count} consultas`
    wrap.innerHTML = `<span class="day-event-badge">${label}</span>`
    frame.appendChild(wrap)
  })
}

function formatLocal(date) {
  const p = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`
}

function podeSelecionar(info) {
  if (props.isAdmin) return true
  if (info.start < new Date()) {
    // selectAllow não expõe info.view — lê da API do calendário
    const viewType = calendarRef.value?.getApi()?.view?.type
    if (viewType !== 'dayGridMonth') {
      toast.erro('Não é permitido agendar em datas passadas.')
    }
    return false
  }
  return true
}

let overlayInterval = null

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: ptBrLocale,
  initialView: 'timeGridWeek',

  headerToolbar: {
    left:   'prev today next',
    center: 'title',
    right:  'dayGridMonth,timeGridWeek,timeGridDay',
  },

  buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },

  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  allDaySlot: false,
  editable:   true,
  selectable: true,

  events: props.eventos,

  datesSet: () => {
    if (overlayInterval) { clearInterval(overlayInterval); overlayInterval = null }
    nextTick(() => {
      atualizarBadges()
      atualizarOverlaysBloqueados()
      const calApi = calendarRef.value?.getApi()
      if (calApi && ['timeGridWeek', 'timeGridDay'].includes(calApi.view.type) && !props.isAdmin) {
        overlayInterval = setInterval(atualizarOverlaysBloqueados, 60000)
      }
    })
  },

  dateClick: (info) => {
    // Mês: navega para o Dia
    if (info.view.type === 'dayGridMonth') {
      calendarRef.value?.getApi().changeView('timeGridDay', info.date)
      return
    }
    // Semana/Dia: clique simples também abre modal (o select só dispara com arrastar)
    if (!props.isAdmin && info.date < new Date()) {
      toast.erro('Não é permitido agendar em horários passados.')
      return
    }
    const fim = new Date(info.date.getTime() + 30 * 60 * 1000)
    emit('novo', { startStr: formatLocal(info.date), endStr: formatLocal(fim) })
  },

  selectAllow: podeSelecionar,
  select:      (info) => emit('novo', info),
  eventClick:  (info) => emit('editar', info.event.extendedProps.consulta),
  eventDrop:   (info) => emit('mover', info),
  eventResize: (info) => emit('redimensionar', info),
})

watch(() => props.eventos, (novos) => {
  calendarOptions.value.events = [...novos]
  if (calendarRef.value) {
    calendarRef.value.getApi().refetchEvents()
    nextTick(() => atualizarBadges())
  }
}, { deep: true, immediate: true })

watch(() => props.isAdmin, (admin) => {
  calendarOptions.value.selectAllow = admin ? undefined : podeSelecionar
})

// ── Overlays visuais para bloqueio de datas/horários passados ──

const SLOT_MIN = 6 * 60  // 06:00
const SLOT_MAX = 22 * 60 // 22:00

function calcPastPercent() {
  const agora = new Date()
  const min = agora.getHours() * 60 + agora.getMinutes()
  if (min <= SLOT_MIN) return 0
  if (min >= SLOT_MAX) return 100
  return ((min - SLOT_MIN) / (SLOT_MAX - SLOT_MIN)) * 100
}

function criarOverlay(pct, opacidade) {
  const el = document.createElement('div')
  el.className = 'past-overlay-inject'
  el.style.cssText = `
    position: absolute;
    top: 0; left: 0; right: 0;
    height: ${pct}%;
    background: rgba(148, 163, 184, ${opacidade});
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 6px,
      rgba(148,163,184,0.08) 6px,
      rgba(148,163,184,0.08) 8px
    );
    cursor: not-allowed;
    z-index: 1;
    pointer-events: auto;
  `
  el.addEventListener('click', () => {
    toast.erro('Não é permitido agendar em horários passados.')
  })
  return el
}

function atualizarOverlaysBloqueados() {
  if (typeof document === 'undefined' || !calendarRef.value || props.isAdmin) return
  const calApi = calendarRef.value.getApi()
  if (!['timeGridWeek', 'timeGridDay'].includes(calApi.view.type)) return

  document.querySelectorAll('.past-overlay-inject').forEach(el => el.remove())

  // Dias passados — overlay 100%
  document.querySelectorAll('.fc-timegrid-col.fc-day-past .fc-timegrid-col-frame').forEach(frame => {
    frame.appendChild(criarOverlay(100, 0.12))
  })

  // Hoje — overlay parcial até o horário atual
  const pct = calcPastPercent()
  if (pct > 0) {
    const frameHoje = document.querySelector('.fc-timegrid-col.fc-day-today .fc-timegrid-col-frame')
    if (frameHoje) frameHoje.appendChild(criarOverlay(pct, 0.08))
  }
}

const isMounted = ref(false)
onMounted(() => { isMounted.value = true })

onUnmounted(() => {
  if (overlayInterval) clearInterval(overlayInterval)
})
</script>

<template>
  <div class="calendar-wrapper" :class="{ 'block-past': isMounted && !isAdmin }">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.calendar-wrapper {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(148, 163, 184, 0.08);
}

:deep(.fc) {
  font-family: 'Inter', sans-serif;
  padding: 20px 24px 24px;
}

:deep(.fc-toolbar) {
  margin-bottom: 20px !important;
  align-items: center;
}

:deep(.fc-toolbar-title) {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 18px !important;
  color: #0f172a;
  letter-spacing: -0.4px;
  text-transform: capitalize;
}

:deep(.fc-button) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  min-height: 36px;
  padding: 0 14px !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: all 0.15s;
}

:deep(.fc-button-group) {
  display: flex !important;
  gap: 6px !important;
}

:deep(.fc-button:hover) {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
}

:deep(.fc-button-active),
:deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background: #059669 !important;
  border-color: #059669 !important;
  color: #ffffff !important;
}

:deep(.fc-toolbar-chunk) {
  display: flex;
  gap: 6px;
  align-items: center;
}

:deep(.fc-prev-button),
:deep(.fc-next-button) {
  width: 36px;
  height: 36px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.fc-col-header-cell) {
  background: #f8fafc;
  border-color: #e2e8f0 !important;
  padding: 10px 0;
}

:deep(.fc-col-header-cell-cushion) {
  color: #475569;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none !important;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #f1f5f9;
}

:deep(.fc-scrollgrid) {
  border: none !important;
  border-top: 1px solid #e2e8f0 !important;
}

:deep(.fc-timegrid-slot-label-cushion) {
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 500;
}

:deep(.fc-day-today) {
  background: rgba(5, 150, 105, 0.03) !important;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 6px;
  border: none !important;
  position: relative;
  z-index: 2;
}

:deep(.fc-event:hover) {
  filter: brightness(0.93);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}

:deep(.fc-event-time) {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.88;
}

:deep(.fc-event-title) {
  font-size: 12px;
  font-weight: 700;
}

:deep(.fc-event-main-frame) {
  display: flex !important;
  flex-direction: column;
  gap: 1px;
}

:deep(.fc-timegrid-event-short .fc-event-main-frame) {
  flex-direction: row !important;
  align-items: center;
  gap: 5px;
}

:deep(.fc-event-resizer-end) {
  width: 20px !important;
  height: 5px !important;
  left: 50% !important;
  right: auto !important;
  bottom: 3px !important;
  transform: translateX(-50%) !important;
  background: transparent !important;
  border: none !important;
  opacity: 0;
  transition: opacity 0.15s;
}

:deep(.fc-timegrid-event:hover .fc-event-resizer-end) { opacity: 1; }

:deep(.fc-event-resizer-end::before) {
  content: "";
  display: block;
  width: 16px;
  height: 3px;
  margin: 0 auto;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
}

/* Dia passado — fundo levemente acinzentado */
:deep(.fc-day-past) {
  background: rgba(241, 245, 249, 0.5) !important;
}

/* Cursor de bloqueio nos dias passados em visão Mês (não-admins) */
.block-past :deep(.fc-dayGridMonth-view .fc-day-past),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-frame),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-top),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-number) {
  cursor: not-allowed !important;
}

/* Visão mês — visual de bloqueio nos dias passados */
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-frame) {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 6px,
    rgba(148, 163, 184, 0.07) 6px,
    rgba(148, 163, 184, 0.07) 8px
  ) !important;
}

/* Número do dia em passado — mais apagado */
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-number) {
  color: #cbd5e1 !important;
}

.block-past :deep(.fc-day-past .fc-event) {
  cursor: pointer !important;
}

/* ── Visão Mês ── */

/* Oculta barras de evento individuais e o link "+mais" */
:deep(.fc-dayGridMonth-view .fc-daygrid-event-harness),
:deep(.fc-dayGridMonth-view .fc-daygrid-day-bottom) {
  display: none !important;
}

/* Card do dia inteiro clicável */
:deep(.fc-dayGridMonth-view .fc-daygrid-day) {
  cursor: pointer;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day:hover .fc-daygrid-day-frame) {
  background: rgba(5, 150, 105, 0.03);
}

/* Badge de contagem injetado via JS */
:deep(.day-badge-inject) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

:deep(.day-event-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  background: #059669;
  color: #ffffff;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day:hover .day-event-badge) {
  background: #047857;
}
</style>
