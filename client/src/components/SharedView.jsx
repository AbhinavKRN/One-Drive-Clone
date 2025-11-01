import React, { useState } from 'react'
import FileGrid from './FileGrid'
import './SharedView.css'

const SharedView = ({ files, viewMode, selectedItems, onSelectionChange, onItemClick, onDownload }) => {
  const [activeTab, setActiveTab] = useState('withYou') // 'withYou' or 'byYou'
  const [fileTypeFilter, setFileTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter files based on active tab
  const tabFilteredFiles = files.filter(file => {
    if (activeTab === 'withYou') {
      return file.sharedWithMe // Files shared by others to me
    } else {
      return file.sharedByMe // Files I shared with others
    }
  })

  // Filter by file type
  const typeFilteredFiles = tabFilteredFiles.filter(file => {
    if (fileTypeFilter === 'all') return true
    if (fileTypeFilter === 'folder') return file.type === 'folder'
    if (fileTypeFilter === 'word') return file.type.includes('word') || file.type.includes('doc')
    if (fileTypeFilter === 'excel') return file.type.includes('excel') || file.type.includes('sheet')
    if (fileTypeFilter === 'powerpoint') return file.type.includes('powerpoint') || file.type.includes('presentation')
    if (fileTypeFilter === 'pdf') return file.type.includes('pdf')
    return true
  })

  // Filter by search query
  const filteredFiles = typeFilteredFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.sharedBy && file.sharedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (activeTab === 'byYou') {
    return (
      <div className="shared-view">
        <div className="shared-header">
          <div className="shared-tabs">
            <button
              className={`shared-tab ${activeTab === 'withYou' ? 'active' : ''}`}
              onClick={() => setActiveTab('withYou')}
            >
              With you
            </button>
            <button
              className={`shared-tab ${activeTab === 'byYou' ? 'active' : ''}`}
              onClick={() => setActiveTab('byYou')}
            >
              By you
            </button>
          </div>
        </div>

        <div className="shared-empty-state">
          <h3>Files you share will show up here</h3>
          <img src="/images/empty2.webp" alt="Files you share will show up here" />
        </div>
      </div>
    )
  }

  // Empty state for "With you"
  if (tabFilteredFiles.length === 0) {
    return (
      <div className="shared-view">
        <div className="shared-header">
          <div className="shared-tabs">
            <button
              className={`shared-tab ${activeTab === 'withYou' ? 'active' : ''}`}
              onClick={() => setActiveTab('withYou')}
            >
              With you
            </button>
            <button
              className={`shared-tab ${activeTab === 'byYou' ? 'active' : ''}`}
              onClick={() => setActiveTab('byYou')}
            >
              By you
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'folder' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('folder')}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M2 4.5C2 3.67157 2.67157 3 3.5 3H7.87868C8.14401 3 8.39849 3.10536 8.58579 3.29289L10.2929 5H16.5C17.3284 5 18 5.67157 18 6.5V15.5C18 16.3284 17.3284 17 16.5 17H3.5C2.67157 17 2 16.3284 2 15.5V4.5Z" fill="#FDB900"/>
              </svg>
              Folder
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'word' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('word')}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="1" fill="#2B579A"/>
                <path d="M7 6L8.5 12L10 6L11.5 12L13 6" stroke="white" strokeWidth="1.2" fill="none"/>
              </svg>
              Word
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'excel' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('excel')}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="1" fill="#217346"/>
                <path d="M7 7L10 10M10 10L13 13M10 10L13 7M10 10L7 13" stroke="white" strokeWidth="1.2"/>
              </svg>
              Excel
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'powerpoint' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('powerpoint')}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="1" fill="#D24726"/>
                <rect x="7" y="7" width="6" height="6" fill="white"/>
              </svg>
              PowerPoint
            </button>
            <button
              className={`filter-btn ${fileTypeFilter === 'pdf' ? 'active' : ''}`}
              onClick={() => setFileTypeFilter('pdf')}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="1" fill="#E74856"/>
                <text x="10" y="13" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">PDF</text>
              </svg>
              PDF
            </button>
          </div>

          <div className="shared-search">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#605e5c" strokeWidth="1.5" fill="none"/>
              <path d="M12.5 12.5L16 16" stroke="#605e5c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Filter by name or person"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="shared-empty-state">
          {fileTypeFilter === 'all' ? (
            <>
              <h3>Shared files will show up here</h3>
              <img src="/images/empty2.webp" alt="Shared files will show up here" />
            </>
          ) : (
            <>
              <h3>No results found</h3>
              <img src="/images/empty.webp" alt="No results found" />
            </>
          )}
        </div>
      </div>
    )
  }

  // Files exist, show the grid
  return (
    <div className="shared-view">
      <div className="shared-header">
        <div className="shared-tabs">
          <button
            className={`shared-tab ${activeTab === 'withYou' ? 'active' : ''}`}
            onClick={() => setActiveTab('withYou')}
          >
            With you
          </button>
          <button
            className={`shared-tab ${activeTab === 'byYou' ? 'active' : ''}`}
            onClick={() => setActiveTab('byYou')}
          >
            By you
          </button>
          {activeTab === 'withYou' && (
            <>
              <button
                className={`filter-btn ${fileTypeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${fileTypeFilter === 'folder' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('folder')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4.5C2 3.67157 2.67157 3 3.5 3H7.87868C8.14401 3 8.39849 3.10536 8.58579 3.29289L10.2929 5H16.5C17.3284 5 18 5.67157 18 6.5V15.5C18 16.3284 17.3284 17 16.5 17H3.5C2.67157 17 2 16.3284 2 15.5V4.5Z" fill="#FDB900"/>
                </svg>
                Folder
              </button>
              <button
                className={`filter-btn ${fileTypeFilter === 'word' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('word')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="2" width="14" height="16" rx="1" fill="#2B579A"/>
                  <path d="M7 6L8.5 12L10 6L11.5 12L13 6" stroke="white" strokeWidth="1.2" fill="none"/>
                </svg>
                Word
              </button>
              <button
                className={`filter-btn ${fileTypeFilter === 'excel' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('excel')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="2" width="14" height="16" rx="1" fill="#217346"/>
                  <path d="M7 7L10 10M10 10L13 13M10 10L13 7M10 10L7 13" stroke="white" strokeWidth="1.2"/>
                </svg>
                Excel
              </button>
              <button
                className={`filter-btn ${fileTypeFilter === 'powerpoint' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('powerpoint')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="2" width="14" height="16" rx="1" fill="#D24726"/>
                  <rect x="7" y="7" width="6" height="6" fill="white"/>
                </svg>
                PowerPoint
              </button>
              <button
                className={`filter-btn ${fileTypeFilter === 'pdf' ? 'active' : ''}`}
                onClick={() => setFileTypeFilter('pdf')}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="2" width="14" height="16" rx="1" fill="#E74856"/>
                  <text x="10" y="13" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">PDF</text>
                </svg>
                PDF
              </button>
            </>
          )}
        </div>

        {activeTab === 'withYou' && (
          <div className="shared-search">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#605e5c" strokeWidth="1.5" fill="none"/>
              <path d="M12.5 12.5L16 16" stroke="#605e5c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Filter by name or person"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="shared-empty-state">
          {fileTypeFilter === 'all' ? (
            <>
              <h3>Shared files will show up here</h3>
              <img src="/images/empty2.webp" alt="Shared files will show up here" />
            </>
          ) : (
            <>
              <h3>No results found</h3>
              <img src="/images/empty.webp" alt="No results found" />
            </>
          )}
        </div>
      ) : (
        <div className="shared-content">
          <FileGrid
            files={filteredFiles}
            viewMode={viewMode}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            onItemClick={onItemClick}
            onDownload={onDownload}
          />
        </div>
      )}
    </div>
  )
}

export default SharedView
