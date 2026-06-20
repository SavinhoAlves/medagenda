import { ref } from 'vue'

const visivel = ref(false)
const opcoes = ref({})
let _resolver = null

export function useConfirm() {
  function confirmar(opts = {}) {
    opcoes.value = {
      titulo:      opts.titulo      ?? 'Confirmar ação',
      mensagem:    opts.mensagem    ?? 'Tem certeza que deseja continuar?',
      nome:        opts.nome        ?? null,
      aviso:       opts.aviso       ?? null,
      textoBotao:  opts.textoBotao  ?? 'Confirmar',
      variante:    opts.variante    ?? 'danger',
    }
    visivel.value = true
    return new Promise((resolve) => { _resolver = resolve })
  }

  function _aceitar() {
    visivel.value = false
    _resolver?.(true)
  }

  function _recusar() {
    visivel.value = false
    _resolver?.(false)
  }

  return { visivel, opcoes, confirmar, _aceitar, _recusar }
}
