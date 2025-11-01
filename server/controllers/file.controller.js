const supabase = require('../config/database')
const fs = require('fs').promises
const path = require('path')

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

    // Validate folder if provided
    if (folderId) {
      const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
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
        folder_id: folderId || null
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

    const { data: files, error } = await supabase
      .from('files')
      .select(`
        *,
        folders:folder_id (id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

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

    return res.json({
      status: 'success',
      action: 'get_files',
      data: { files: formattedFiles },
      message: 'Files retrieved successfully'
    })
  } catch (error) {
    console.error('Get files error:', error)
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

    // Delete file from database
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
      message: 'File deleted successfully'
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

module.exports = {
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  deleteFile,
  renameFile
}
