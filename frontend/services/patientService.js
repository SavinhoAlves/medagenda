import api from './api'

export default {
  listarTodos() {
    return api.get('/pacientes')
  }
}
