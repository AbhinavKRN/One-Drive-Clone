import React from 'react'
import {
  FolderRegular,
  ImageRegular,
  DocumentRegular,
  VideoRegular,
  MusicNote2Regular,
  ArchiveRegular
} from '@fluentui/react-icons'
import './FileGrid.css'

const FileGrid = ({ files, viewMode, selectedItems, onSelectionChange, onItemClick, onDownload }) => {
  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return <FolderRegular />
    }
    if (file.type.startsWith('image/')) {
      return <ImageRegular />
    }
    if (file.type.includes('video')) {
      return <VideoRegular />
    }
    if (file.type.includes('audio')) {
      return <MusicNote2Regular />
    }
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) {
      return <ArchiveRegular />
    }
    return <DocumentRegular />
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
        <h3>Your recent files will show up here</h3>
        <div className="empty-state-illustration">
          <img
            src="/images/image.png"
            alt="Recent files illustration"
            className="empty-state-image"
          />
        </div>
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
                <div style={{ color: '#ffb900' }}>{getFileIcon(file)}</div>
              ) : file.type.startsWith('image/') && file.data ? (
                <img src={file.data} alt={file.name} />
              ) : (
                <div style={{ color: '#0078d4' }}>{getFileIcon(file)}</div>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
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
            <div style={{ color: file.type === 'folder' ? '#ffb900' : '#0078d4' }}>{getFileIcon(file)}</div>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FileGrid
