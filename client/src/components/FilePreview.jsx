import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../config/api'
import './FilePreview.css'

const FilePreview = ({ file, onClose, onDownload }) => {
  const { getToken } = useAuth()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [textContent, setTextContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Handle ESC key to close preview
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    if (!file) {
      console.warn('⚠️ FilePreview: No file provided')
      return
    }

    if (!file.id) {
      console.error('❌ FilePreview: File missing ID', file)
      setError('Invalid file: missing ID')
      setLoading(false)
      return
    }

    const loadPreview = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const token = getToken()
        if (!token) {
          setError('Authentication required')
          setLoading(false)
          return
        }

        // Normalize file type (handle missing or undefined types)
        const fileType = file.type || ''
        const fileName = file.name || ''
        const lowerFileName = fileName.toLowerCase()
        
        // Check if it's a text file first by extension
        const isTextFile = fileType.includes('text') || 
                          fileType.includes('text/plain') ||
                          fileType.includes('application/json') ||
                          lowerFileName.endsWith('.txt') || 
                          lowerFileName.endsWith('.json') ||
                          lowerFileName.endsWith('.xml') ||
                          lowerFileName.endsWith('.csv') ||
                          lowerFileName.endsWith('.js') ||
                          lowerFileName.endsWith('.jsx') ||
                          lowerFileName.endsWith('.ts') ||
                          lowerFileName.endsWith('.tsx') ||
                          lowerFileName.endsWith('.css') ||
                          lowerFileName.endsWith('.html') ||
                          lowerFileName.endsWith('.md') ||
                          lowerFileName.endsWith('.log') ||
                          lowerFileName.endsWith('.yaml') ||
                          lowerFileName.endsWith('.yml')

        console.log('🔍 Loading preview for file:', {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size
        })

        // Use preview endpoint for inline display
        const response = await fetch(`${API_BASE_URL}/files/${file.id}/preview`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📥 Preview response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          ok: response.ok
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Preview failed:', errorText)
          let errorMessage = 'Failed to load file'
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
          } catch {
            errorMessage = response.status === 404 ? 'File not found' : 
                          response.status === 401 ? 'Unauthorized' :
                          response.status === 403 ? 'Access denied' :
                          `Server error (${response.status})`
          }
          throw new Error(errorMessage)
        }

        if (isTextFile) {
          // For text files, fetch as text
          const text = await response.text()
          if (text && text.length > 0) {
            setTextContent(text)
          } else {
            throw new Error('File appears to be empty')
          }
        } else {
          // For images, PDFs, videos, audio, and other binary files, fetch as blob
          const blob = await response.blob()
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
          } else {
            throw new Error('File appears to be empty')
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Preview load error:', err)
        setError(err.message || 'Failed to load preview')
        setLoading(false)
      }
    }

    loadPreview()

    // Cleanup: revoke object URL when component unmounts or file changes
    return () => {
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }
        return null
      })
      setTextContent(null)
    }
  }, [file, getToken])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = () => {
    if (!file) return '📁'
    const fileType = file.type || ''
    const fileName = (file.name || '').toLowerCase()
    
    if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i)) {
      return '🖼️'
    }
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return '📄'
    }
    if (fileType.includes('video') || fileName.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
      return '🎥'
    }
    if (fileType.includes('audio') || fileName.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i)) {
      return '🎵'
    }
    if (fileType.includes('text') || fileName.match(/\.(txt|json|xml|csv|js|jsx|ts|tsx|css|html|md|log|yaml|yml)$/i)) {
      return '📝'
    }
    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return '📘'
    }
    if (fileType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return '📊'
    }
    if (fileType.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return '📽️'
    }
    return '📁'
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <p>Loading preview...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="preview-error">
          <div className="error-icon">⚠️</div>
          <p>Could not load preview</p>
          <small>{error}</small>
          <button className="download-btn-large" onClick={() => onDownload(file)}>
            Download File
          </button>
        </div>
      )
    }

    // Normalize file type for preview rendering
    const fileType = file.type || ''
    const fileName = (file.name || '').toLowerCase()
    
    // Image preview
    if ((fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i)) && previewUrl) {
      return (
        <div className="preview-image">
          <img src={previewUrl} alt={file.name} onError={() => setError('Failed to load image')} />
        </div>
      )
    }

    // PDF preview
    if ((fileType.includes('pdf') || fileName.endsWith('.pdf')) && previewUrl) {
      return (
        <div className="preview-pdf">
          <iframe 
            src={previewUrl} 
            title={file.name}
            className="pdf-iframe"
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      )
    }

    // Video preview
    if ((fileType.includes('video') || 
         fileName.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) && previewUrl) {
      return (
        <div className="preview-video">
          <video controls src={previewUrl} className="video-player" onError={() => setError('Failed to load video')}>
            Your browser does not support video playback.
          </video>
        </div>
      )
    }

    // Audio preview
    if ((fileType.includes('audio') || 
         fileName.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i)) && previewUrl) {
      return (
        <div className="preview-audio">
          <div className="audio-player-wrapper">
            <div className="audio-icon">🎵</div>
            <audio controls src={previewUrl} className="audio-player" onError={() => setError('Failed to load audio')}>
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      )
    }

    // Text preview
    if (textContent !== null) {
      return (
        <div className="preview-text">
          <div className="text-content-wrapper">
            <pre className="text-preview">{textContent}</pre>
          </div>
        </div>
      )
    }

    // Fallback for unsupported file types
    return (
      <div className="preview-placeholder">
        <div className="file-icon-large">{getFileIcon()}</div>
        <p>Preview not available</p>
        <small>This file type cannot be previewed in the browser</small>
        <button className="download-btn-large" onClick={() => onDownload(file)}>
          Download to View
        </button>
      </div>
    )
  }

  return (
    <div className="file-preview-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">
            <h2>{file.name}</h2>
            <p>{formatBytes(file.size || 0)} • Modified {formatDate(file.modified || file.updated_at || file.created_at)}</p>
          </div>
          <div className="preview-actions">
            <button onClick={() => onDownload(file)} title="Download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button onClick={onClose} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="preview-content">
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}

export default FilePreview
