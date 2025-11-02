import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import FileGrid from '../components/FileGrid'
import SharedView from '../components/SharedView'
import RecycleBin from '../components/RecycleBin'
import FilePreview from '../components/FilePreview'
import CreateFolderModal from '../components/CreateFolderModal'
import RenameModal from '../components/RenameModal'
import { useFileManager } from '../hooks/useFileManager'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'folders', 'images', 'documents'
  const [previewFile, setPreviewFile] = useState(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [renameItem, setRenameItem] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])

  const {
    files,
    currentPath,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem: renameFileOrFolder,
    navigateToFolder,
    navigateToPath,
    downloadFile
  } = useFileManager()

  // Filter files based on search and filter type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterType === 'all') return matchesSearch
    if (filterType === 'folders') return matchesSearch && file.type === 'folder'
    if (filterType === 'images') return matchesSearch && file.type.startsWith('image/')
    if (filterType === 'documents') {
      return matchesSearch && (
        file.type.includes('pdf') ||
        file.type.includes('document') ||
        file.type.includes('text') ||
        file.type.includes('word') ||
        file.type.includes('excel') ||
        file.type.includes('powerpoint')
      )
    }
    return matchesSearch
  })

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files)
    uploadedFiles.forEach(file => uploadFile(file))
  }

  const handleFilesUpload = (files) => {
    files.forEach(file => uploadFile(file))
  }

  const handleFolderUpload = (files) => {
    // Backend team will implement folder upload logic
    console.log('Folder upload:', files)
    alert('Folder upload feature will be implemented by backend team')
  }

  const handleCreateFolder = (folderName) => {
    createFolder(folderName)
    setShowCreateFolder(false)
  }

  // Handlers for Office document creation - Backend team will implement these
  const handleWordDocument = () => {
    console.log('Create Word document')
    alert('Word document creation feature will be implemented by backend team')
  }

  const handleExcelWorkbook = () => {
    console.log('Create Excel workbook')
    alert('Excel workbook creation feature will be implemented by backend team')
  }

  const handlePowerPointPresentation = () => {
    console.log('Create PowerPoint presentation')
    alert('PowerPoint presentation creation feature will be implemented by backend team')
  }

  const handleOneNoteNotebook = () => {
    console.log('Create OneNote notebook')
    alert('OneNote notebook creation feature will be implemented by backend team')
  }

  const handleExcelSurvey = () => {
    console.log('Create Excel survey')
    alert('Excel survey creation feature will be implemented by backend team')
  }

  const handleTextDocument = () => {
    console.log('Create Text document')
    alert('Text document creation feature will be implemented by backend team')
  }

  const handleDelete = () => {
    if (selectedItems.length > 0) {
      if (confirm(`Delete ${selectedItems.length} item(s)?`)) {
        deleteItems(selectedItems)
        setSelectedItems([])
      }
    }
  }

  const handleRename = (newName) => {
    if (renameItem) {
      renameFileOrFolder(renameItem.id, newName)
      setRenameItem(null)
    }
  }

  const handleItemClick = (file) => {
    if (file.type === 'folder') {
      navigateToFolder(file.id)
      setSelectedItems([])
    } else {
      setPreviewFile(file)
    }
  }

  const handleDownload = (file) => {
    downloadFile(file)
  }

  return (
    <div className="dashboard">
      <Navbar
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="dashboard-content">
        <Sidebar
          storageUsed={storageUsed}
          storageTotal={storageTotal}
          filterType={filterType}
          onFilterChange={setFilterType}
          onCreateClick={() => setShowCreateFolder(true)}
          onFilesUpload={handleFilesUpload}
          onFolderUpload={handleFolderUpload}
          onWordDocument={handleWordDocument}
          onExcelWorkbook={handleExcelWorkbook}
          onPowerPointPresentation={handlePowerPointPresentation}
          onOneNoteNotebook={handleOneNoteNotebook}
          onExcelSurvey={handleExcelSurvey}
          onTextDocument={handleTextDocument}
        />

        <div className="main-content">
          {filterType === 'shared' ? (
            <SharedView
              files={files}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onItemClick={handleItemClick}
              onDownload={handleDownload}
            />
          ) : filterType === 'recycle' ? (
            <RecycleBin />
          ) : (
            <>
              <FileGrid
                files={filteredFiles}
                viewMode={viewMode}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                onItemClick={handleItemClick}
                onDownload={handleDownload}
              />
            </>
          )}
        </div>
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownload}
        />
      )}

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {renameItem && (
        <RenameModal
          item={renameItem}
          onClose={() => setRenameItem(null)}
          onRename={handleRename}
        />
      )}
    </div>
  )
}

export default Dashboard
