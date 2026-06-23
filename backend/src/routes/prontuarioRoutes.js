const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const ctrl     = require('../controllers/prontuarioController')
const { uploadResultado, uploadAnexo, uploadDocumento } = require('../middleware/upload')

router.use(auth)

// GET /prontuarios/consulta/:consultaId  — busca ou cria prontuário
router.get('/consulta/:consultaId', ctrl.getOrCreate)

// Sinais Vitais
router.put('/:id/sinais-vitais', ctrl.salvarSinaisVitais)

// Anamnese
router.put('/:id/anamnese', ctrl.salvarAnamnese)

// Exame Físico
router.put('/:id/exame-fisico', ctrl.salvarExameFisico)

// Hipóteses Diagnósticas
router.post  ('/:id/hipoteses',                ctrl.adicionarHipotese)
router.patch ('/:id/hipoteses/:hipoteseId',    ctrl.atualizarHipotese)
router.delete('/:id/hipoteses/:hipoteseId',    ctrl.removerHipotese)

// Conduta
router.put('/:id/conduta', ctrl.salvarConduta)

// Exames Solicitados
router.post  ('/:id/exames-solicitados',            ctrl.adicionarExame)
router.patch ('/:id/exames-solicitados/:exameId',   ctrl.atualizarExame)
router.delete('/:id/exames-solicitados/:exameId',   ctrl.removerExame)

// Resultados de Exames (com upload opcional)
router.post  ('/:id/resultados',                    uploadResultado, ctrl.adicionarResultado)
router.delete('/:id/resultados/:resultadoId',       ctrl.removerResultado)

// Prescrições
router.post  ('/:id/prescricoes',                   ctrl.criarPrescricao)
router.delete('/:id/prescricoes/:prescricaoId',     ctrl.removerPrescricao)

// Documentos e Atestados (com upload opcional)
router.post  ('/:id/documentos',                    uploadDocumento, ctrl.adicionarDocumento)
router.delete('/:id/documentos/:docId',             ctrl.removerDocumento)

// Imagens e Anexos
router.post  ('/:id/anexos',                        uploadAnexo, ctrl.adicionarAnexo)
router.delete('/:id/anexos/:anexoId',               ctrl.removerAnexo)

// Acompanhamento / Evolução
router.post  ('/:id/acompanhamentos',               ctrl.adicionarAcompanhamento)
router.patch ('/:id/acompanhamentos/:entradaId',    ctrl.atualizarAcompanhamento)
router.delete('/:id/acompanhamentos/:entradaId',    ctrl.removerAcompanhamento)

module.exports = router
