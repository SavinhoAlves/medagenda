const express = require('express')

const router = express.Router()
const convenioController = require('../controllers/convenioController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', convenioController.listar)
router.get('/:id', convenioController.buscarPorId)
router.post('/', convenioController.criar)
router.put('/:id', convenioController.atualizar)
router.delete('/:id', convenioController.deletar)

module.exports = router
