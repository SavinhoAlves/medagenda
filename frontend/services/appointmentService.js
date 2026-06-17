import api from '../../backend/src/services/api'

export default {
  listarTodas() {
    return api.get('/consultas')
  },
  criar(dados) {
    return api.post('/consultas', dados)
  },
  atualizar(id, dados) {
    return api.put(`/consultas/${id}`, dados)
  }
}