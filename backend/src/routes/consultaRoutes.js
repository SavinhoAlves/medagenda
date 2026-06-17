const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const consultaController = require('../controllers/consultaController')

router.use(authMiddleware)

// LISTAR
router.get(
  '/',
  consultaController.listar
)

// CRIAR
router.post(
  '/',
  consultaController.criar
)

// BUSCAR UMA
router.get(
  '/:id',
  consultaController.buscar
)

// ATUALIZAR
router.put(
  '/:id',
  consultaController.atualizar
)

// EXCLUIR
router.delete(
  '/:id',
  consultaController.excluir
)

// ALTERAR STATUS
router.patch(
  '/:id/status',
  consultaController.alterarStatus
)

module.exports = router