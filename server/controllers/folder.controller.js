const supabase = require('../config/database')

const createFolder = async (req, res) => {
  try {
    const { name, parent_id } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({
        status: 'error',
        action: 'create_folder',
        error: 'Folder name is required',
        code: 400
      })
    }

    // Validate parent folder exists and belongs to user (if provided)
    if (parent_id) {
      const { data: parentFolder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', parent_id)
        .eq('user_id', userId)
        .single()

      if (!parentFolder) {
        return res.status(404).json({
          status: 'error',
          action: 'create_folder',
          error: 'Parent folder not found',
          code: 404
        })
      }
    }

    // Check if folder with same name exists in same location
    const query = supabase
      .from('folders')
      .select('*')
      .eq('name', name)
      .eq('user_id', userId)
    
    if (parent_id === null || parent_id === undefined) {
      query.is('parent_id', null)
    } else {
      query.eq('parent_id', parent_id)
    }
    
    const { data: existingFolder } = await query.single()

    if (existingFolder) {
      return res.status(409).json({
        status: 'error',
        action: 'create_folder',
        error: 'Folder with this name already exists',
        code: 409
      })
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert([{
        name,
        user_id: userId,
        parent_id: parent_id || null
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return res.status(201).json({
      status: 'success',
      action: 'create_folder',
      data: { folder },
      message: 'Folder created successfully'
    })
  } catch (error) {
    console.error('Create folder error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'create_folder',
      error: error.message,
      code: 500
    })
  }
}

const getAllFolders = async (req, res) => {
  try {
    const userId = req.user.id

    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return res.json({
      status: 'success',
      action: 'get_folders',
      data: { folders },
      message: 'Folders retrieved successfully'
    })
  } catch (error) {
    console.error('Get folders error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_folders',
      error: error.message,
      code: 500
    })
  }
}

const getFolderHierarchy = async (req, res) => {
  try {
    const userId = req.user.id

    const buildHierarchy = async (parentId = null) => {
      const query = supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
      
      if (parentId === null || parentId === undefined) {
        query.is('parent_id', null)
      } else {
        query.eq('parent_id', parentId)
      }
      
      const { data: folders } = await query.order('name', { ascending: true })

      const foldersWithFiles = await Promise.all(
        folders.map(async (folder) => {
          const { data: files } = await supabase
            .from('files')
            .select('*')
            .eq('folder_id', folder.id)
            .eq('user_id', userId)

          const children = await buildHierarchy(folder.id)
          return {
            ...folder,
            files: files || [],
            children
          }
        })
      )

      return foldersWithFiles
    }

    const hierarchy = await buildHierarchy()

    return res.json({
      status: 'success',
      action: 'get_folder_hierarchy',
      data: { hierarchy },
      message: 'Folder hierarchy retrieved successfully'
    })
  } catch (error) {
    console.error('Get folder hierarchy error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_folder_hierarchy',
      error: error.message,
      code: 500
    })
  }
}

const getFolderFiles = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: folder } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!folder) {
      return res.status(404).json({
        status: 'error',
        action: 'get_folder_files',
        error: 'Folder not found',
        code: 404
      })
    }

    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return res.json({
      status: 'success',
      action: 'get_folder_files',
      data: { files, folder },
      message: 'Files retrieved successfully'
    })
  } catch (error) {
    console.error('Get folder files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_folder_files',
      error: error.message,
      code: 500
    })
  }
}

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { data: folder } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!folder) {
      return res.status(404).json({
        status: 'error',
        action: 'delete_folder',
        error: 'Folder not found',
        code: 404
      })
    }

    // Recursively delete all subfolders and files
    const deleteRecursive = async (folderId) => {
      const { data: subfolders } = await supabase
        .from('folders')
        .select('id')
        .eq('parent_id', folderId)

      for (const subfolder of subfolders || []) {
        await deleteRecursive(subfolder.id)
      }

      await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)

      await supabase
        .from('files')
        .delete()
        .eq('folder_id', folderId)
    }

    await deleteRecursive(id)

    return res.json({
      status: 'success',
      action: 'delete_folder',
      data: { folder_id: id },
      message: 'Folder deleted successfully (recursive)'
    })
  } catch (error) {
    console.error('Delete folder error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'delete_folder',
      error: error.message,
      code: 500
    })
  }
}

const renameFolder = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({
        status: 'error',
        action: 'rename_folder',
        error: 'Folder name is required',
        code: 400
      })
    }

    const { data: folder } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!folder) {
      return res.status(404).json({
        status: 'error',
        action: 'rename_folder',
        error: 'Folder not found',
        code: 404
      })
    }

    // Check if folder with same name exists in same location
    const { data: existingFolder } = await supabase
      .from('folders')
      .select('*')
      .eq('name', name)
      .eq('user_id', userId)
      .eq('parent_id', folder.parent_id)
      .neq('id', id)
      .single()

    if (existingFolder) {
      return res.status(409).json({
        status: 'error',
        action: 'rename_folder',
        error: 'Folder with this name already exists',
        code: 409
      })
    }

    const { data: updatedFolder } = await supabase
      .from('folders')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return res.json({
      status: 'success',
      action: 'rename_folder',
      data: { folder: updatedFolder },
      message: 'Folder renamed successfully'
    })
  } catch (error) {
    console.error('Rename folder error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'rename_folder',
      error: error.message,
      code: 500
    })
  }
}

module.exports = {
  createFolder,
  getAllFolders,
  getFolderHierarchy,
  getFolderFiles,
  deleteFolder,
  renameFolder
}
