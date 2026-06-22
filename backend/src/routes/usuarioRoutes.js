const express       = require('express')
const router        = express.Router()
const auth          = require('../middlewares/authMiddleware')
const soAdmin       = require('../middlewares/adminMiddleware')
const ctrl          = require('../controllers/usuarioController')

router.use(auth, soAdmin)

router.get('/',       ctrl.listar)
router.post('/',      ctrl.criar)
router.patch('/:id',  ctrl.atualizar)
router.delete('/:id', ctrl.excluir)

module.exports = router
