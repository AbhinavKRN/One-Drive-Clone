const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const fileRoutes = require('./routes/file.routes')
const folderRoutes = require('./routes/folder.routes')

const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost', 'http://localhost:80', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'OneDrive Backend API is running',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/folders', folderRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Route not found',
    code: 404
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    status: 'error',
    error: err.message || 'Internal server error',
    code: err.status || 500
  })
})

// Start server
const PORT = process.env.PORT || 5001

console.log('✅ Using Supabase as database')
app.listen(PORT, () => {
  console.log(`🚀 OneDrive Backend API running on port ${PORT}`)
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing server')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing server')
  process.exit(0)
})

