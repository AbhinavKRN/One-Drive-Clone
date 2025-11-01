const express = require('express')
const {
  createFolder,
  getAllFolders,
  getFolderHierarchy,
  getFolderFiles,
  deleteFolder,
  renameFolder
} = require('../controllers/folder.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/', authenticate, createFolder)
router.get('/', authenticate, getAllFolders)
router.get('/hierarchy', authenticate, getFolderHierarchy)
router.get('/:id/files', authenticate, getFolderFiles)
router.delete('/:id', authenticate, deleteFolder)
router.patch('/:id/rename', authenticate, renameFolder)

module.exports = router

