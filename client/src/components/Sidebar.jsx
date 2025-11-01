import React from 'react'
import './Sidebar.css'

const Sidebar = ({ storageUsed, storageTotal, filterType, onFilterChange }) => {
  const storagePercentage = (storageUsed / storageTotal) * 100

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Quick access</h3>
        <ul className="sidebar-menu">
          <li
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => onFilterChange('all')}
          >
            <i className="fas fa-home"></i>
            <span>All files</span>
          </li>
          <li
            className={filterType === 'folders' ? 'active' : ''}
            onClick={() => onFilterChange('folders')}
          >
            <i className="fas fa-folder"></i>
            <span>Folders</span>
          </li>
          <li
            className={filterType === 'images' ? 'active' : ''}
            onClick={() => onFilterChange('images')}
          >
            <i className="fas fa-image"></i>
            <span>Photos</span>
          </li>
          <li
            className={filterType === 'documents' ? 'active' : ''}
            onClick={() => onFilterChange('documents')}
          >
            <i className="fas fa-file-alt"></i>
            <span>Documents</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-section storage-section">
        <h3>Storage</h3>
        <div className="storage-info">
          <div className="storage-bar">
            <div
              className="storage-bar-fill"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="storage-text">
            {formatBytes(storageUsed)} of {formatBytes(storageTotal)} used
          </p>
          <p className="storage-percentage">{Math.round(storagePercentage)}% full</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
