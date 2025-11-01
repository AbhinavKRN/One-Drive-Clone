import React from 'react'
import './FileGrid.css'

const FileGrid = ({ files, viewMode, selectedItems, onSelectionChange, onItemClick, onDownload }) => {
  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return 'fas fa-folder'
    }
    if (file.type.startsWith('image/')) {
      return 'fas fa-file-image'
    }
    if (file.type.includes('pdf')) {
      return 'fas fa-file-pdf'
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return 'fas fa-file-word'
    }
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return 'fas fa-file-excel'
    }
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
      return 'fas fa-file-powerpoint'
    }
    if (file.type.includes('video')) {
      return 'fas fa-file-video'
    }
    if (file.type.includes('audio')) {
      return 'fas fa-file-audio'
    }
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) {
      return 'fas fa-file-archive'
    }
    return 'fas fa-file'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSelection = (fileId, e) => {
    e.stopPropagation()
    if (selectedItems.includes(fileId)) {
      onSelectionChange(selectedItems.filter(id => id !== fileId))
    } else {
      onSelectionChange([...selectedItems, fileId])
    }
  }

  const handleContextMenu = (e, file) => {
    e.preventDefault()
    // Could implement context menu here
  }

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-folder-open"></i>
        <h3>This folder is empty</h3>
        <p>Upload files or create a new folder to get started</p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="file-grid">
        {files.map(file => (
          <div
            key={file.id}
            className={`file-card ${selectedItems.includes(file.id) ? 'selected' : ''}`}
            onClick={() => onItemClick(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
          >
            <div className="file-card-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.includes(file.id)}
                onChange={(e) => handleSelection(file.id, e)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="file-card-icon">
              {file.type === 'folder' ? (
                <i className={getFileIcon(file)} style={{ color: '#ffb900' }}></i>
              ) : file.type.startsWith('image/') && file.data ? (
                <img src={file.data} alt={file.name} />
              ) : (
                <i className={getFileIcon(file)} style={{ color: '#0078d4' }}></i>
              )}
            </div>

            <div className="file-card-info">
              <div className="file-name" title={file.name}>{file.name}</div>
              <div className="file-meta">
                {file.type !== 'folder' && <span>{formatBytes(file.size)}</span>}
                <span>{formatDate(file.modified)}</span>
              </div>
            </div>

            {file.type !== 'folder' && (
              <button
                className="file-card-download"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(file)
                }}
                title="Download"
              >
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <div className="file-list-col col-name">Name</div>
        <div className="file-list-col col-modified">Modified</div>
        <div className="file-list-col col-size">Size</div>
        <div className="file-list-col col-actions"></div>
      </div>

      {files.map(file => (
        <div
          key={file.id}
          className={`file-list-row ${selectedItems.includes(file.id) ? 'selected' : ''}`}
          onClick={() => onItemClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
        >
          <div className="file-list-col col-name">
            <input
              type="checkbox"
              checked={selectedItems.includes(file.id)}
              onChange={(e) => handleSelection(file.id, e)}
              onClick={(e) => e.stopPropagation()}
            />
            <i className={getFileIcon(file)} style={{ color: file.type === 'folder' ? '#ffb900' : '#0078d4' }}></i>
            <span className="file-name">{file.name}</span>
          </div>

          <div className="file-list-col col-modified">
            {formatDate(file.modified)}
          </div>

          <div className="file-list-col col-size">
            {file.type !== 'folder' ? formatBytes(file.size) : '-'}
          </div>

          <div className="file-list-col col-actions">
            {file.type !== 'folder' && (
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(file)
                }}
                title="Download"
              >
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FileGrid
