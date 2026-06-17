const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')
const especialidadeController = require('../controllers/especialidadeController')

router.use(authMiddleware)

// LISTAR
router.get('/', especialidadeController.listar)

// CRIAR
router.post('/', especialidadeController.criar)

// BUSCAR UMA
router.get('/:id', especialidadeController.buscar)

// ATUALIZAR
router.put('/:id', especialidadeController.atualizar)

// EXCLUIR
router.delete('/:id', especialidadeController.excluir)

module.exports = router