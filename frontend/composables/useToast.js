import { ref } from 'vue'

const toasts = ref([])
let _id = 0

export function useToast() {
  function adicionar(mensagem, tipo = 'info', duracao = 3500) {
    const id = ++_id
    toasts.value.push({ id, mensagem, tipo })
    setTimeout(() => remover(id), duracao)
  }

  function remover(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts,
    sucesso: (msg) => adicionar(msg, 'sucesso'),
    erro:    (msg) => adicionar(msg, 'erro'),
    aviso:   (msg) => adicionar(msg, 'aviso'),
    info:    (msg) => adicionar(msg, 'info'),
    remover,
  }
}
