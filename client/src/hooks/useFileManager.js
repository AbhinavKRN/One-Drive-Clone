import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../config/api'

export const useFileManager = () => {
  const { getToken } = useAuth()
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Files' }])
  const storageTotal = 5 * 1024 * 1024 * 1024 // 5GB in bytes
  const [storageUsed, setStorageUsed] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load files and folders
  const loadData = async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) return

      // Load files
      const filesResponse = await fetch(`${API_BASE_URL}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const filesData = await filesResponse.json()

      // Load folders
      const foldersResponse = await fetch(`${API_BASE_URL}/folders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const foldersData = await foldersResponse.json()

      if (filesData.status === 'success' && foldersData.status === 'success') {
        const allFiles = filesData.data.files || []
        const allFolders = foldersData.data.folders || []

        // Filter files and folders by current folder
        const currentFiles = allFiles.filter(file => 
          (currentFolderId === null && !file.folder_id) || 
          file.folder_id === currentFolderId
        )
        const currentFoldersList = allFolders.filter(folder => 
          (currentFolderId === null && !folder.parent_id) || 
          folder.parent_id === currentFolderId
        )

        // Combine and sort
        const combined = [
          ...currentFoldersList.map(folder => ({
            ...folder,
            id: folder.id,
            name: folder.name,
            type: 'folder',
            modified: folder.created_at,
            parentId: folder.parent_id,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at
          })),
          ...currentFiles.map(file => ({
            ...file,
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            modified: file.updated_at
          }))
        ].sort((a, b) => {
          // Folders first, then alphabetically
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.name.localeCompare(b.name)
        })

        setFiles(combined)
        // Normalize folder field names from snake_case to camelCase
        const normalizedFolders = allFolders.map(folder => ({
          ...folder,
          parentId: folder.parent_id,
          createdAt: folder.created_at,
          updatedAt: folder.updated_at
        }))
        setFolders(normalizedFolders)

        // Calculate storage
        const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0)
        setStorageUsed(totalSize)

        // Build breadcrumbs
        if (currentFolderId) {
          const path = buildPathToFolder(currentFolderId, normalizedFolders)
          setBreadcrumbs([{ id: null, name: 'My Files' }, ...path])
        } else {
          setBreadcrumbs([{ id: null, name: 'My Files' }])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Build path to folder for breadcrumbs
  const buildPathToFolder = (folderId, allFolders) => {
    const path = []
    let currentId = folderId

    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId)
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name })
        currentId = folder.parentId
      } else {
        break
      }
    }

    return path
  }

  useEffect(() => {
    loadData()
  }, [currentFolderId])

  // Upload file
  const uploadFile = async (file) => {
    try {
      const token = getToken()
      if (!token) return

      const formData = new FormData()
      formData.append('file', file)
      if (currentFolderId) {
        formData.append('folder_id', currentFolderId)
      }

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (data.status === 'success') {
        loadData()
      } else {
        alert(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    }
  }

  // Create folder
  const createFolder = async (folderName) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          parent_id: currentFolderId || null
        })
      })

      const data = await response.json()
      if (data.status === 'success') {
        loadData()
      } else {
        alert(data.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Create folder error:', error)
      alert('Failed to create folder')
    }
  }

  // Delete items
  const deleteItems = async (itemIds) => {
    try {
      const token = getToken()
      if (!token) return

      const deletePromises = itemIds.map(async (itemId) => {
        const item = files.find(f => f.id === itemId)
        const endpoint = item?.type === 'folder' 
          ? `${API_BASE_URL}/folders/${itemId}`
          : `${API_BASE_URL}/files/${itemId}`

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        return response.json()
      })

      await Promise.all(deletePromises)
      loadData()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete items')
    }
  }

  // Rename item
  const renameItem = async (itemId, newName) => {
    try {
      const token = getToken()
      if (!token) return

      const item = files.find(f => f.id === itemId)
      const endpoint = item?.type === 'folder'
        ? `${API_BASE_URL}/folders/${itemId}/rename`
        : `${API_BASE_URL}/files/${itemId}/rename`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      })

      const data = await response.json()
      if (data.status === 'success') {
        loadData()
      } else {
        alert(data.error || 'Failed to rename item')
      }
    } catch (error) {
      console.error('Rename error:', error)
      alert('Failed to rename item')
    }
  }

  // Navigate to folder
  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId)
  }

  // Navigate to specific path (for breadcrumbs)
  const navigateToPath = (pathId) => {
    setCurrentFolderId(pathId)
  }

  // Download file
  const downloadFile = async (file) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to download file')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  return {
    files,
    currentPath: currentFolderId,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem,
    navigateToFolder,
    navigateToPath,
    downloadFile,
    loading
  }
}