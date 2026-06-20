const express = require('express')
const router = express.Router()
const notificacaoController = require('../controllers/notificacaoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/',                    authMiddleware, notificacaoController.listar)
router.get('/count',               authMiddleware, notificacaoController.contarNaoLidas)
router.patch('/:id/ler',           authMiddleware, notificacaoController.marcarLida)
router.post('/ler-todas',          authMiddleware, notificacaoController.marcarTodasLidas)
router.post('/enviar-operadores',  authMiddleware, notificacaoController.enviarParaOperadores)

module.exports = router
