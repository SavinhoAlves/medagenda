import { ref, computed } from 'vue'

const STORAGE_KEY = 'agenda-config'
const DEFAULTS = { horaInicio: '06:00', horaFim: '22:00', formatoHora: '24h' }

const config = ref({ ...DEFAULTS })

function toFCTime(hhmm, extraMin = 0) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + extraMin
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

export function useAgendaConfig() {
  function load() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) Object.assign(config.value, JSON.parse(saved))
    } catch {}
  }

  function salvar() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    }
  }

  // slotMaxTime adds 30 min so the last configured hour label is visible in FullCalendar
  const slotMinTime = computed(() => toFCTime(config.value.horaInicio))
  const slotMaxTime = computed(() => toFCTime(config.value.horaFim, 30))
  const formatoHora = computed(() => config.value.formatoHora || '24h')

  return { config, load, salvar, slotMinTime, slotMaxTime, formatoHora }
}
