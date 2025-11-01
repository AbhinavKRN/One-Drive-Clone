import React from 'react'
import './FilePreview.css'

const FilePreview = ({ file, onClose, onDownload }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="preview-image">
          <img src={file.data} alt={file.name} />
        </div>
      )
    }

    if (file.type.includes('pdf')) {
      return (
        <div className="preview-placeholder">
          <i className="fas fa-file-pdf"></i>
          <p>PDF Preview</p>
          <small>Click download to view the full document</small>
        </div>
      )
    }

    if (file.type.includes('text')) {
      return (
        <div className="preview-text">
          <pre>{file.data || 'Text content preview not available'}</pre>
        </div>
      )
    }

    return (
      <div className="preview-placeholder">
        <i className="fas fa-file"></i>
        <p>No preview available</p>
        <small>Download the file to view it</small>
      </div>
    )
  }

  return (
    <div className="file-preview-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">
            <h2>{file.name}</h2>
            <p>{formatBytes(file.size)} • Modified {formatDate(file.modified)}</p>
          </div>
          <div className="preview-actions">
            <button onClick={() => onDownload(file)} title="Download">
              <i className="fas fa-download"></i>
            </button>
            <button onClick={onClose} title="Close">
              <i className="fas fa-times"></i>
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
