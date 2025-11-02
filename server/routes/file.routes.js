const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  previewFile,
  deleteFile,
  renameFile,
  getRecycleBinItems,
  restoreItem,
  createEmptyFile
} = require('../controllers/file.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true)
  }
})

router.get('/', authenticate, getAllFiles)
router.get('/recycle-bin', authenticate, getRecycleBinItems)
router.post('/restore/:id', authenticate, restoreItem)
router.post('/create', authenticate, createEmptyFile)
router.get('/:id/preview', authenticate, previewFile)
router.get('/:id/download', authenticate, downloadFile)
router.get('/:id', authenticate, getFile)
router.post('/upload', authenticate, upload.single('file'), uploadFile)
router.delete('/:id', authenticate, deleteFile)
router.patch('/:id/rename', authenticate, renameFile)

module.exports = router

