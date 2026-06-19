const express = require('express')

const router = express.Router()
const convenioController = require('../controllers/convenioController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', convenioController.listar)

module.exports = router
