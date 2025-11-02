const supabase = require('../config/database')
const fs = require('fs').promises
const path = require('path')

// Helper function to determine file category
const getFileCategory = (mimetype, filename) => {
  // Images
  if (mimetype.startsWith('image/')) {
    return 'Pictures'
  }
  
  // Videos
  if (mimetype.startsWith('video/')) {
    return 'Videos'
  }
  
  // Documents (PDF, Word, Excel, PowerPoint, Text, etc.)
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('document') ||
    mimetype.includes('text') ||
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('powerpoint') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('presentation') ||
    mimetype.includes('opendocument')
  ) {
    return 'Documents'
  }
  
  // Default: My Files (no auto-organization)
  return null
}

// Helper function to get or create system folder
const getOrCreateSystemFolder = async (userId, folderName) => {
  // Check if folder exists (use maybeSingle to handle multiple or none)
  const { data: existingFolders } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .eq('name', folderName)
    .is('parent_id', null)

  if (existingFolders && existingFolders.length > 0) {
    // Return first existing folder if duplicates exist
    console.log('📁 Found existing system folder:', folderName)
    return existingFolders[0]
  }

  // Create folder if it doesn't exist
  const { data: newFolder, error } = await supabase
    .from('folders')
    .insert([{
      name: folderName,
      user_id: userId,
      parent_id: null
    }])
    .select()
    .single()

  if (error) {
    throw error
  }

  console.log('📁 Created system folder:', folderName)
  return newFolder
}

const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id
    const folderId = req.body.folder_id || null

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        action: 'upload_file',
        error: 'No file provided',
        code: 400
      })
    }

    // If no folder_id specified, auto-organize based on file type
    let targetFolderId = folderId
    
    if (!targetFolderId) {
      const category = getFileCategory(req.file.mimetype, req.file.originalname)
      console.log('📤 Upload:', req.file.originalname, 'MIME:', req.file.mimetype, 'Category:', category || 'none')
      
      if (category) {
        const systemFolder = await getOrCreateSystemFolder(userId, category)
        targetFolderId = systemFolder.id
        console.log('📂 Auto-routing to:', category, '(folder ID:', systemFolder.id.substring(0, 8) + '...)')
      }
    }

    // Validate folder if provided or auto-determined
    if (targetFolderId) {
      const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', targetFolderId)
        .eq('user_id', userId)
        .single()

      if (!folder) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(console.error)
        return res.status(404).json({
          status: 'error',
          action: 'upload_file',
          error: 'Folder not found',
          code: 404
        })
      }
    }

    const { data: file, error } = await supabase
      .from('files')
      .insert([{
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        user_id: userId,
        folder_id: targetFolderId || null
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return res.status(201).json({
      status: 'success',
      action: 'upload_file',
      data: {
        file_id: file.id,
        folder_id: file.folder_id,
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        type: file.type
      },
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload file error:', error)
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error)
    }
    return res.status(500).json({
      status: 'error',
      action: 'upload_file',
      error: error.message,
      code: 500
    })
  }
}

const getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('📥 getAllFiles called for user:', userId)

    const { data: files, error } = await supabase
      .from('files')
      .select(`
        *,
        folders:folder_id (id, name)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null) // Exclude deleted files from regular listing
      .order('created_at', { ascending: false })

    console.log('📊 Files query result:', { 
      count: files?.length || 0, 
      error: error?.message || null,
      files: files?.slice(0, 2).map(f => ({ name: f.name, type: f.type }))
    })

    if (error) {
      throw error
    }

    // Format files for frontend
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      folder_id: file.folder_id || null,
      folder_name: file.folders?.name || null,
      path: file.path,
      created_at: file.created_at,
      updated_at: file.updated_at
    }))

    console.log('✅ Returning', formattedFiles.length, 'files to frontend')

    return res.json({
      status: 'success',
      action: 'get_files',
      data: { files: formattedFiles },
      message: 'Files retrieved successfully'
    })
  } catch (error) {
    console.error('❌ Get files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_files',
      error: error.message,
      code: 500
    })
  }
}

const getFile = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: file, error } = await supabase
      .from('files')
      .select(`
        *,
        folders:folder_id (id, name)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_file',
        error: 'File not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'get_file',
      data: { file },
      message: 'File retrieved successfully'
    })
  } catch (error) {
    console.error('Get file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_file',
      error: error.message,
      code: 500
    })
  }
}

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'download_file',
        error: 'File not found',
        code: 404
      })
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path)
    } catch {
      return res.status(404).json({
        status: 'error',
        action: 'download_file',
        error: 'File not found on disk',
        code: 404
      })
    }

    res.download(file.path, file.name, (err) => {
      if (err) {
        console.error('Download error:', err)
        return res.status(500).json({
          status: 'error',
          action: 'download_file',
          error: 'Error downloading file',
          code: 500
        })
      }
    })
  } catch (error) {
    console.error('Download file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'download_file',
      error: error.message,
      code: 500
    })
  }
}

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params
    const { permanent } = req.query // If permanent=true, delete permanently
    const userId = req.user.id

    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'delete_file',
        error: 'File not found',
        code: 404
      })
    }

    // If permanent deletion (from recycle bin) or if deleted_at already exists
    if (permanent === 'true' || file.deleted_at) {
      // Permanently delete file from database
      await supabase
        .from('files')
        .delete()
        .eq('id', id)

      // Delete file from disk
      try {
        await fs.unlink(file.path)
      } catch (fsError) {
        console.error('File deletion error (disk):', fsError)
        // Continue even if file deletion fails
      }

      return res.json({
        status: 'success',
        action: 'delete_file',
        data: { file_id: id },
        message: 'File permanently deleted'
      })
    }

    // Soft delete: Move to recycle bin
    // Store original folder_id before deletion
    const originalFolderId = file.folder_id
    const deletedAt = new Date().toISOString()

    // Update file with deleted_at timestamp and clear folder_id
    const { error: updateError } = await supabase
      .from('files')
      .update({ 
        deleted_at: deletedAt,
        original_folder_id: originalFolderId,
        folder_id: null 
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    return res.json({
      status: 'success',
      action: 'delete_file',
      data: { file_id: id },
      message: 'File moved to recycle bin'
    })
  } catch (error) {
    console.error('Delete file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'delete_file',
      error: error.message,
      code: 500
    })
  }
}

const renameFile = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({
        status: 'error',
        action: 'rename_file',
        error: 'File name is required',
        code: 400
      })
    }

    const { data: file } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null) // Cannot rename deleted files
      .single()

    if (!file) {
      return res.status(404).json({
        status: 'error',
        action: 'rename_file',
        error: 'File not found',
        code: 404
      })
    }

    // Check if file with same name exists in same folder
    const { data: existingFile } = await supabase
      .from('files')
      .select('*')
      .eq('name', name)
      .eq('user_id', userId)
      .eq('folder_id', file.folder_id)
      .is('deleted_at', null) // Only check non-deleted files
      .neq('id', id)
      .single()

    if (existingFile) {
      return res.status(409).json({
        status: 'error',
        action: 'rename_file',
        error: 'File with this name already exists',
        code: 409
      })
    }

    const { data: updatedFile } = await supabase
      .from('files')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return res.json({
      status: 'success',
      action: 'rename_file',
      data: { file: updatedFile },
      message: 'File renamed successfully'
    })
  } catch (error) {
    console.error('Rename file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'rename_file',
      error: error.message,
      code: 500
    })
  }
}

// Get recycle bin items
const getRecycleBinItems = async (req, res) => {
  try {
    const userId = req.user.id

    const { data: deletedFiles, error: filesError } = await supabase
      .from('files')
      .select(`
        *,
        folders:original_folder_id (id, name)
      `)
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    const { data: deletedFolders, error: foldersError } = await supabase
      .from('folders')
      .select(`
        *,
        parent_folder:parent_id (id, name),
        original_parent:original_parent_id (id, name)
      `)
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (filesError || foldersError) {
      throw filesError || foldersError
    }

    // Format the response
    const items = [
      ...(deletedFiles || []).map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        deleted_at: file.deleted_at,
        original_location: file.folders?.name || 'My Files',
        item_type: 'file'
      })),
      ...(deletedFolders || []).map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder',
        size: 0,
        deleted_at: folder.deleted_at,
        original_location: folder.original_parent?.name || 'My Files',
        item_type: 'folder'
      }))
    ].sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))

    return res.json({
      status: 'success',
      action: 'get_recycle_bin',
      data: { items },
      message: 'Recycle bin items retrieved successfully'
    })
  } catch (error) {
    console.error('Get recycle bin error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_recycle_bin',
      error: error.message,
      code: 500
    })
  }
}

// Restore item from recycle bin
const restoreItem = async (req, res) => {
  try {
    const { id } = req.params
    const { item_type } = req.query // 'file' or 'folder'
    const userId = req.user.id

    if (item_type === 'file') {
      const { data: file, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .single()

      if (error || !file) {
        return res.status(404).json({
          status: 'error',
          action: 'restore_item',
          error: 'File not found in recycle bin',
          code: 404
        })
      }

      // Restore file to original folder
      const { error: updateError } = await supabase
        .from('files')
        .update({ 
          deleted_at: null,
          folder_id: file.original_folder_id,
          original_folder_id: null
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      return res.json({
        status: 'success',
        action: 'restore_item',
        data: { item_id: id },
        message: 'File restored successfully'
      })
    } else if (item_type === 'folder') {
      const { data: folder, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .single()

      if (error || !folder) {
        return res.status(404).json({
          status: 'error',
          action: 'restore_item',
          error: 'Folder not found in recycle bin',
          code: 404
        })
      }

      // Recursively restore folder and its contents
      const restoreRecursive = async (folderId, originalParentId) => {
        // Restore files in this folder
        await supabase
          .from('files')
          .update({ 
            deleted_at: null,
            folder_id: folderId,
            original_folder_id: null
          })
          .eq('original_folder_id', folderId)
          .not('deleted_at', 'is', null)

        // Restore subfolders
        const { data: subfolders } = await supabase
          .from('folders')
          .select('*')
          .eq('original_parent_id', folderId)
          .not('deleted_at', 'is', null)

        for (const subfolder of subfolders || []) {
          await restoreRecursive(subfolder.id, subfolder.original_parent_id)
        }

        // Restore this folder
        await supabase
          .from('folders')
          .update({ 
            deleted_at: null,
            parent_id: originalParentId,
            original_parent_id: null
          })
          .eq('id', folderId)
      }

      await restoreRecursive(id, folder.original_parent_id)

      return res.json({
        status: 'success',
        action: 'restore_item',
        data: { item_id: id },
        message: 'Folder restored successfully'
      })
    } else {
      return res.status(400).json({
        status: 'error',
        action: 'restore_item',
        error: 'Invalid item_type. Must be "file" or "folder"',
        code: 400
      })
    }
  } catch (error) {
    console.error('Restore item error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'restore_item',
      error: error.message,
      code: 500
    })
  }
}

module.exports = {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  deleteFile,
  renameFile,
  getRecycleBinItems,
  restoreItem
}