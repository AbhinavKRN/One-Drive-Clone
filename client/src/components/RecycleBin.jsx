import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronDownRegular,
  DocumentRegular,
  MoreVerticalRegular,
} from '@fluentui/react-icons'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../config/api'
import './RecycleBin.css'

const RecycleBin = () => {
  const { getToken } = useAuth()
  const location = useLocation()
  const [showPersonalVault, setShowPersonalVault] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [showActionsMenu, setShowActionsMenu] = useState(null)
  const sortMenuRef = useRef(null)

  // Load recycle bin items
  const loadRecycleBinItems = async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/files/recycle-bin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success') {
        setDeletedItems(data.data.items || [])
      }
    } catch (error) {
      console.error('Error loading recycle bin items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load recycle bin items on mount and when navigating to recycle bin
  useEffect(() => {
    loadRecycleBinItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]) // Reload when pathname changes (user navigates to Recycle Bin)

  // Sort items
  const sortedItems = [...deletedItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.deleted_at) - new Date(a.deleted_at)
      case 'size':
        return b.size - a.size
      case 'location':
        return a.original_location.localeCompare(b.original_location)
      default:
        return 0
    }
  })

  const handleSort = (sortType) => {
    setSortBy(sortType)
    setShowSortMenu(false)
  }

  // Restore item
  const handleRestore = async (item) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/files/restore/${item.id}?item_type=${item.item_type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.status === 'success') {
        loadRecycleBinItems() // Reload items
        alert(`${item.item_type === 'folder' ? 'Folder' : 'File'} restored successfully`)
      } else {
        alert(data.error || 'Failed to restore item')
      }
    } catch (error) {
      console.error('Error restoring item:', error)
      alert('Failed to restore item')
    }
  }

  // Permanently delete item
  const handlePermanentDelete = async (item) => {
    if (!window.confirm(`Permanently delete "${item.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = getToken()
      if (!token) return

      const endpoint = item.item_type === 'folder'
        ? `${API_BASE_URL}/folders/${item.id}?permanent=true`
        : `${API_BASE_URL}/files/${item.id}?permanent=true`

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.status === 'success') {
        loadRecycleBinItems() // Reload items
        alert('Item permanently deleted')
      } else {
        alert(data.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortMenu])

  return (
    <div className="recycle-bin-container">
      {/* Top Bar */}
      <div className="recycle-bin-top-bar">
        <div className="personal-vault-toggle">
          <svg className="vault-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1L3 4V7C3 10.87 5.61 14.34 8 15C10.39 14.34 13 10.87 13 7V4L8 1Z" fill="currentColor"/>
          </svg>
          <span>Show Personal Vault items</span>
          <svg className="ellipsis-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="top-bar-controls">
          <div className="sort-dropdown" ref={sortMenuRef}>
            <button
              className="sort-btn-top"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <svg className="sort-icon-top" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 10l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span>Sort</span>
              <ChevronDownRegular className="dropdown-icon" />
            </button>
            {showSortMenu && (
              <div className="sort-menu">
                <button onClick={() => handleSort('name')}>Name</button>
                <button onClick={() => handleSort('date')}>Date deleted</button>
                <button onClick={() => handleSort('size')}>File size</button>
                <button onClick={() => handleSort('location')}>Original location</button>
              </div>
            )}
          </div>
          <button className="view-btn">
            <svg className="view-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <ChevronDownRegular className="dropdown-icon" />
          </button>
          <button className="details-btn-top">
            <svg className="details-icon-top" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3h8v10H4V3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M6 6h4M6 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 5l2-2v4l-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="recycle-bin-title">Recycle bin</h1>

      {/* Table Header */}
      <div className="recycle-bin-table-header">
        <div className="recycle-bin-table-wrapper">
          <table className="recycle-bin-table">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell">
                  <DocumentRegular className="header-icon" />
                  Name
                </th>
                <th className="table-header-cell">Original location</th>
                <th className="table-header-cell sortable">
                  Date deleted
                  <ChevronDownRegular className="sort-icon" />
                </th>
                <th className="table-header-cell">File size</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            {sortedItems.length > 0 && (
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.item_type === 'folder' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 3h5l2 2h5v8H2V3z" fill="currentColor" opacity="0.6"/>
                          </svg>
                        ) : (
                          <DocumentRegular style={{ width: '16px', height: '16px' }} />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td className="table-cell">{item.original_location}</td>
                    <td className="table-cell">{formatDate(item.deleted_at)}</td>
                    <td className="table-cell">{formatSize(item.size)}</td>
                    <td className="table-cell" style={{ width: '120px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="btn-restore"
                          onClick={() => handleRestore(item)}
                          title="Restore"
                        >
                          Restore
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handlePermanentDelete(item)}
                          title="Delete permanently"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Empty State */}
      {loading ? (
        <div className="recycle-bin-empty">
          <p className="empty-state-text">Loading...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="recycle-bin-empty">
          <div className="empty-state-icon">
            <img src="/images/image copy.png" alt="Empty recycle bin" />
          </div>
          <p className="empty-state-text">This folder is empty</p>
        </div>
      ) : null}
    </div>
  )
}

export default RecycleBin

