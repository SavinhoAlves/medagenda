const express = require('express')

const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const profissionalController = require('../controllers/profissionalController')

router.use(authMiddleware)

router.get('/', profissionalController.listar)
router.get('/:id', profissionalController.buscarPorId)
router.post('/', profissionalController.criar)
router.put('/:id', profissionalController.atualizar)
router.delete('/:id', profissionalController.deletar)

module.exports = router
