import React, { useState, useEffect } from 'react'
import {
  FolderRegular,
  ImageRegular,
  DocumentRegular,
  VideoRegular,
  MusicNote2Regular,
  ArchiveRegular
} from '@fluentui/react-icons'
import './FileGrid.css'

const FileGrid = ({ files, viewMode, selectedItems, onSelectionChange, onItemClick, onDownload, onDelete }) => {
  const [showNameMenu, setShowNameMenu] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [sortOrder, setSortOrder] = useState('ascending')
  const [nameColumnWidth, setNameColumnWidth] = useState(2) // Default 2fr

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.name-header-wrapper')) {
        setShowNameMenu(false)
        setShowColumnSettings(false)
      }
    }

    if (showNameMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showNameMenu])
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

  // Sort files based on sort order
  const sortedFiles = [...files].sort((a, b) => {
    if (sortOrder === 'ascending') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  const handleSortChange = (order) => {
    setSortOrder(order)
    setShowNameMenu(false)
  }

  const handleWidenColumn = () => {
    setNameColumnWidth(prev => Math.min(prev + 0.5, 4))
    setShowColumnSettings(false)
    setShowNameMenu(false)
  }

  const handleNarrowColumn = () => {
    setNameColumnWidth(prev => Math.max(prev - 0.5, 1))
    setShowColumnSettings(false)
    setShowNameMenu(false)
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

            <div className="file-card-actions">
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
              {onDelete && (
                <button
                  className="file-card-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    const itemType = file.type === 'folder' ? 'folder' : 'file'
                    if (window.confirm(`Delete ${itemType} "${file.name}"?`)) {
                      onDelete([file.id])
                    }
                  }}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="file-list">
      <div
        className="file-list-header"
        style={{ gridTemplateColumns: `${nameColumnWidth}fr 1fr 1fr 1fr` }}
      >
        <div className="file-list-col col-name">
          <div className="name-header-wrapper">
            <span
              className="name-header-text"
              onClick={() => setShowNameMenu(!showNameMenu)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginRight: '4px' }}>
                <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
              </svg>
              Name
            </span>
            {showNameMenu && (
              <div className="name-dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => handleSortChange('ascending')}
                >
                  Ascending
                </div>
                <div
                  className="menu-item"
                  onClick={() => handleSortChange('descending')}
                >
                  Descending
                </div>
                <div
                  className="menu-item menu-item-with-arrow"
                  onMouseEnter={() => setShowColumnSettings(true)}
                  onMouseLeave={() => setShowColumnSettings(false)}
                >
                  Column settings
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M4 2L9 6L4 10V2Z" />
                  </svg>
                  {showColumnSettings && (
                    <div className="column-settings-submenu">
                      <div
                        className="menu-item"
                        onClick={handleWidenColumn}
                      >
                        Widen column
                      </div>
                      <div
                        className="menu-item"
                        onClick={handleNarrowColumn}
                      >
                        Narrow column
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="file-list-col col-modified">Modified</div>
        <div className="file-list-col col-size">File size</div>
        <div className="file-list-col col-sharing">Sharing</div>
      </div>

      {sortedFiles.map(file => (
        <div
          key={file.id}
          className={`file-list-row ${selectedItems.includes(file.id) ? 'selected' : ''}`}
          style={{ gridTemplateColumns: `${nameColumnWidth}fr 1fr 1fr 1fr` }}
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
            <div className="inline-actions">
              <button
                className="btn-icon action-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  // More options
                }}
                title="More options"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="12" cy="6" r="1.5"></circle>
                  <circle cx="12" cy="18" r="1.5"></circle>
                </svg>
              </button>
              {onDelete && (
                <button
                  className="btn-icon action-icon delete-icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Delete "${file.name}"?`)) {
                      onDelete([file.id])
                    }
                  }}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
              <button
                className="btn-icon action-icon"
                onClick={(e) => {
                  e.stopPropagation()
                  // Share action
                }}
                title="Share"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="file-list-col col-modified">
            {formatDate(file.modified)}
          </div>

          <div className="file-list-col col-size">
            {file.type === 'folder' ? '0 items' : formatBytes(file.size)}
          </div>

          <div className="file-list-col col-sharing">
            Private
          </div>
        </div>
      ))}
    </div>
  )
}

export default FileGrid
