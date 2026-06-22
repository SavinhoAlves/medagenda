<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { useAgendaConfig } from '@/composables/useAgendaConfig'

const props = defineProps({
  eventos: { type: Array, required: true, default: () => [] },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['novo', 'mover', 'redimensionar', 'editar'])

const calendarRef = ref(null)
const toast = useToast()
const { slotMinTime, slotMaxTime, formatoHora, load: loadConfig } = useAgendaConfig()

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

  document.querySelectorAll('.day-badge-inject').forEach(el => el.remove())

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
  return info.start >= new Date()
}

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

  height:            'auto',
  contentHeight:     'auto',
  expandRows:        false,
  stickyHeaderDates: true,

  slotMinTime:       slotMinTime.value,
  slotMaxTime:       slotMaxTime.value,
  scrollTime:        slotMinTime.value,
  slotDuration:      '00:30:00',
  slotLabelInterval: '01:00:00',
  allDaySlot:             false,
  editable:               true,
  selectable:             true,
  nowIndicator:           true,
  navLinks:               true,
  forceEventDuration:     true,
  defaultTimedEventDuration: '01:00:00',

  slotLabelFormat:  { hour: '2-digit', minute: '2-digit', hour12: formatoHora.value === '12h' },
  eventTimeFormat:  { hour: '2-digit', minute: '2-digit', hour12: formatoHora.value === '12h' },
  dayHeaderFormat:  { weekday: 'short', day: 'numeric' },

  events: (fetchInfo, successCallback) => {
    successCallback([...props.eventos])
  },

  datesSet: () => {
    nextTick(() => atualizarBadges())
  },

  dateClick: (info) => {
    if (info.view.type === 'dayGridMonth') {
      calendarRef.value?.getApi().changeView('timeGridDay', info.date)
      return
    }
    if (!props.isAdmin && info.date < new Date()) {
      toast.erro('Não é permitido agendar em horários passados.')
      return
    }
    const fim = new Date(info.date.getTime() + 30 * 60 * 1000)
    emit('novo', { startStr: formatLocal(info.date), endStr: formatLocal(fim) })
  },

  selectAllow: podeSelecionar,
  select: (info) => {
    emit('novo', {
      startStr: formatLocal(info.start),
      endStr:   formatLocal(info.end),
    })
  },
  eventClick:  (info) => emit('editar', info.event.extendedProps.consulta),
  eventDrop:   (info) => emit('mover', info),
  eventResize: (info) => emit('redimensionar', info),
})

watch(() => props.eventos, () => {
  if (!calendarRef.value) return
  calendarRef.value.getApi().refetchEvents()
  nextTick(() => atualizarBadges())
}, { deep: true })

watch(() => props.isAdmin, (admin) => {
  calendarOptions.value.selectAllow = admin ? undefined : podeSelecionar
})

watch([slotMinTime, slotMaxTime], ([min, max]) => {
  if (!calendarRef.value) return
  const api = calendarRef.value.getApi()
  api.setOption('slotMinTime', min)
  api.setOption('slotMaxTime', max)
  api.setOption('scrollTime', min)
})

watch(formatoHora, (fmt) => {
  if (!calendarRef.value) return
  const api = calendarRef.value.getApi()
  const tf = { hour: '2-digit', minute: '2-digit', hour12: fmt === '12h' }
  api.setOption('slotLabelFormat', tf)
  api.setOption('eventTimeFormat', tf)
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
  loadConfig()
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
  border-radius: 14px;
  overflow: hidden;
}

/* ── Container ── */
:deep(.fc) {
  font-family: 'Inter', sans-serif;
  padding: 18px 20px 20px;
}

/* ── Toolbar ── */
:deep(.fc-toolbar) {
  margin-bottom: 16px !important;
  align-items: center;
}

:deep(.fc-toolbar-chunk) {
  display: flex;
  gap: 6px;
  align-items: center;
}

:deep(.fc-toolbar-title) {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 16px !important;
  color: #1e293b;
  text-transform: capitalize;
  letter-spacing: -0.2px;
}

:deep(.fc-button) {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 12.5px;
  height: 32px;
  padding: 0 12px !important;
  border-radius: 7px !important;
  box-shadow: none !important;
  transition: background 0.12s, color 0.12s;
}

:deep(.fc-button:hover) {
  background: #f1f5f9 !important;
  color: #334155 !important;
}

:deep(.fc-button:focus) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.fc-button-active),
:deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background: #0f172a !important;
  border-color: #0f172a !important;
  color: #ffffff !important;
}

:deep(.fc-button-group) {
  display: flex !important;
  gap: 6px !important;
}

/* View buttons (Mês / Semana / Dia) — wider padding for visual separation */
:deep(.fc-dayGridMonth-button),
:deep(.fc-timeGridWeek-button),
:deep(.fc-timeGridDay-button) {
  padding: 0 16px !important;
  letter-spacing: 0.1px;
}

:deep(.fc-prev-button),
:deep(.fc-next-button) {
  width: 32px;
  height: 32px;
  padding: 0 !important;
}

/* ── Cabeçalho das colunas ── */
:deep(.fc-col-header-cell) {
  background: #f8fafc;
  border-color: #e2e8f0 !important;
  padding: 8px 0;
}

:deep(.fc-col-header-cell-cushion) {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none !important;
  text-transform: capitalize;
}

/* Dia atual: só a cor do texto muda */
:deep(.fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion) {
  color: #059669;
  font-weight: 700;
}

/* ── Grade ── */
:deep(.fc-scrollgrid) {
  border: none !important;
  border-top: 1px solid #e2e8f0 !important;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #f1f5f9;
}

:deep(.fc-timegrid-slot) {
  height: 44px;
}

:deep(.fc-timegrid-slot-minor) {
  border-top-color: #f8fafc !important;
}

:deep(.fc-timegrid-slot-label-cushion) {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  padding-right: 8px !important;
}

/* ── Hoje ── */
:deep(.fc-day-today) {
  background: rgba(5, 150, 105, 0.03) !important;
}

/* ── Número de dia (visão mês) ── */
:deep(.fc-daygrid-day-number) {
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  text-decoration: none !important;
  padding: 6px 8px;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  color: #059669;
  font-weight: 700;
}

/* ── Indicador de hora atual ── */
:deep(.fc-now-indicator-line) {
  border-color: #e11d48 !important;
  border-width: 1.5px !important;
}

:deep(.fc-now-indicator-arrow) {
  border-top-color: #e11d48 !important;
  border-bottom-color: #e11d48 !important;
}

/* ── Eventos ── */
:deep(.fc-event) {
  cursor: pointer;
  border-radius: 6px;
  border: none !important;
  position: relative;
  z-index: 2;
  transition: filter 0.12s, transform 0.12s;
}

:deep(.fc-event:hover) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

:deep(.fc-timegrid-event .fc-event-main) {
  padding: 3px 6px;
}

:deep(.fc-event-main-frame) {
  display: flex !important;
  flex-direction: column;
  gap: 1px;
}

:deep(.fc-event-time) {
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.8;
}

:deep(.fc-event-title) {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.fc-timegrid-event-short .fc-event-main-frame) {
  flex-direction: row !important;
  align-items: center;
  gap: 4px;
}

:deep(.fc-event-resizer-end) {
  width: 20px !important;
  height: 5px !important;
  left: 50% !important;
  right: auto !important;
  bottom: 2px !important;
  transform: translateX(-50%) !important;
  background: transparent !important;
  border: none !important;
  opacity: 0;
  transition: opacity 0.12s;
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

/* ── Sem área vazia ── */
:deep(.fc-view-harness),
:deep(.fc-view-harness-active) { height: auto !important; }
:deep(.fc-timegrid-body)       { min-height: auto !important; }
:deep(.fc-scroller)            { overflow-y: auto !important; }

/* ── Dias passados ── */
:deep(.fc-day-past .fc-daygrid-day-number) { opacity: 0.4; }

.block-past :deep(.fc-dayGridMonth-view .fc-day-past),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-frame),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-top),
.block-past :deep(.fc-dayGridMonth-view .fc-day-past .fc-daygrid-day-number) {
  cursor: not-allowed !important;
}

.block-past :deep(.fc-timeGridWeek-view .fc-timegrid-col.fc-day-past),
.block-past :deep(.fc-timeGridDay-view  .fc-timegrid-col.fc-day-past) {
  background: rgba(241, 245, 249, 0.35) !important;
  cursor: not-allowed;
}

.block-past :deep(.fc-timeGridWeek-view .fc-col-header-cell.fc-day-past .fc-col-header-cell-cushion) {
  opacity: 0.45;
}

.block-past :deep(.fc-day-past .fc-event) { cursor: pointer !important; }

/* ── Visão mês ── */
:deep(.fc-dayGridMonth-view .fc-daygrid-event-harness),
:deep(.fc-dayGridMonth-view .fc-daygrid-day-bottom) {
  display: none !important;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day) {
  cursor: pointer;
  min-height: 80px;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day:hover .fc-daygrid-day-frame) {
  background: #f8fafc;
}

:deep(.day-badge-inject) {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

:deep(.day-event-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 9px;
  background: #059669;
  color: #ffffff;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day:hover .day-event-badge) {
  background: #047857;
}
</style>
