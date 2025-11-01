import React from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeftRegular,
  HomeRegular,
  FolderRegular,
  ImageMultipleRegular,
  PeopleRegular,
  DeleteRegular,
  PersonRegular,
  DiamondRegular
} from '@fluentui/react-icons'
import './Sidebar.css'

const Sidebar = ({ 
  storageUsed, 
  storageTotal, 
  filterType, 
  onFilterChange, 
  onCreateClick 
}) => {
  const { user } = useAuth()
  const storagePercentage = (storageUsed / storageTotal) * 100

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = bytes / Math.pow(k, i)
    
    if (size < 0.1 && i >= 2) {
      return `< 0.1 ${sizes[i]}`
    }
    
    return Math.round(size * 10) / 10 + ' ' + sizes[i]
  }

  const getDisplaySize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = bytes / Math.pow(k, i)
    
    if (size < 0.1 && i >= 2) {
      return `< 0.1 ${sizes[i]}`
    }
    
    return Math.round(size * 10) / 10 + ' ' + sizes[i]
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button className="sidebar-create-btn" onClick={onCreateClick}>
          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="white" viewBox="0 0 24 24">
            <path d="M12 5v14m-7-7h14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          <span>Create or upload</span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-user-heading">
          <span>{user?.name || 'demo demo'}</span>
          <ArrowLeftRegular className="user-account-icon" />
        </div>
        <ul className="sidebar-menu">
          <li
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => onFilterChange('all')}
          >
            <HomeRegular />
            <span>Home</span>
          </li>
          <li
            className={filterType === 'folders' ? 'active' : ''}
            onClick={() => onFilterChange('folders')}
          >
            <FolderRegular />
            <span>My files</span>
          </li>
          <li
            className={filterType === 'images' ? 'active' : ''}
            onClick={() => onFilterChange('images')}
          >
            <ImageMultipleRegular />
            <span>Photos</span>
          </li>
          <li
            className={filterType === 'shared' ? 'active' : ''}
            onClick={() => onFilterChange('shared')}
          >
            <PeopleRegular />
            <span>Shared</span>
          </li>
          <li
            className={filterType === 'recycle' ? 'active' : ''}
            onClick={() => onFilterChange('recycle')}
          >
            <DeleteRegular />
            <span>Recycle bin</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-heading browse-heading">BROWSE FILES BY</h3>
        <ul className="sidebar-menu">
          <li
            className={filterType === 'people' ? 'active' : ''}
            onClick={() => onFilterChange('people')}
          >
            <PersonRegular />
            <span>People</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-section sidebar-promo">
        <div className="storage-promo">
          <p className="storage-promo-text">Get storage for all your files and photos.</p>
          <button className="storage-promo-btn">
            <DiamondRegular />
            <span>Buy storage</span>
          </button>
        </div>
      </div>

      <div className="sidebar-section storage-section">
        <h3 className="sidebar-heading storage-heading">STORAGE</h3>
        <div className="storage-info">
          <p className="storage-text">
            <span className="storage-link">{getDisplaySize(storageUsed)}</span> used of {getDisplaySize(storageTotal)} ({Math.max(1, Math.round(storagePercentage))}%)
          </p>
          <div className="storage-bar">
            <div
              className="storage-bar-fill"
              style={{ width: `${Math.max(2, Math.min(storagePercentage, 100))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
