<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 5 },
  modelKey: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const STORAGE_KEY = computed(() => `prontuario_modelo_${props.modelKey}`)
const modelos     = ref([])
const mostraLista = ref(false)
const mostraSalvar = ref(false)
const nomeModelo  = ref('')

function carregar() {
  try { modelos.value = JSON.parse(localStorage.getItem(STORAGE_KEY.value) || '[]') }
  catch { modelos.value = [] }
}

function salvar() {
  if (!nomeModelo.value.trim() || !props.modelValue.trim()) return
  carregar()
  modelos.value.push({ nome: nomeModelo.value.trim(), conteudo: props.modelValue })
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(modelos.value))
  nomeModelo.value  = ''
  mostraSalvar.value = false
}

function usar(m) {
  emit('update:modelValue', m.conteudo)
  mostraLista.value = false
}

function remover(i, e) {
  e.stopPropagation()
  modelos.value.splice(i, 1)
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(modelos.value))
}

onMounted(carregar)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Toolbar -->
    <div class="flex items-center gap-3 justify-end">
      <!-- Usar Modelo -->
      <div class="relative">
        <button type="button" @click="mostraLista = !mostraLista; carregar()"
          class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h10M4 18h16"/>
          </svg>
          Usar modelo
        </button>
        <div v-if="mostraLista"
          class="absolute right-0 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 w-60 overflow-hidden">
          <p v-if="!modelos.length" class="text-xs text-slate-400 dark:text-slate-500 p-4 text-center italic">Nenhum modelo salvo.</p>
          <button v-for="(m, i) in modelos" :key="i" @click="usar(m)"
            class="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b border-slate-100 dark:border-slate-700/50 last:border-none group text-left transition-colors">
            <span class="font-medium text-slate-700 dark:text-slate-200 truncate">{{ m.nome }}</span>
            <span @click="remover(i, $event)"
              class="text-slate-300 dark:text-slate-600 group-hover:text-red-400 hover:!text-red-600 ml-2 shrink-0 text-base leading-none transition-colors">&times;</span>
          </button>
        </div>
      </div>

      <!-- Salvar Modelo -->
      <button type="button" @click="mostraSalvar = !mostraSalvar"
        class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
        </svg>
        Salvar modelo
      </button>
    </div>

    <!-- Input nome do modelo -->
    <div v-if="mostraSalvar" class="flex gap-2">
      <input v-model="nomeModelo"
        class="flex-1 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
        placeholder="Nome do modelo..." @keydown.enter.prevent="salvar" />
      <button type="button" @click="salvar"
        class="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-semibold transition-colors">Salvar</button>
      <button type="button" @click="mostraSalvar = false; nomeModelo = ''"
        class="text-xs px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">&times;</button>
    </div>

    <!-- Textarea -->
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 rounded-lg p-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-300 resize-y"
    ></textarea>
  </div>
</template>
