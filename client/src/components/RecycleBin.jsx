import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronDownRegular,
  DocumentRegular,
  MoreVerticalRegular,
} from '@fluentui/react-icons'
import './RecycleBin.css'

const RecycleBin = () => {
  const [showPersonalVault, setShowPersonalVault] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortMenuRef = useRef(null)

  // Empty state - will be replaced with actual data later
  const deletedItems = []

  const handleSort = (sortType) => {
    setSortBy(sortType)
    setShowSortMenu(false)
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
              </tr>
            </thead>
            {deletedItems.length > 0 && (
              <tbody>
                {deletedItems.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell">{item.name}</td>
                    <td className="table-cell">{item.originalLocation}</td>
                    <td className="table-cell">{item.dateDeleted}</td>
                    <td className="table-cell">{item.size}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Empty State */}
      {deletedItems.length === 0 && (
        <div className="recycle-bin-empty">
          <div className="empty-state-icon">
            <img src="/images/image copy.png" alt="Empty recycle bin" />
          </div>
          <p className="empty-state-text">This folder is empty</p>
        </div>
      )}
    </div>
  )
}

export default RecycleBin

