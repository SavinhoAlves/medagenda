const express = require('express')
const router = express.Router()
const iaController = require('../controllers/iaController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/chat',          authMiddleware, iaController.chat)
router.post('/sugestoes',     authMiddleware, iaController.salvarSugestao)
router.get('/sugestoes',      authMiddleware, iaController.listarSugestoes)
router.patch('/sugestoes/:id',authMiddleware, iaController.atualizarStatusSugestao)

module.exports = router
