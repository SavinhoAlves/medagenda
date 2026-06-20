const express = require('express')
const router = express.Router()
const solicitacaoController = require('../controllers/solicitacaoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/',                    authMiddleware, solicitacaoController.criar)
router.get('/',                     authMiddleware, solicitacaoController.listar)
router.get('/pendentes/count',      authMiddleware, solicitacaoController.contarPendentes)
router.patch('/:id/aprovar',        authMiddleware, solicitacaoController.aprovar)
router.patch('/:id/rejeitar',       authMiddleware, solicitacaoController.rejeitar)

module.exports = router
