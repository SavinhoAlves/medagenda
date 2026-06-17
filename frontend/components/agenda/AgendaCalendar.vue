<script setup>
import { ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

const props = defineProps({
  eventos: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['novo', 'mover', 'redimensionar'])

// Referência para acessar o componente FullCalendar no DOM
const calendarRef = ref(null)

// Configurações do FullCalendar
const calendarOptions = ref({
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin
  ],

  locale: ptBrLocale,

  initialView: 'timeGridWeek',

  headerToolbar: {
    left: 'prev today next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },

  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia'
  },

  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',

  allDaySlot: false,
  editable: true,
  selectable: true,

  events: props.eventos,

  select: (info) => emit('novo', info),
  eventDrop: (info) => emit('mover', info),
  eventResize: (info) => emit('redimensionar', info)
})

// 🔥 O PULO DO GATO: Monitora a prop e força o FullCalendar a renderizar os novos eventos
watch(() => props.eventos, (novosEventos) => {
  console.log('🔄 [AgendaCalendar] Atualizando eventos no FullCalendar:', novosEventos.length)
  
  // Atualiza as opções do calendário reativamente
  calendarOptions.value.events = [...novosEventos]

  // Se o calendário já estiver renderizado, força o refresh visual
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi()
    calendarApi.refetchEvents()
  }
}, { deep: true, immediate: true })
</script>

<template>
  <div class="calendar-container">
    <FullCalendar 
      ref="calendarRef" 
      :options="calendarOptions" 
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.calendar-container {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

:deep(.fc) {
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 24px rgba(148, 163, 184, 0.06);
}
:deep(.fc-toolbar) {
  margin-bottom: 24px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:deep(.fc-toolbar-title) {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 20px !important;
  color: #0f172a;
  letter-spacing: -0.5px;
  text-transform: capitalize;
  margin: 0 12px;
}
:deep(.fc-button) {
  background: #ffffff !important;
  border: 1px solid #dbe3ee !important;
  color: #475569 !important;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  min-height: 38px;
  padding: 0 16px !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: all .2s ease;
}
:deep(.fc-button-group) {
  display: flex !important;
  gap: 8px !important;
}
:deep(.fc-event-main-frame) {
  display: flex !important;
  flex-direction: column;
  gap: 2px;
}
/* Eventos pequenos */
:deep(.fc-timegrid-event-short .fc-event-main-frame) {
  flex-direction: row !important;
  align-items: center;
  gap: 6px;
}
:deep(.fc-timegrid-event-short .fc-event-time) {
  white-space: nowrap;
  font-weight: 700;
}
:deep(.fc-timegrid-event-short .fc-event-title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.fc-event-time) {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.9;
}
:deep(.fc-event-title) {
  font-size: 12px;
  font-weight: 600;
}
:deep(.fc-timegrid-event) {
  overflow: visible !important;
}

:deep(.fc-event-main) {
  position: relative;
  height: 100%;
}
:deep(.fc-event-resizer-end) {
  width: 24px !important;
  height: 6px !important;

  left: 50% !important;
  right: auto !important;
  bottom: 2px !important;

  transform: translateX(-50%) !important;

  background: transparent !important;
  border: none !important;

  opacity: 0;
  transition: opacity .15s ease;
}

:deep(.fc-timegrid-event:hover .fc-event-resizer-end) {
  opacity: 1;
}

:deep(.fc-event-resizer-end::before) {
  content: "";

  display: block;

  width: 18px;
  height: 3px;

  margin: 0 auto;

  border-radius: 999px;

  background: rgba(15, 23, 42, 0.18);
}
:deep(.fc-button:hover) {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
}
:deep(.fc-button-active),
:deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background: #0063e5 !important;
  border-color: #0063e5 !important;
  color: #ffffff !important;
}
:deep(.fc-toolbar-chunk) {
  display: flex;
  gap: 8px;
  align-items: center;
}
:deep(.fc-prev-button),
:deep(.fc-next-button) {
  width: 38px;
  height: 38px;
  padding: 0 !important;
}
:deep(.fc-today-button) {
  min-width: 80px;
}
:deep(.fc-dayGridMonth-button),
:deep(.fc-timeGridWeek-button),
:deep(.fc-timeGridDay-button) {
  min-width: 90px;
}
:deep(.fc-col-header-cell) {
  background: #f8fafc;
  border-color: #e2e8f0 !important;
  padding: 12px 0;
}
:deep(.fc-col-header-cell-cushion) {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none !important;
}
:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #f1f5f9;
}
:deep(.fc-scrollgrid) {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
:deep(.fc-timegrid-slot-label-cushion) {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}
:deep(.fc-day-today) {
  background: rgba(0, 99, 229, 0.02) !important;
}

:deep(.fc-event:hover) {
  cursor: move;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08) !important;
}
:deep(.fc-event-title) {
  font-weight: 700 !important;
}
</style>