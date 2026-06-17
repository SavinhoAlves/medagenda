import api from '../../backend/src/services/api'

export default {
  listarTodos() {
    return api.get('/profissionais')
  }
}