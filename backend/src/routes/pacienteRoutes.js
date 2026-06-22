const express = require('express')

const router = express.Router()

const pacienteController = require('../controllers/pacienteController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get(
  '/',
  pacienteController.listar
)

router.get('/:id/convenios', pacienteController.listarConvenios)
router.post('/:id/convenios', pacienteController.vincularConvenio)
router.patch('/:id/convenios/:convenioId', pacienteController.atualizarConvenio)
router.delete('/:id/convenios/:convenioId', pacienteController.desvincularConvenio)
router.get('/:id/consultas', pacienteController.listarConsultas)

router.get(
  '/:id',
  pacienteController.buscarPorId
)

router.post(
  '/',
  pacienteController.criar
)

router.put(
  '/:id',
  pacienteController.atualizar
)

router.delete(
  '/:id',
  pacienteController.deletar
)

module.exports = router