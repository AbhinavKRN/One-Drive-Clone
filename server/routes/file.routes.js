const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  previewFile,
  deleteFile,
  renameFile,
  moveFile,
  getRecycleBinItems,
  restoreItem,
  createEmptyFile,
  shareFile,
  getFileShares,
  unshareFile,
  getSharedFiles,
  createShareLink,
  getShareLink,
  disableShareLink,
  accessSharedFile,
  createEmptyFile,
  shareFile,
  getFileShares,
  unshareFile,
  getSharedFiles,
  createShareLink,
  getShareLink,
  disableShareLink,
  accessSharedFile
} = require('../controllers/file.controller')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  },
});

// Specific routes must come BEFORE generic :id routes
router.get('/', authenticate, getAllFiles)
router.get('/recycle-bin', authenticate, getRecycleBinItems)
router.get('/shared/:token', accessSharedFile) // Public endpoint for accessing shared files (must come before /shared)
router.get('/shared', authenticate, getSharedFiles)
router.post('/upload', authenticate, upload.single('file'), uploadFile)
router.post('/create', authenticate, createEmptyFile)
router.post('/restore/:id', authenticate, restoreItem)

// File-specific routes (must come before generic /:id route)
// Share link routes
router.post('/:id/share-link', authenticate, createShareLink)
router.get('/:id/share-link', authenticate, getShareLink)
router.delete('/:id/share-link', authenticate, disableShareLink)

// Email share routes (must come before /:id)
router.post('/:id/share', authenticate, shareFile)
router.get('/:id/shares', authenticate, getFileShares)
router.delete('/:id/share', authenticate, unshareFile)
router.get('/:id/preview', authenticate, previewFile)
router.get('/:id/download', authenticate, downloadFile)
router.patch('/:id/rename', authenticate, renameFile)

// Generic routes (must come last)
router.get('/:id', authenticate, getFile)
router.delete('/:id', authenticate, deleteFile)

module.exports = router;
