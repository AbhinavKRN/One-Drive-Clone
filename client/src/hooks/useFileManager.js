import { useState, useEffect } from 'react'

export const useFileManager = (userEmail) => {
  const [files, setFiles] = useState([])
  const [currentPath, setCurrentPath] = useState('root')
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'My Files' }])
  const storageTotal = 5 * 1024 * 1024 * 1024 // 5GB in bytes
  const [storageUsed, setStorageUsed] = useState(0)

  // Storage key for this user
  const storageKey = `onedrive_files_${userEmail}`

  // Load files from localStorage
  useEffect(() => {
    if (userEmail) {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const { fileSystem, currentPath: savedPath } = JSON.parse(savedData)
        loadCurrentFolder(fileSystem, savedPath)
        calculateStorage(fileSystem)
      } else {
        // Initialize with empty root
        const initialData = {
          fileSystem: {
            root: {
              id: 'root',
              name: 'My Files',
              type: 'folder',
              children: [],
              parent: null,
              modified: new Date().toISOString()
            }
          },
          currentPath: 'root'
        }
        localStorage.setItem(storageKey, JSON.stringify(initialData))
      }
    }
  }, [userEmail])

  // Load current folder contents
  const loadCurrentFolder = (fileSystem, pathId) => {
    const folder = fileSystem[pathId]
    if (folder && folder.type === 'folder') {
      const folderFiles = folder.children
        .map(childId => fileSystem[childId])
        .filter(Boolean)
        .sort((a, b) => {
          // Folders first, then alphabetically
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.name.localeCompare(b.name)
        })

      setFiles(folderFiles)
      setCurrentPath(pathId)

      // Build breadcrumbs
      const crumbs = []
      let currentId = pathId
      while (currentId) {
        const current = fileSystem[currentId]
        if (current) {
          crumbs.unshift({ id: current.id, name: current.name })
          currentId = current.parent
        } else {
          break
        }
      }
      setBreadcrumbs(crumbs)
    }
  }

  // Calculate total storage used
  const calculateStorage = (fileSystem) => {
    let total = 0
    Object.values(fileSystem).forEach(item => {
      if (item.type !== 'folder' && item.size) {
        total += item.size
      }
    })
    setStorageUsed(total)
  }

  // Save to localStorage
  const saveToStorage = (fileSystem, path) => {
    localStorage.setItem(storageKey, JSON.stringify({
      fileSystem,
      currentPath: path
    }))
    loadCurrentFolder(fileSystem, path)
    calculateStorage(fileSystem)
  }

  // Get current file system
  const getFileSystem = () => {
    const savedData = localStorage.getItem(storageKey)
    if (savedData) {
      return JSON.parse(savedData).fileSystem
    }
    return {}
  }

  // Upload file
  const uploadFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const fileSystem = getFileSystem()
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newFile = {
        id: fileId,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: e.target.result,
        parent: currentPath,
        modified: new Date().toISOString()
      }

      fileSystem[fileId] = newFile

      // Add to parent's children
      if (!fileSystem[currentPath].children.includes(fileId)) {
        fileSystem[currentPath].children.push(fileId)
        fileSystem[currentPath].modified = new Date().toISOString()
      }

      saveToStorage(fileSystem, currentPath)
    }

    // Read file based on type
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('text/')) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  // Create folder
  const createFolder = (folderName) => {
    const fileSystem = getFileSystem()
    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check if folder with same name exists
    const existingFolder = files.find(f => f.name === folderName && f.type === 'folder')
    if (existingFolder) {
      alert('A folder with this name already exists')
      return
    }

    const newFolder = {
      id: folderId,
      name: folderName,
      type: 'folder',
      children: [],
      parent: currentPath,
      modified: new Date().toISOString()
    }

    fileSystem[folderId] = newFolder

    // Add to parent's children
    if (!fileSystem[currentPath].children.includes(folderId)) {
      fileSystem[currentPath].children.push(folderId)
      fileSystem[currentPath].modified = new Date().toISOString()
    }

    saveToStorage(fileSystem, currentPath)
  }

  // Delete items
  const deleteItems = (itemIds) => {
    const fileSystem = getFileSystem()

    const deleteRecursive = (itemId) => {
      const item = fileSystem[itemId]
      if (!item) return

      // If folder, delete all children
      if (item.type === 'folder' && item.children) {
        item.children.forEach(childId => deleteRecursive(childId))
      }

      // Remove from parent's children
      if (item.parent && fileSystem[item.parent]) {
        fileSystem[item.parent].children = fileSystem[item.parent].children.filter(
          id => id !== itemId
        )
        fileSystem[item.parent].modified = new Date().toISOString()
      }

      // Delete the item
      delete fileSystem[itemId]
    }

    itemIds.forEach(itemId => deleteRecursive(itemId))
    saveToStorage(fileSystem, currentPath)
  }

  // Rename item
  const renameItem = (itemId, newName) => {
    const fileSystem = getFileSystem()
    const item = fileSystem[itemId]

    if (item) {
      // Check if item with same name exists in same folder
      const parent = fileSystem[item.parent]
      if (parent) {
        const siblings = parent.children.map(id => fileSystem[id]).filter(Boolean)
        const existingItem = siblings.find(s => s.name === newName && s.id !== itemId)
        if (existingItem) {
          alert('An item with this name already exists')
          return
        }
      }

      item.name = newName
      item.modified = new Date().toISOString()

      if (item.parent && fileSystem[item.parent]) {
        fileSystem[item.parent].modified = new Date().toISOString()
      }

      saveToStorage(fileSystem, currentPath)
    }
  }

  // Navigate to folder
  const navigateToFolder = (folderId) => {
    const fileSystem = getFileSystem()
    const folder = fileSystem[folderId]

    if (folder && folder.type === 'folder') {
      saveToStorage(fileSystem, folderId)
    }
  }

  // Navigate to specific path (for breadcrumbs)
  const navigateToPath = (pathId) => {
    navigateToFolder(pathId)
  }

  // Download file
  const downloadFile = (file) => {
    if (!file.data) {
      alert('File data not available')
      return
    }

    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    files,
    currentPath,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem,
    navigateToFolder,
    navigateToPath,
    downloadFile
  }
}
