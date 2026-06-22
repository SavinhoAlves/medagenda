import api from './api'

export default {
  listarTodas() {
    return api.get('/consultas')
  },
  criar(dados) {
    return api.post('/consultas', dados)
  },
  atualizar(id, dados) {
    return api.put(`/consultas/${id}`, dados)
  },
  excluir(id) {
    return api.delete(`/consultas/${id}`)
  },
  alterarStatus(id, status) {
    return api.patch(`/consultas/${id}/status`, { status })
  }
}
