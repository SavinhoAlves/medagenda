const multer = require('multer')
const path = require('path')
const fs = require('fs')

function storageFor(subdir) {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, '../../uploads', subdir)
      fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename(req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6)
      const ext = path.extname(file.originalname)
      cb(null, unique + ext)
    }
  })
}

const ALLOWED = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt|zip/

function filter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
  if (ALLOWED.test(ext)) cb(null, true)
  else cb(new Error('Tipo de arquivo não permitido: ' + ext))
}

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

exports.uploadResultado = multer({ storage: storageFor('resultados'), fileFilter: filter, limits: { fileSize: MAX_SIZE } }).single('arquivo')
exports.uploadAnexo     = multer({ storage: storageFor('anexos'),     fileFilter: filter, limits: { fileSize: MAX_SIZE } }).single('arquivo')
exports.uploadDocumento = multer({ storage: storageFor('documentos'), fileFilter: filter, limits: { fileSize: MAX_SIZE } }).single('arquivo')
