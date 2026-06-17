const express = require('express')

const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const profissionalController = require('../controllers/profissionalController')

router.use(authMiddleware)

router.get('/:id', profissionalController.buscarPorId)

router.get('/', profissionalController.listar)
router.post('/', profissionalController.criar)

module.exports = router