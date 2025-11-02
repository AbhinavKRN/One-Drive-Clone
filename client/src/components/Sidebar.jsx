import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeftRegular,
  HomeRegular,
  HomeFilled,
  FolderRegular,
  FolderFilled,
  ImageMultipleRegular,
  PeopleRegular,
  PeopleFilled,
  DeleteRegular,
  DeleteFilled,
  PersonRegular,
  PersonFilled,
  DiamondRegular,
  ArrowRightRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  DocumentRegular,
  ArrowUploadRegular,
  TableRegular,
  SlideTextRegular,
  DocumentArrowUpRegular,
  FolderArrowUpRegular
} from '@fluentui/react-icons'
import './Sidebar.css'

const Sidebar = ({ 
  storageUsed, 
  storageTotal, 
  filterType, 
  onFilterChange,
  folders = [],
  onFolderClick,
  onCreateClick,
  onFilesUpload,
  onFolderUpload,
  onWordDocument,
  onExcelWorkbook,
  onPowerPointPresentation,
  onOneNoteNotebook,
  onExcelSurvey,
  onTextDocument
}) => {
  const { user } = useAuth()
  const [openCloseArrow, setOpenCloseArrow] = useState(false)
  const [isBrowseFilesExpanded, setIsBrowseFilesExpanded] = useState(false)
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const storagePercentage = (storageUsed / storageTotal) * 100

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowCreateDropdown(false)
      }
    }

    if (showCreateDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCreateDropdown])

  const handleCreateButtonClick = () => {
    setShowCreateDropdown(!showCreateDropdown)
  }

  const handleFolderClick = () => {
    if (onCreateClick) onCreateClick()
    setShowCreateDropdown(false)
  }

  const handleFilesUploadClick = () => {
    fileInputRef.current?.click()
    setShowCreateDropdown(false)
  }

  const handleFolderUploadClick = () => {
    folderInputRef.current?.click()
    setShowCreateDropdown(false)
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0 && onFilesUpload) {
      onFilesUpload(files)
    }
    e.target.value = "" // Reset input
  }

  const handleFolderInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0 && onFolderUpload) {
      onFolderUpload(files)
    }
    e.target.value = "" // Reset input
  }

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

  return (
    <>
      {openCloseArrow ? (
        // 🔹 Collapsed Sidebar
        <aside className="sidebar-closed">
          <div className="sidebar-section">
            <div className="sidebar-create-btn-wrapper">
              <button 
                ref={buttonRef}
                className="sidebar-create-btn" 
                onClick={handleCreateButtonClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 5v14m-7-7h14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </button>
              {showCreateDropdown && (
                <div ref={dropdownRef} className="sidebar-create-dropdown">
                  <div className="sidebar-dropdown-item" onClick={handleFolderClick}>
                    <div className="sidebar-dropdown-icon folder-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/folder.svg" alt="folder" />
                    </div>
                    <span>Folder</span>
                  </div>
                  <div className="sidebar-dropdown-separator"></div>
                  <div className="sidebar-dropdown-item" onClick={handleFilesUploadClick}>
                    <div className="sidebar-dropdown-icon document-upload-icon">
                      <DocumentArrowUpRegular />
                    </div>
                    <span>Files upload</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={handleFolderUploadClick}>
                    <div className="sidebar-dropdown-icon folder-upload-icon">
                      <FolderArrowUpRegular />
                    </div>
                    <span>Folder upload</span>
                  </div>
                  <div className="sidebar-dropdown-separator"></div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onWordDocument) onWordDocument(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon word-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/docx.svg" alt="docx" />
                    </div>
                    <span>Word document</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onExcelWorkbook) onExcelWorkbook(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon excel-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg" alt="xlsx" />
                    </div>
                    <span>Excel workbook</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onPowerPointPresentation) onPowerPointPresentation(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon powerpoint-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/pptx.svg" alt="pptx" />
                    </div>
                    <span>PowerPoint presentation</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onOneNoteNotebook) onOneNoteNotebook(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon onenote-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/onetoc.svg" alt="onetoc" />
                    </div>
                    <span>OneNote notebook</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onExcelSurvey) onExcelSurvey(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon excel-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg" alt="xlsx" />
                    </div>
                    <span>Excel survey</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onTextDocument) onTextDocument(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon text-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/txt.svg" alt="txt" />
                    </div>
                    <span>Text Document</span>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
              <input ref={folderInputRef} type="file" webkitdirectory="" directory="" multiple onChange={handleFolderInputChange} style={{ display: "none" }} />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-user-heading">
              <ArrowRightRegular className="user-account-icon" onClick={() => setOpenCloseArrow(!openCloseArrow)} />
            </div>
            <ul className="sidebar-menu">
              <li className={filterType === 'all' ? 'active' : ''} onClick={() => onFilterChange('all')}>
                {filterType === 'all' ? <HomeFilled /> : <HomeRegular />}
              </li>
              <li className={filterType === 'folders' ? 'active' : ''} onClick={() => onFilterChange('folders')}>
                {filterType === 'folders' ? <FolderFilled /> : <FolderRegular />}
              </li>
              <li className={filterType === 'shared' ? 'active' : ''} onClick={() => onFilterChange('shared')}>
                {filterType === 'shared' ? <PeopleFilled /> : <PeopleRegular />}
              </li>
              <li className={filterType === 'recycle' ? 'active' : ''} onClick={() => onFilterChange('recycle')}>
                {filterType === 'recycle' ? <DeleteFilled /> : <DeleteRegular />}
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading-container" onClick={() => setIsBrowseFilesExpanded(!isBrowseFilesExpanded)}>
              <h3 className="sidebar-heading browse-heading">BROWSE FILES BY</h3>
              {isBrowseFilesExpanded ? (
                <ChevronDownRegular className="browse-arrow-icon" />
              ) : (
                <ChevronRightRegular className="browse-arrow-icon" />
              )}
            </div>
            {isBrowseFilesExpanded && (
              <ul className="sidebar-menu">
                <li className={filterType === 'people' ? 'active' : ''} onClick={() => onFilterChange('people')}>
                  {filterType === 'people' ? <PersonFilled /> : <PersonRegular />}
                </li>
              </ul>
            )}
          </div>

          <div className="sidebar-section storage-section">
            <div className="sidebar-promo">
              <div className="storage-promo">
                <button className="storage-promo-btn">
                  <img src="/images/image copy 2.png" alt="Diamond" className="buy-storage-diamond-icon" />
                </button>
              </div>
            </div>
            <h3 className="sidebar-heading storage-heading">STORAGE</h3>
            <div className="storage-info">
              <p className="storage-text">
                <span className="storage-link">{formatBytes(storageUsed)}</span> used of {formatBytes(storageTotal)} (
                {Math.max(1, Math.round(storagePercentage))}%)
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
      ) : (
        // 🔹 Expanded Sidebar
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-create-btn-wrapper">
              <button 
                ref={buttonRef}
                className="sidebar-create-btn" 
                onClick={handleCreateButtonClick}
              >
                <svg className="create-btn-icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 5v14m-7-7h14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <span>Create or upload</span>
              </button>
              {showCreateDropdown && (
                <div ref={dropdownRef} className="sidebar-create-dropdown">
                  <div className="sidebar-dropdown-item" onClick={handleFolderClick}>
                    <div className="sidebar-dropdown-icon folder-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/folder.svg" alt="folder" />
                    </div>
                    <span>Folder</span>
                  </div>
                  <div className="sidebar-dropdown-separator"></div>
                  <div className="sidebar-dropdown-item" onClick={handleFilesUploadClick}>
                    <div className="sidebar-dropdown-icon document-upload-icon">
                      <DocumentArrowUpRegular />
                    </div>
                    <span>Files upload</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={handleFolderUploadClick}>
                    <div className="sidebar-dropdown-icon folder-upload-icon">
                      <FolderArrowUpRegular />
                    </div>
                    <span>Folder upload</span>
                  </div>
                  <div className="sidebar-dropdown-separator"></div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onWordDocument) onWordDocument(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon word-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/docx.svg" alt="docx" />
                    </div>
                    <span>Word document</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onExcelWorkbook) onExcelWorkbook(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon excel-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg" alt="xlsx" />
                    </div>
                    <span>Excel workbook</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onPowerPointPresentation) onPowerPointPresentation(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon powerpoint-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/pptx.svg" alt="pptx" />
                    </div>
                    <span>PowerPoint presentation</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onOneNoteNotebook) onOneNoteNotebook(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon onenote-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/onetoc.svg" alt="onetoc" />
                    </div>
                    <span>OneNote notebook</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onExcelSurvey) onExcelSurvey(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon excel-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg" alt="xlsx" />
                    </div>
                    <span>Excel survey</span>
                  </div>
                  <div className="sidebar-dropdown-item" onClick={() => { if (onTextDocument) onTextDocument(); setShowCreateDropdown(false); }}>
                    <div className="sidebar-dropdown-icon text-icon">
                      <img src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/txt.svg" alt="txt" />
                    </div>
                    <span>Text Document</span>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" multiple onChange={handleFileInputChange} style={{ display: "none" }} />
              <input ref={folderInputRef} type="file" webkitdirectory="" directory="" multiple onChange={handleFolderInputChange} style={{ display: "none" }} />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-user-heading">
              <span>{user?.name || 'demo demo'}</span>
              <ArrowLeftRegular className="user-account-icon" onClick={() => setOpenCloseArrow(!openCloseArrow)} />
            </div>
            <ul className="sidebar-menu">
              <li className={filterType === 'all' ? 'active' : ''} onClick={() => onFilterChange('all')}>
                {filterType === 'all' ? <HomeFilled /> : <HomeRegular />}
                <span>Home</span>
              </li>
              <li className={filterType === 'myfiles' ? 'active' : ''} onClick={() => onFilterChange('myfiles')}>
                {filterType === 'myfiles' ? <FolderFilled /> : <FolderRegular />}
                <span>My files</span>
              </li>
              <li className={filterType === 'shared' ? 'active' : ''} onClick={() => onFilterChange('shared')}>
                {filterType === 'shared' ? <PeopleFilled /> : <PeopleRegular />}
                <span>Shared</span>
              </li>
              <li className={filterType === 'recycle' ? 'active' : ''} onClick={() => onFilterChange('recycle')}>
                {filterType === 'recycle' ? <DeleteFilled /> : <DeleteRegular />}
                <span>Recycle bin</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading-container" onClick={() => setIsBrowseFilesExpanded(!isBrowseFilesExpanded)}>
              <h3 className="sidebar-heading browse-heading">BROWSE FILES BY</h3>
              {isBrowseFilesExpanded ? (
                <ChevronDownRegular className="browse-arrow-icon" />
              ) : (
                <ChevronRightRegular className="browse-arrow-icon" />
              )}
            </div>
            {isBrowseFilesExpanded && (
              <ul className="sidebar-menu">
                {folders.filter(f => !f.parentId).length > 0 && folders.filter(f => !f.parentId).map(folder => (
                  <li
                    key={folder.id}
                    className={filterType === folder.name.toLowerCase() ? 'active' : ''}
                    onClick={() => onFolderClick ? onFolderClick(folder.id) : null}
                  >
                    {filterType === folder.name.toLowerCase() ? <FolderFilled /> : <FolderRegular />}
                    <span>{folder.name}</span>
                  </li>
                ))}
                <li className={filterType === 'people' ? 'active' : ''} onClick={() => onFilterChange('people')}>
                  {filterType === 'people' ? <PersonFilled /> : <PersonRegular />}
                  <span>People</span>
                </li>
              </ul>
            )}
          </div>

          <div className="sidebar-section storage-section">
            <div className="sidebar-promo">
              <div className="storage-promo">
                <p className="storage-promo-text">Get storage for all your files and photos.</p>
                <button className="storage-promo-btn">
                  <img src="/images/image copy 2.png" alt="Diamond" className="buy-storage-diamond-icon" />
                  <span>Buy storage</span>
                </button>
              </div>
            </div>
            <h3 className="sidebar-heading storage-heading">STORAGE</h3>
            <div className="storage-info">
              <p className="storage-text">
                <span className="storage-link">{formatBytes(storageUsed)}</span> used of {formatBytes(storageTotal)} (
                {Math.max(1, Math.round(storagePercentage))}%)
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
      )}
    </>
  )
}

export default Sidebar
