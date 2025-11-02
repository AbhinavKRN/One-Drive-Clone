const supabase = require("../config/database");
const fs = require("fs").promises;
const path = require("path");

// Helper function to determine file category
const getFileCategory = (mimetype, filename) => {
  // Images
  if (mimetype.startsWith("image/")) {
    return "Pictures";
  }

  // Videos
  if (mimetype.startsWith("video/")) {
    return "Videos";
  }

  // Documents (PDF, Word, Excel, PowerPoint, Text, etc.)
  if (
    mimetype.includes("pdf") ||
    mimetype.includes("document") ||
    mimetype.includes("text") ||
    mimetype.includes("word") ||
    mimetype.includes("excel") ||
    mimetype.includes("powerpoint") ||
    mimetype.includes("spreadsheet") ||
    mimetype.includes("presentation") ||
    mimetype.includes("opendocument")
  ) {
    return "Documents";
  }

  // Default: My Files (no auto-organization)
  return null;
};

// Helper function to get or create system folder
const getOrCreateSystemFolder = async (userId, folderName) => {
  // Check if folder exists (use maybeSingle to handle multiple or none)
  const { data: existingFolders } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .eq("name", folderName)
    .is("parent_id", null);

  if (existingFolders && existingFolders.length > 0) {
    // Return first existing folder if duplicates exist
    console.log("📁 Found existing system folder:", folderName);
    return existingFolders[0];
  }

  // Create folder if it doesn't exist
  const { data: newFolder, error } = await supabase
    .from("folders")
    .insert([
      {
        name: folderName,
        user_id: userId,
        parent_id: null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  console.log("📁 Created system folder:", folderName);
  return newFolder;
};

const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.body.folder_id || null;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        action: "upload_file",
        error: "No file provided",
        code: 400,
      });
    }

    // Use folder_id if provided, otherwise upload to root (no auto-organization)
    let targetFolderId = folderId || null;

    // Validate folder if provided
    if (targetFolderId) {
      const { data: folder } = await supabase
        .from("folders")
        .select("*")
        .eq("id", targetFolderId)
        .eq("user_id", userId)
        .single();

      if (!folder) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(console.error);
        return res.status(404).json({
          status: "error",
          action: "upload_file",
          error: "Folder not found",
          code: 404,
        });
      }
    }

    const { data: file, error } = await supabase
      .from("files")
      .insert([
        {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          user_id: userId,
          folder_id: targetFolderId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      status: "success",
      action: "upload_file",
      data: {
        file_id: file.id,
        folder_id: file.folder_id,
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        type: file.type,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload file error:", error);
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    return res.status(500).json({
      status: "error",
      action: "upload_file",
      error: error.message,
      code: 500,
    });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📥 getAllFiles called for user:", userId);

    const { data: files, error } = await supabase
      .from("files")
      .select(
        `
        *,
        folders:folder_id (id, name)
      `
      )
      .eq("user_id", userId)
      .is("deleted_at", null) // Exclude deleted files from regular listing
      .order("created_at", { ascending: false });

    console.log("📊 Files query result:", {
      count: files?.length || 0,
      error: error?.message || null,
      files: files?.slice(0, 2).map((f) => ({ name: f.name, type: f.type })),
    });

    if (error) {
      throw error;
    }

    // Format files for frontend
    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      folder_id: file.folder_id || null,
      folder_name: file.folders?.name || null,
      path: file.path,
      created_at: file.created_at,
      updated_at: file.updated_at,
    }));

    console.log("✅ Returning", formattedFiles.length, "files to frontend");

    return res.json({
      status: "success",
      action: "get_files",
      data: { files: formattedFiles },
      message: "Files retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get files error:", error);
    return res.status(500).json({
      status: "error",
      action: "get_files",
      error: error.message,
      code: 500,
    });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: file, error } = await supabase
      .from("files")
      .select(
        `
        *,
        folders:folder_id (id, name)
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      return res.status(404).json({
        status: "error",
        action: "get_file",
        error: "File not found",
        code: 404,
      });
    }

    return res.json({
      status: "success",
      action: "get_file",
      data: { file },
      message: "File retrieved successfully",
    });
  } catch (error) {
    console.error("Get file error:", error);
    return res.status(500).json({
      status: "error",
      action: "get_file",
      error: error.message,
      code: 500,
    });
  }
};

// Preview file (for inline display)
const previewFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      return res.status(404).json({
        status: "error",
        action: "preview_file",
        error: "File not found",
        code: 404,
      });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({
        status: "error",
        action: "preview_file",
        error: "File not found on disk",
        code: 404,
      });
    }

    // Get file stats
    const stats = await fs.stat(file.path);
    const fileSize = stats.size;

    // Set headers for inline preview
    res.setHeader("Content-Type", file.type || "application/octet-stream");
    res.setHeader("Content-Length", fileSize);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.name)}"`
    );
    res.setHeader("Cache-Control", "private, max-age=3600");

    // Stream the file
    const fileStream = require("fs").createReadStream(file.path);
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("Preview stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          action: "preview_file",
          error: "Error reading file",
          code: 500,
        });
      }
    });
  } catch (error) {
    console.error("Preview file error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        action: "preview_file",
        error: error.message,
        code: 500,
      });
    }
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      return res.status(404).json({
        status: "error",
        action: "download_file",
        error: "File not found",
        code: 404,
      });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({
        status: "error",
        action: "download_file",
        error: "File not found on disk",
        code: 404,
      });
    }

    res.download(file.path, file.name, (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).json({
          status: "error",
          action: "download_file",
          error: "Error downloading file",
          code: 500,
        });
      }
    });
  } catch (error) {
    console.error("Download file error:", error);
    return res.status(500).json({
      status: "error",
      action: "download_file",
      error: error.message,
      code: 500,
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query; // If permanent=true, delete permanently
    const userId = req.user.id;

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !file) {
      return res.status(404).json({
        status: "error",
        action: "delete_file",
        error: "File not found",
        code: 404,
      });
    }

    // If permanent deletion (from recycle bin) or if deleted_at already exists
    if (permanent === "true" || file.deleted_at) {
      // Permanently delete file from database
      await supabase.from("files").delete().eq("id", id);

      // Delete file from disk
      try {
        await fs.unlink(file.path);
      } catch (fsError) {
        console.error("File deletion error (disk):", fsError);
        // Continue even if file deletion fails
      }

      return res.json({
        status: "success",
        action: "delete_file",
        data: { file_id: id },
        message: "File permanently deleted",
      });
    }

    // Soft delete: Move to recycle bin
    // Store original folder_id before deletion
    const originalFolderId = file.folder_id;
    const deletedAt = new Date().toISOString();

    // Update file with deleted_at timestamp and clear folder_id
    const { error: updateError } = await supabase
      .from("files")
      .update({
        deleted_at: deletedAt,
        original_folder_id: originalFolderId,
        folder_id: null,
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return res.json({
      status: "success",
      action: "delete_file",
      data: { file_id: id },
      message: "File moved to recycle bin",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({
      status: "error",
      action: "delete_file",
      error: error.message,
      code: 500,
    });
  }
};

const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        status: "error",
        action: "rename_file",
        error: "File name is required",
        code: 400,
      });
    }

    const { data: file } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null) // Cannot rename deleted files
      .single();

    if (!file) {
      return res.status(404).json({
        status: "error",
        action: "rename_file",
        error: "File not found",
        code: 404,
      });
    }

    // Check if file with same name exists in same folder
    const { data: existingFile } = await supabase
      .from("files")
      .select("*")
      .eq("name", name)
      .eq("user_id", userId)
      .eq("folder_id", file.folder_id)
      .is("deleted_at", null) // Only check non-deleted files
      .neq("id", id)
      .single();

    if (existingFile) {
      return res.status(409).json({
        status: "error",
        action: "rename_file",
        error: "File with this name already exists",
        code: 409,
      });
    }

    const { data: updatedFile } = await supabase
      .from("files")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    return res.json({
      status: "success",
      action: "rename_file",
      data: { file: updatedFile },
      message: "File renamed successfully",
    });
  } catch (error) {
    console.error("Rename file error:", error);
    return res.status(500).json({
      status: "error",
      action: "rename_file",
      error: error.message,
      code: 500,
    });
  }
};

const moveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder_id } = req.body;
    const userId = req.user.id;

    const { data: file } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (!file) {
      return res.status(404).json({
        status: "error",
        action: "move_file",
        error: "File not found",
        code: 404,
      });
    }

    // If folder_id is provided, validate it exists and belongs to user
    if (folder_id !== null && folder_id !== undefined) {
      const { data: folder } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folder_id)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

      if (!folder) {
        return res.status(404).json({
          status: "error",
          action: "move_file",
          error: "Folder not found",
          code: 404,
        });
      }
    }

    // Check if file with same name exists in target folder
    const { data: existingFile } = await supabase
      .from("files")
      .select("*")
      .eq("name", file.name)
      .eq("user_id", userId)
      .eq("folder_id", folder_id || null)
      .is("deleted_at", null)
      .neq("id", id)
      .single();

    if (existingFile) {
      return res.status(409).json({
        status: "error",
        action: "move_file",
        error: "File with this name already exists in the target folder",
        code: 409,
      });
    }

    const { data: updatedFile } = await supabase
      .from("files")
      .update({
        folder_id: folder_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    return res.json({
      status: "success",
      action: "move_file",
      data: { file: updatedFile },
      message: "File moved successfully",
    });
  } catch (error) {
    console.error("Move file error:", error);
    return res.status(500).json({
      status: "error",
      action: "move_file",
      error: error.message,
      code: 500,
    });
  }
};

// Get recycle bin items
const getRecycleBinItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: deletedFiles, error: filesError } = await supabase
      .from("files")
      .select(
        `
        *,
        folders:original_folder_id (id, name)
      `
      )
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    const { data: deletedFolders, error: foldersError } = await supabase
      .from("folders")
      .select(
        `
        *,
        parent_folder:parent_id (id, name),
        original_parent:original_parent_id (id, name)
      `
      )
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (filesError || foldersError) {
      throw filesError || foldersError;
    }

    // Format the response
    const items = [
      ...(deletedFiles || []).map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        deleted_at: file.deleted_at,
        original_location: file.folders?.name || "My Files",
        item_type: "file",
      })),
      ...(deletedFolders || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder",
        size: 0,
        deleted_at: folder.deleted_at,
        original_location: folder.original_parent?.name || "My Files",
        item_type: "folder",
      })),
    ].sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));

    return res.json({
      status: "success",
      action: "get_recycle_bin",
      data: { items },
      message: "Recycle bin items retrieved successfully",
    });
  } catch (error) {
    console.error("Get recycle bin error:", error);
    return res.status(500).json({
      status: "error",
      action: "get_recycle_bin",
      error: error.message,
      code: 500,
    });
  }
};

// Restore item from recycle bin
const restoreItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_type } = req.query; // 'file' or 'folder'
    const userId = req.user.id;

    if (item_type === "file") {
      const { data: file, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .not("deleted_at", "is", null)
        .single();

      if (error || !file) {
        return res.status(404).json({
          status: "error",
          action: "restore_item",
          error: "File not found in recycle bin",
          code: 404,
        });
      }

      // Restore file to original folder
      const { error: updateError } = await supabase
        .from("files")
        .update({
          deleted_at: null,
          folder_id: file.original_folder_id,
          original_folder_id: null,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      return res.json({
        status: "success",
        action: "restore_item",
        data: { item_id: id },
        message: "File restored successfully",
      });
    } else if (item_type === "folder") {
      const { data: folder, error } = await supabase
        .from("folders")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .not("deleted_at", "is", null)
        .single();

      if (error || !folder) {
        return res.status(404).json({
          status: "error",
          action: "restore_item",
          error: "Folder not found in recycle bin",
          code: 404,
        });
      }

      // Recursively restore folder and its contents
      const restoreRecursive = async (folderId, originalParentId) => {
        // Restore files in this folder
        await supabase
          .from("files")
          .update({
            deleted_at: null,
            folder_id: folderId,
            original_folder_id: null,
          })
          .eq("original_folder_id", folderId)
          .not("deleted_at", "is", null);

        // Restore subfolders
        const { data: subfolders } = await supabase
          .from("folders")
          .select("*")
          .eq("original_parent_id", folderId)
          .not("deleted_at", "is", null);

        for (const subfolder of subfolders || []) {
          await restoreRecursive(subfolder.id, subfolder.original_parent_id);
        }

        // Restore this folder
        await supabase
          .from("folders")
          .update({
            deleted_at: null,
            parent_id: originalParentId,
            original_parent_id: null,
          })
          .eq("id", folderId);
      };

      await restoreRecursive(id, folder.original_parent_id);

      return res.json({
        status: "success",
        action: "restore_item",
        data: { item_id: id },
        message: "Folder restored successfully",
      });
    } else {
      return res.status(400).json({
        status: "error",
        action: "restore_item",
        error: 'Invalid item_type. Must be "file" or "folder"',
        code: 400,
      });
    }
  } catch (error) {
    console.error("Restore item error:", error);
    return res.status(500).json({
      status: "error",
      action: "restore_item",
      error: error.message,
      code: 500,
    });
  }
};

// Create empty file with specific category
const createEmptyFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, folder_id } = req.body;

    if (!category) {
      return res.status(400).json({
        status: "error",
        action: "create_file",
        error: "Category is required",
        code: 400,
      });
    }

    // Map category to file extension and MIME type
    const categoryMap = {
      word: {
        extension: ".docx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        defaultName: "Document.docx",
      },
      excel: {
        extension: ".xlsx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        defaultName: "Workbook.xlsx",
      },
      powerpoint: {
        extension: ".pptx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        defaultName: "Presentation.pptx",
      },
      onenote: {
        extension: ".one",
        mimetype: "application/msonenote",
        defaultName: "Notebook.one",
      },
      text: {
        extension: ".txt",
        mimetype: "text/plain",
        defaultName: "Text Document.txt",
      },
    };

    const fileConfig = categoryMap[category.toLowerCase()];
    if (!fileConfig) {
      return res.status(400).json({
        status: "error",
        action: "create_file",
        error:
          "Invalid category. Must be: word, excel, powerpoint, onenote, or text",
        code: 400,
      });
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${fileConfig.defaultName}`;
    const filePath = path.join(__dirname, "../uploads", filename);

    // Create empty file
    await fs.writeFile(filePath, "", "utf8");

    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Validate folder if provided
    let targetFolderId = folder_id || null;
    if (targetFolderId) {
      const { data: folder } = await supabase
        .from("folders")
        .select("*")
        .eq("id", targetFolderId)
        .eq("user_id", userId)
        .single();

      if (!folder) {
        // Clean up created file
        await fs.unlink(filePath).catch(console.error);
        return res.status(404).json({
          status: "error",
          action: "create_file",
          error: "Folder not found",
          code: 404,
        });
      }
    }
    // If no folder_id provided, file goes to root (no auto-organization)

    // Insert file into database
    const { data: file, error } = await supabase
      .from("files")
      .insert([
        {
          name: fileConfig.defaultName,
          type: fileConfig.mimetype,
          size: fileSize,
          path: filePath,
          user_id: userId,
          folder_id: targetFolderId,
        },
      ])
      .select()
      .single();

    if (error) {
      // Clean up created file
      await fs.unlink(filePath).catch(console.error);
      throw error;
    }

    return res.status(201).json({
      status: "success",
      action: "create_file",
      data: {
        file_id: file.id,
        folder_id: file.folder_id,
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        type: file.type,
      },
      message: "File created successfully",
    });
  } catch (error) {
    console.error("Create file error:", error);
    return res.status(500).json({
      status: "error",
      action: "create_file",
      error: error.message,
      code: 500,
    });
  }
}

// Share a file with a user by email
const shareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { email, permission = 'view', allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('📧 Share file request:', { fileId: id, email, userId })

    if (!email) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Email is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'File not found',
        code: 404
      })
    }

    // Find user by email
    const { data: sharedWithUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !sharedWithUser) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'User with this email not found',
        code: 404
      })
    }

    // Don't allow sharing with yourself
    if (sharedWithUser.id === userId) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Cannot share file with yourself',
        code: 400
      })
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_with', sharedWithUser.id)
      .single()

    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        action: 'share_file',
        error: 'File is already shared with this user',
        code: 409
      })
    }

    // Create share
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .insert([{
        file_id: id,
        shared_by: userId,
        shared_with: sharedWithUser.id,
        permission: permission,
        share_type: 'user',
        link_enabled: false,
        allow_download: allow_download
      }])
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    return res.json({
      status: 'success',
      action: 'share_file',
      data: {
        share_id: share.id,
        file_id: id,
        shared_with: {
          id: sharedWithUser.id,
          name: sharedWithUser.name,
          email: sharedWithUser.email
        },
        permission: permission
      },
      message: 'File shared successfully'
    })
  } catch (error) {
    console.error('Share file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'share_file',
      error: error.message,
      code: 500
    })
  }
}

// Get users a file is shared with
const getFileShares = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_file_shares',
        error: 'File not found',
        code: 404
      })
    }

    // Get shares with user details
    const { data: shares, error: sharesError } = await supabase
      .from('file_shares')
      .select(`
        *,
        shared_with_user:shared_with (id, name, email)
      `)
      .eq('file_id', id)

    if (sharesError) {
      throw sharesError
    }

    const formattedShares = (shares || []).map(share => ({
      id: share.id,
      shared_with: share.shared_with_user,
      permission: share.permission,
      share_type: share.share_type || 'user',
      link_enabled: share.link_enabled || false,
      allow_download: share.allow_download !== false,
      expires_at: share.expires_at,
      created_at: share.created_at
    }))

    return res.json({
      status: 'success',
      action: 'get_file_shares',
      data: { shares: formattedShares },
      message: 'File shares retrieved successfully'
    })
  } catch (error) {
    console.error('Get file shares error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_file_shares',
      error: error.message,
      code: 500
    })
  }
}

// Remove a share
const unshareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { share_id } = req.body
    const userId = req.user.id

    if (!share_id) {
      return res.status(400).json({
        status: 'error',
        action: 'unshare_file',
        error: 'share_id is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'File not found',
        code: 404
      })
    }

    // Verify share exists and belongs to this file
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('id', share_id)
      .eq('file_id', id)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'Share not found',
        code: 404
      })
    }

    // Delete share
    const { error: deleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', share_id)

    if (deleteError) {
      throw deleteError
    }

    return res.json({
      status: 'success',
      action: 'unshare_file',
      data: { share_id: share_id },
      message: 'File share removed successfully'
    })
  } catch (error) {
    console.error('Unshare file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'unshare_file',
      error: error.message,
      code: 500
    })
  }
}

// Get shared files (files shared with me and files I shared)
const getSharedFiles = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if file_shares table exists - if not, return empty arrays
    // This allows the app to work even if migration hasn't been run
    let sharedWithMe = []
    let sharedByMe = []
    let sharedWithMeError = null
    let sharedByMeError = null

    try {
      // Get files shared WITH me - use simpler query first
      const result1 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_with', userId)

      sharedWithMe = result1.data || []
      sharedWithMeError = result1.error

      // Get files shared BY me
      const result2 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_by', userId)

      sharedByMe = result2.data || []
      sharedByMeError = result2.error

      // If table doesn't exist, return empty arrays
      if (sharedWithMeError && (sharedWithMeError.code === 'PGRST116' || sharedWithMeError.message?.includes('does not exist'))) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }

      // Fetch file details for sharedWithMe
      if (sharedWithMe.length > 0) {
        const fileIds = sharedWithMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_by
          const userIds = [...new Set(sharedWithMe.map(s => s.shared_by))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedWithMe = sharedWithMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_by_user: userMap[share.shared_by] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // Fetch file details for sharedByMe
      if (sharedByMe.length > 0) {
        const fileIds = sharedByMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_with
          const userIds = [...new Set(sharedByMe.map(s => s.shared_with))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedByMe = sharedByMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_with_user: userMap[share.shared_with] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // If table exists but has other errors, handle them
      if (sharedWithMeError && sharedWithMeError.code !== 'PGRST116') {
        throw sharedWithMeError
      }
      if (sharedByMeError && sharedByMeError.code !== 'PGRST116') {
        throw sharedByMeError
      }
    } catch (tableError) {
      // Table doesn't exist or other error - return empty arrays
      console.error('Error fetching shared files:', tableError.message || tableError)
      if (tableError.message && tableError.message.includes('does not exist')) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }
      throw tableError
    }

    // Format files shared with me
    const filesSharedWithMe = (sharedWithMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedBy: item.shared_by_user,
          permission: item.permission,
          sharedWithMe: true,
          sharedByMe: false
        }
      })

    // Format files shared by me
    const filesSharedByMe = (sharedByMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedWith: item.shared_with_user,
          permission: item.permission,
          sharedWithMe: false,
          sharedByMe: true
        }
      })

    return res.json({
      status: 'success',
      action: 'get_shared_files',
      data: {
        sharedWithMe: filesSharedWithMe,
        sharedByMe: filesSharedByMe
      },
      message: 'Shared files retrieved successfully'
    })
  } catch (error) {
    console.error('Get shared files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_shared_files',
      error: error.message,
      code: 500
    })
  }
}

// Generate or get share link for a file
const createShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const { permission = 'view', expires_at = null, allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('🔗 Creating share link for file:', id, 'by user:', userId)

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'create_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Check if link already exists for this file
    // Use maybeSingle() to handle case where link doesn't exist
    const { data: existingLink, error: existingLinkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    let shareToken
    let shareId

    // Handle case where columns might not exist yet (migration not run)
    if (existingLinkError && existingLinkError.code !== 'PGRST116') {
      // Check if error is about missing columns
      if (existingLinkError.message && existingLinkError.message.includes('column')) {
        console.error('⚠️ Link sharing columns not found. Run migration: file_shares_link_migration.sql')
        return res.status(400).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Link sharing not enabled. Please run the database migration: file_shares_link_migration.sql',
          code: 400
        })
      }
      throw existingLinkError
    }

    if (existingLink) {
      // Update existing link
      shareToken = existingLink.share_token
      shareId = existingLink.id
      
      const { error: updateError } = await supabase
        .from('file_shares')
        .update({
          permission: permission,
          expires_at: expires_at,
          allow_download: allow_download,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (updateError) {
        // Check if it's a column error
        if (updateError.message && updateError.message.includes('column')) {
          return res.status(400).json({
            status: 'error',
            action: 'create_share_link',
            error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
            code: 400
          })
        }
        throw updateError
      }
    } else {
      // Generate new share token with retry logic for uniqueness
      const crypto = require('crypto')
      let shareCreated = false
      let maxRetries = 5
      let retryCount = 0

      while (!shareCreated && retryCount < maxRetries) {
        shareToken = crypto.randomBytes(32).toString('hex')

        // Create new link share
        const { data: share, error: shareError } = await supabase
          .from('file_shares')
          .insert([{
            file_id: id,
            shared_by: userId,
            shared_with: null, // Link shares don't have a specific user
            share_token: shareToken,
            share_type: 'link',
            link_enabled: true,
            permission: permission,
            expires_at: expires_at,
            allow_download: allow_download
          }])
          .select()
          .single()

        if (shareError) {
          // Log the full error for debugging
          console.error('Share link creation error (attempt ' + (retryCount + 1) + '):', shareError)
          
          // Check if it's a unique constraint violation on share_token (retry)
          if (shareError.code === '23505' || (shareError.message && shareError.message.includes('duplicate key value'))) {
            retryCount++
            if (retryCount >= maxRetries) {
              return res.status(500).json({
                status: 'error',
                action: 'create_share_link',
                error: 'Failed to generate unique share token. Please try again.',
                code: 500
              })
            }
            continue // Retry with new token
          }
          
          // Check if it's a column error
          if (shareError.message && shareError.message.includes('column')) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
              code: 400
            })
          }
          
          // Check if it's a NOT NULL constraint error for shared_with
          if (shareError.message && (shareError.message.includes('null value') || shareError.message.includes('NOT NULL'))) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'shared_with column must allow NULL values. Please run: file_shares_link_migration.sql',
              code: 400,
              details: shareError.message
            })
          }
          
          // Return detailed error
          return res.status(500).json({
            status: 'error',
            action: 'create_share_link',
            error: shareError.message || 'Failed to create share link',
            code: 500,
            details: shareError
          })
        }
        
        // Success!
        shareId = share.id
        shareCreated = true
        console.log('✅ Share link created successfully:', shareToken)
      }

      if (!shareCreated) {
        return res.status(500).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Failed to create share link after multiple attempts',
          code: 500
        })
      }
    }

    // Generate share URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${shareToken}`
    
    console.log('🔗 Returning share URL:', shareUrl)

    return res.json({
      status: 'success',
      action: 'create_share_link',
      data: {
        share_id: shareId,
        share_token: shareToken,
        share_url: shareUrl,
        permission: permission,
        expires_at: expires_at,
        allow_download: allow_download
      },
      message: 'Share link created successfully'
    })
  } catch (error) {
    console.error('Create share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'create_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Get share link for a file
const getShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Get existing link share
    const { data: linkShare, error: linkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    // Handle case where link doesn't exist (PGRST116 is the code for no rows)
    if (linkError && linkError.code !== 'PGRST116') {
      console.error('Get share link query error:', linkError)
      throw linkError
    }

    if (!linkShare) {
      return res.json({
        status: 'success',
        action: 'get_share_link',
        data: {
          share_url: null,
          link_enabled: false
        },
        message: 'No share link exists'
      })
    }

    // Check if link has expired
    const isExpired = linkShare.expires_at && new Date(linkShare.expires_at) < new Date()

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${linkShare.share_token}`

    return res.json({
      status: 'success',
      action: 'get_share_link',
      data: {
        share_id: linkShare.id,
        share_token: linkShare.share_token,
        share_url: shareUrl,
        permission: linkShare.permission,
        expires_at: linkShare.expires_at,
        allow_download: linkShare.allow_download,
        is_expired: isExpired,
        link_enabled: true
      },
      message: 'Share link retrieved successfully'
    })
  } catch (error) {
    console.error('Get share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Disable share link
const disableShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'disable_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Disable link share
    const { error: updateError } = await supabase
      .from('file_shares')
      .update({ link_enabled: false })
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('share_type', 'link')

    if (updateError) {
      throw updateError
    }

    return res.json({
      status: 'success',
      action: 'disable_share_link',
      data: { file_id: id },
      message: 'Share link disabled successfully'
    })
  } catch (error) {
    console.error('Disable share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'disable_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Access file via share token (public endpoint)
const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params

    // Find share by token
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        *,
        file:files!file_id (*)
      `)
      .eq('share_token', token)
      .eq('link_enabled', true)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link not found or disabled',
        code: 404
      })
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link has expired',
        code: 410
      })
    }

    // Check if file exists and is not deleted
    if (!share.file || share.file.deleted_at) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'File not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'access_shared_file',
      data: {
        file: {
          id: share.file.id,
          name: share.file.name,
          type: share.file.type,
          size: share.file.size,
          created_at: share.file.created_at
        },
        permission: share.permission,
        allow_download: share.allow_download
      },
      message: 'Shared file accessed successfully'
    })
  } catch (error) {
    console.error('Access shared file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'access_shared_file',
      error: error.message,
      code: 500
    })
  }
}

// Share a file with a user by email
const shareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { email, permission = 'view', allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('📧 Share file request:', { fileId: id, email, userId })

    if (!email) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Email is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'File not found',
        code: 404
      })
    }

    // Find user by email
    const { data: sharedWithUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !sharedWithUser) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'User with this email not found',
        code: 404
      })
    }

    // Don't allow sharing with yourself
    if (sharedWithUser.id === userId) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Cannot share file with yourself',
        code: 400
      })
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_with', sharedWithUser.id)
      .single()

    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        action: 'share_file',
        error: 'File is already shared with this user',
        code: 409
      })
    }

    // Create share
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .insert([{
        file_id: id,
        shared_by: userId,
        shared_with: sharedWithUser.id,
        permission: permission,
        share_type: 'user',
        link_enabled: false,
        allow_download: allow_download
      }])
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    return res.json({
      status: 'success',
      action: 'share_file',
      data: {
        share_id: share.id,
        file_id: id,
        shared_with: {
          id: sharedWithUser.id,
          name: sharedWithUser.name,
          email: sharedWithUser.email
        },
        permission: permission
      },
      message: 'File shared successfully'
    })
  } catch (error) {
    console.error('Share file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'share_file',
      error: error.message,
      code: 500
    })
  }
}

// Get users a file is shared with
const getFileShares = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_file_shares',
        error: 'File not found',
        code: 404
      })
    }

    // Get shares with user details
    const { data: shares, error: sharesError } = await supabase
      .from('file_shares')
      .select(`
        *,
        shared_with_user:shared_with (id, name, email)
      `)
      .eq('file_id', id)

    if (sharesError) {
      throw sharesError
    }

    const formattedShares = (shares || []).map(share => ({
      id: share.id,
      shared_with: share.shared_with_user,
      permission: share.permission,
      share_type: share.share_type || 'user',
      link_enabled: share.link_enabled || false,
      allow_download: share.allow_download !== false,
      expires_at: share.expires_at,
      created_at: share.created_at
    }))

    return res.json({
      status: 'success',
      action: 'get_file_shares',
      data: { shares: formattedShares },
      message: 'File shares retrieved successfully'
    })
  } catch (error) {
    console.error('Get file shares error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_file_shares',
      error: error.message,
      code: 500
    })
  }
}

// Remove a share
const unshareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { share_id } = req.body
    const userId = req.user.id

    if (!share_id) {
      return res.status(400).json({
        status: 'error',
        action: 'unshare_file',
        error: 'share_id is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'File not found',
        code: 404
      })
    }

    // Verify share exists and belongs to this file
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('id', share_id)
      .eq('file_id', id)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'Share not found',
        code: 404
      })
    }

    // Delete share
    const { error: deleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', share_id)

    if (deleteError) {
      throw deleteError
    }

    return res.json({
      status: 'success',
      action: 'unshare_file',
      data: { share_id: share_id },
      message: 'File share removed successfully'
    })
  } catch (error) {
    console.error('Unshare file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'unshare_file',
      error: error.message,
      code: 500
    })
  }
}

// Get shared files (files shared with me and files I shared)
const getSharedFiles = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if file_shares table exists - if not, return empty arrays
    // This allows the app to work even if migration hasn't been run
    let sharedWithMe = []
    let sharedByMe = []
    let sharedWithMeError = null
    let sharedByMeError = null

    try {
      // Get files shared WITH me - use simpler query first
      const result1 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_with', userId)

      sharedWithMe = result1.data || []
      sharedWithMeError = result1.error

      // Get files shared BY me
      const result2 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_by', userId)

      sharedByMe = result2.data || []
      sharedByMeError = result2.error

      // If table doesn't exist, return empty arrays
      if (sharedWithMeError && (sharedWithMeError.code === 'PGRST116' || sharedWithMeError.message?.includes('does not exist'))) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }

      // Fetch file details for sharedWithMe
      if (sharedWithMe.length > 0) {
        const fileIds = sharedWithMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_by
          const userIds = [...new Set(sharedWithMe.map(s => s.shared_by))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedWithMe = sharedWithMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_by_user: userMap[share.shared_by] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // Fetch file details for sharedByMe
      if (sharedByMe.length > 0) {
        const fileIds = sharedByMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_with
          const userIds = [...new Set(sharedByMe.map(s => s.shared_with))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedByMe = sharedByMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_with_user: userMap[share.shared_with] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // If table exists but has other errors, handle them
      if (sharedWithMeError && sharedWithMeError.code !== 'PGRST116') {
        throw sharedWithMeError
      }
      if (sharedByMeError && sharedByMeError.code !== 'PGRST116') {
        throw sharedByMeError
      }
    } catch (tableError) {
      // Table doesn't exist or other error - return empty arrays
      console.error('Error fetching shared files:', tableError.message || tableError)
      if (tableError.message && tableError.message.includes('does not exist')) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }
      throw tableError
    }

    // Format files shared with me
    const filesSharedWithMe = (sharedWithMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedBy: item.shared_by_user,
          permission: item.permission,
          sharedWithMe: true,
          sharedByMe: false
        }
      })

    // Format files shared by me
    const filesSharedByMe = (sharedByMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedWith: item.shared_with_user,
          permission: item.permission,
          sharedWithMe: false,
          sharedByMe: true
        }
      })

    return res.json({
      status: 'success',
      action: 'get_shared_files',
      data: {
        sharedWithMe: filesSharedWithMe,
        sharedByMe: filesSharedByMe
      },
      message: 'Shared files retrieved successfully'
    })
  } catch (error) {
    console.error('Get shared files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_shared_files',
      error: error.message,
      code: 500
    })
  }
}

// Generate or get share link for a file
const createShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const { permission = 'view', expires_at = null, allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('🔗 Creating share link for file:', id, 'by user:', userId)

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'create_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Check if link already exists for this file
    // Use maybeSingle() to handle case where link doesn't exist
    const { data: existingLink, error: existingLinkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    let shareToken
    let shareId

    // Handle case where columns might not exist yet (migration not run)
    if (existingLinkError && existingLinkError.code !== 'PGRST116') {
      // Check if error is about missing columns
      if (existingLinkError.message && existingLinkError.message.includes('column')) {
        console.error('⚠️ Link sharing columns not found. Run migration: file_shares_link_migration.sql')
        return res.status(400).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Link sharing not enabled. Please run the database migration: file_shares_link_migration.sql',
          code: 400
        })
      }
      throw existingLinkError
    }

    if (existingLink) {
      // Update existing link
      shareToken = existingLink.share_token
      shareId = existingLink.id
      
      const { error: updateError } = await supabase
        .from('file_shares')
        .update({
          permission: permission,
          expires_at: expires_at,
          allow_download: allow_download,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (updateError) {
        // Check if it's a column error
        if (updateError.message && updateError.message.includes('column')) {
          return res.status(400).json({
            status: 'error',
            action: 'create_share_link',
            error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
            code: 400
          })
        }
        throw updateError
      }
    } else {
      // Generate new share token with retry logic for uniqueness
      const crypto = require('crypto')
      let shareCreated = false
      let maxRetries = 5
      let retryCount = 0

      while (!shareCreated && retryCount < maxRetries) {
        shareToken = crypto.randomBytes(32).toString('hex')

        // Create new link share
        const { data: share, error: shareError } = await supabase
          .from('file_shares')
          .insert([{
            file_id: id,
            shared_by: userId,
            shared_with: null, // Link shares don't have a specific user
            share_token: shareToken,
            share_type: 'link',
            link_enabled: true,
            permission: permission,
            expires_at: expires_at,
            allow_download: allow_download
          }])
          .select()
          .single()

        if (shareError) {
          // Log the full error for debugging
          console.error('Share link creation error (attempt ' + (retryCount + 1) + '):', shareError)
          
          // Check if it's a unique constraint violation on share_token (retry)
          if (shareError.code === '23505' || (shareError.message && shareError.message.includes('duplicate key value'))) {
            retryCount++
            if (retryCount >= maxRetries) {
              return res.status(500).json({
                status: 'error',
                action: 'create_share_link',
                error: 'Failed to generate unique share token. Please try again.',
                code: 500
              })
            }
            continue // Retry with new token
          }
          
          // Check if it's a column error
          if (shareError.message && shareError.message.includes('column')) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
              code: 400
            })
          }
          
          // Check if it's a NOT NULL constraint error for shared_with
          if (shareError.message && (shareError.message.includes('null value') || shareError.message.includes('NOT NULL'))) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'shared_with column must allow NULL values. Please run: file_shares_link_migration.sql',
              code: 400,
              details: shareError.message
            })
          }
          
          // Return detailed error
          return res.status(500).json({
            status: 'error',
            action: 'create_share_link',
            error: shareError.message || 'Failed to create share link',
            code: 500,
            details: shareError
          })
        }
        
        // Success!
        shareId = share.id
        shareCreated = true
        console.log('✅ Share link created successfully:', shareToken)
      }

      if (!shareCreated) {
        return res.status(500).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Failed to create share link after multiple attempts',
          code: 500
        })
      }
    }

    // Generate share URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${shareToken}`
    
    console.log('🔗 Returning share URL:', shareUrl)

    return res.json({
      status: 'success',
      action: 'create_share_link',
      data: {
        share_id: shareId,
        share_token: shareToken,
        share_url: shareUrl,
        permission: permission,
        expires_at: expires_at,
        allow_download: allow_download
      },
      message: 'Share link created successfully'
    })
  } catch (error) {
    console.error('Create share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'create_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Get share link for a file
const getShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Get existing link share
    const { data: linkShare, error: linkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    // Handle case where link doesn't exist (PGRST116 is the code for no rows)
    if (linkError && linkError.code !== 'PGRST116') {
      console.error('Get share link query error:', linkError)
      throw linkError
    }

    if (!linkShare) {
      return res.json({
        status: 'success',
        action: 'get_share_link',
        data: {
          share_url: null,
          link_enabled: false
        },
        message: 'No share link exists'
      })
    }

    // Check if link has expired
    const isExpired = linkShare.expires_at && new Date(linkShare.expires_at) < new Date()

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${linkShare.share_token}`

    return res.json({
      status: 'success',
      action: 'get_share_link',
      data: {
        share_id: linkShare.id,
        share_token: linkShare.share_token,
        share_url: shareUrl,
        permission: linkShare.permission,
        expires_at: linkShare.expires_at,
        allow_download: linkShare.allow_download,
        is_expired: isExpired,
        link_enabled: true
      },
      message: 'Share link retrieved successfully'
    })
  } catch (error) {
    console.error('Get share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Disable share link
const disableShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'disable_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Disable link share
    const { error: updateError } = await supabase
      .from('file_shares')
      .update({ link_enabled: false })
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('share_type', 'link')

    if (updateError) {
      throw updateError
    }

    return res.json({
      status: 'success',
      action: 'disable_share_link',
      data: { file_id: id },
      message: 'Share link disabled successfully'
    })
  } catch (error) {
    console.error('Disable share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'disable_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Access file via share token (public endpoint)
const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params

    // Find share by token
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        *,
        file:files!file_id (*)
      `)
      .eq('share_token', token)
      .eq('link_enabled', true)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link not found or disabled',
        code: 404
      })
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link has expired',
        code: 410
      })
    }

    // Check if file exists and is not deleted
    if (!share.file || share.file.deleted_at) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'File not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'access_shared_file',
      data: {
        file: {
          id: share.file.id,
          name: share.file.name,
          type: share.file.type,
          size: share.file.size,
          created_at: share.file.created_at
        },
        permission: share.permission,
        allow_download: share.allow_download
      },
      message: 'Shared file accessed successfully'
    })
  } catch (error) {
    console.error('Access shared file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'access_shared_file',
      error: error.message,
      code: 500
    })
  }
}

// Share a file with a user by email
const shareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { email, permission = 'view', allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('📧 Share file request:', { fileId: id, email, userId })

    if (!email) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Email is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'File not found',
        code: 404
      })
    }

    // Find user by email
    const { data: sharedWithUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !sharedWithUser) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'User with this email not found',
        code: 404
      })
    }

    // Don't allow sharing with yourself
    if (sharedWithUser.id === userId) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Cannot share file with yourself',
        code: 400
      })
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_with', sharedWithUser.id)
      .single()

    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        action: 'share_file',
        error: 'File is already shared with this user',
        code: 409
      })
    }

    // Create share
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .insert([{
        file_id: id,
        shared_by: userId,
        shared_with: sharedWithUser.id,
        permission: permission,
        share_type: 'user',
        link_enabled: false,
        allow_download: allow_download
      }])
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    return res.json({
      status: 'success',
      action: 'share_file',
      data: {
        share_id: share.id,
        file_id: id,
        shared_with: {
          id: sharedWithUser.id,
          name: sharedWithUser.name,
          email: sharedWithUser.email
        },
        permission: permission
      },
      message: 'File shared successfully'
    })
  } catch (error) {
    console.error('Share file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'share_file',
      error: error.message,
      code: 500
    })
  }
}

// Get users a file is shared with
const getFileShares = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_file_shares',
        error: 'File not found',
        code: 404
      })
    }

    // Get shares with user details
    const { data: shares, error: sharesError } = await supabase
      .from('file_shares')
      .select(`
        *,
        shared_with_user:shared_with (id, name, email)
      `)
      .eq('file_id', id)

    if (sharesError) {
      throw sharesError
    }

    const formattedShares = (shares || []).map(share => ({
      id: share.id,
      shared_with: share.shared_with_user,
      permission: share.permission,
      share_type: share.share_type || 'user',
      link_enabled: share.link_enabled || false,
      allow_download: share.allow_download !== false,
      expires_at: share.expires_at,
      created_at: share.created_at
    }))

    return res.json({
      status: 'success',
      action: 'get_file_shares',
      data: { shares: formattedShares },
      message: 'File shares retrieved successfully'
    })
  } catch (error) {
    console.error('Get file shares error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_file_shares',
      error: error.message,
      code: 500
    })
  }
}

// Remove a share
const unshareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { share_id } = req.body
    const userId = req.user.id

    if (!share_id) {
      return res.status(400).json({
        status: 'error',
        action: 'unshare_file',
        error: 'share_id is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'File not found',
        code: 404
      })
    }

    // Verify share exists and belongs to this file
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('id', share_id)
      .eq('file_id', id)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'Share not found',
        code: 404
      })
    }

    // Delete share
    const { error: deleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', share_id)

    if (deleteError) {
      throw deleteError
    }

    return res.json({
      status: 'success',
      action: 'unshare_file',
      data: { share_id: share_id },
      message: 'File share removed successfully'
    })
  } catch (error) {
    console.error('Unshare file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'unshare_file',
      error: error.message,
      code: 500
    })
  }
}

// Get shared files (files shared with me and files I shared)
const getSharedFiles = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if file_shares table exists - if not, return empty arrays
    // This allows the app to work even if migration hasn't been run
    let sharedWithMe = []
    let sharedByMe = []
    let sharedWithMeError = null
    let sharedByMeError = null

    try {
      // Get files shared WITH me - use simpler query first
      const result1 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_with', userId)

      sharedWithMe = result1.data || []
      sharedWithMeError = result1.error

      // Get files shared BY me
      const result2 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_by', userId)

      sharedByMe = result2.data || []
      sharedByMeError = result2.error

      // If table doesn't exist, return empty arrays
      if (sharedWithMeError && (sharedWithMeError.code === 'PGRST116' || sharedWithMeError.message?.includes('does not exist'))) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }

      // Fetch file details for sharedWithMe
      if (sharedWithMe.length > 0) {
        const fileIds = sharedWithMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_by
          const userIds = [...new Set(sharedWithMe.map(s => s.shared_by))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedWithMe = sharedWithMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_by_user: userMap[share.shared_by] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // Fetch file details for sharedByMe
      if (sharedByMe.length > 0) {
        const fileIds = sharedByMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_with
          const userIds = [...new Set(sharedByMe.map(s => s.shared_with))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedByMe = sharedByMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_with_user: userMap[share.shared_with] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // If table exists but has other errors, handle them
      if (sharedWithMeError && sharedWithMeError.code !== 'PGRST116') {
        throw sharedWithMeError
      }
      if (sharedByMeError && sharedByMeError.code !== 'PGRST116') {
        throw sharedByMeError
      }
    } catch (tableError) {
      // Table doesn't exist or other error - return empty arrays
      console.error('Error fetching shared files:', tableError.message || tableError)
      if (tableError.message && tableError.message.includes('does not exist')) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }
      throw tableError
    }

    // Format files shared with me
    const filesSharedWithMe = (sharedWithMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedBy: item.shared_by_user,
          permission: item.permission,
          sharedWithMe: true,
          sharedByMe: false
        }
      })

    // Format files shared by me
    const filesSharedByMe = (sharedByMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedWith: item.shared_with_user,
          permission: item.permission,
          sharedWithMe: false,
          sharedByMe: true
        }
      })

    return res.json({
      status: 'success',
      action: 'get_shared_files',
      data: {
        sharedWithMe: filesSharedWithMe,
        sharedByMe: filesSharedByMe
      },
      message: 'Shared files retrieved successfully'
    })
  } catch (error) {
    console.error('Get shared files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_shared_files',
      error: error.message,
      code: 500
    })
  }
}

// Generate or get share link for a file
const createShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const { permission = 'view', expires_at = null, allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('🔗 Creating share link for file:', id, 'by user:', userId)

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'create_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Check if link already exists for this file
    // Use maybeSingle() to handle case where link doesn't exist
    const { data: existingLink, error: existingLinkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    let shareToken
    let shareId

    // Handle case where columns might not exist yet (migration not run)
    if (existingLinkError && existingLinkError.code !== 'PGRST116') {
      // Check if error is about missing columns
      if (existingLinkError.message && existingLinkError.message.includes('column')) {
        console.error('⚠️ Link sharing columns not found. Run migration: file_shares_link_migration.sql')
        return res.status(400).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Link sharing not enabled. Please run the database migration: file_shares_link_migration.sql',
          code: 400
        })
      }
      throw existingLinkError
    }

    if (existingLink) {
      // Update existing link
      shareToken = existingLink.share_token
      shareId = existingLink.id
      
      const { error: updateError } = await supabase
        .from('file_shares')
        .update({
          permission: permission,
          expires_at: expires_at,
          allow_download: allow_download,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (updateError) {
        // Check if it's a column error
        if (updateError.message && updateError.message.includes('column')) {
          return res.status(400).json({
            status: 'error',
            action: 'create_share_link',
            error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
            code: 400
          })
        }
        throw updateError
      }
    } else {
      // Generate new share token with retry logic for uniqueness
      const crypto = require('crypto')
      let shareCreated = false
      let maxRetries = 5
      let retryCount = 0

      while (!shareCreated && retryCount < maxRetries) {
        shareToken = crypto.randomBytes(32).toString('hex')

        // Create new link share
        const { data: share, error: shareError } = await supabase
          .from('file_shares')
          .insert([{
            file_id: id,
            shared_by: userId,
            shared_with: null, // Link shares don't have a specific user
            share_token: shareToken,
            share_type: 'link',
            link_enabled: true,
            permission: permission,
            expires_at: expires_at,
            allow_download: allow_download
          }])
          .select()
          .single()

        if (shareError) {
          // Log the full error for debugging
          console.error('Share link creation error (attempt ' + (retryCount + 1) + '):', shareError)
          
          // Check if it's a unique constraint violation on share_token (retry)
          if (shareError.code === '23505' || (shareError.message && shareError.message.includes('duplicate key value'))) {
            retryCount++
            if (retryCount >= maxRetries) {
              return res.status(500).json({
                status: 'error',
                action: 'create_share_link',
                error: 'Failed to generate unique share token. Please try again.',
                code: 500
              })
            }
            continue // Retry with new token
          }
          
          // Check if it's a column error
          if (shareError.message && shareError.message.includes('column')) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
              code: 400
            })
          }
          
          // Check if it's a NOT NULL constraint error for shared_with
          if (shareError.message && (shareError.message.includes('null value') || shareError.message.includes('NOT NULL'))) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'shared_with column must allow NULL values. Please run: file_shares_link_migration.sql',
              code: 400,
              details: shareError.message
            })
          }
          
          // Return detailed error
          return res.status(500).json({
            status: 'error',
            action: 'create_share_link',
            error: shareError.message || 'Failed to create share link',
            code: 500,
            details: shareError
          })
        }
        
        // Success!
        shareId = share.id
        shareCreated = true
        console.log('✅ Share link created successfully:', shareToken)
      }

      if (!shareCreated) {
        return res.status(500).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Failed to create share link after multiple attempts',
          code: 500
        })
      }
    }

    // Generate share URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${shareToken}`
    
    console.log('🔗 Returning share URL:', shareUrl)

    return res.json({
      status: 'success',
      action: 'create_share_link',
      data: {
        share_id: shareId,
        share_token: shareToken,
        share_url: shareUrl,
        permission: permission,
        expires_at: expires_at,
        allow_download: allow_download
      },
      message: 'Share link created successfully'
    })
  } catch (error) {
    console.error('Create share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'create_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Get share link for a file
const getShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Get existing link share
    const { data: linkShare, error: linkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    // Handle case where link doesn't exist (PGRST116 is the code for no rows)
    if (linkError && linkError.code !== 'PGRST116') {
      console.error('Get share link query error:', linkError)
      throw linkError
    }

    if (!linkShare) {
      return res.json({
        status: 'success',
        action: 'get_share_link',
        data: {
          share_url: null,
          link_enabled: false
        },
        message: 'No share link exists'
      })
    }

    // Check if link has expired
    const isExpired = linkShare.expires_at && new Date(linkShare.expires_at) < new Date()

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${linkShare.share_token}`

    return res.json({
      status: 'success',
      action: 'get_share_link',
      data: {
        share_id: linkShare.id,
        share_token: linkShare.share_token,
        share_url: shareUrl,
        permission: linkShare.permission,
        expires_at: linkShare.expires_at,
        allow_download: linkShare.allow_download,
        is_expired: isExpired,
        link_enabled: true
      },
      message: 'Share link retrieved successfully'
    })
  } catch (error) {
    console.error('Get share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Disable share link
const disableShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'disable_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Disable link share
    const { error: updateError } = await supabase
      .from('file_shares')
      .update({ link_enabled: false })
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('share_type', 'link')

    if (updateError) {
      throw updateError
    }

    return res.json({
      status: 'success',
      action: 'disable_share_link',
      data: { file_id: id },
      message: 'Share link disabled successfully'
    })
  } catch (error) {
    console.error('Disable share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'disable_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Access file via share token (public endpoint)
const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params

    // Find share by token
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        *,
        file:files!file_id (*)
      `)
      .eq('share_token', token)
      .eq('link_enabled', true)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link not found or disabled',
        code: 404
      })
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link has expired',
        code: 410
      })
    }

    // Check if file exists and is not deleted
    if (!share.file || share.file.deleted_at) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'File not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'access_shared_file',
      data: {
        file: {
          id: share.file.id,
          name: share.file.name,
          type: share.file.type,
          size: share.file.size,
          created_at: share.file.created_at
        },
        permission: share.permission,
        allow_download: share.allow_download
      },
      message: 'Shared file accessed successfully'
    })
  } catch (error) {
    console.error('Access shared file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'access_shared_file',
      error: error.message,
      code: 500
    })
  }
}

// Share a file with a user by email
const shareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { email, permission = 'view', allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('📧 Share file request:', { fileId: id, email, userId })

    if (!email) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Email is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'File not found',
        code: 404
      })
    }

    // Find user by email
    const { data: sharedWithUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !sharedWithUser) {
      return res.status(404).json({
        status: 'error',
        action: 'share_file',
        error: 'User with this email not found',
        code: 404
      })
    }

    // Don't allow sharing with yourself
    if (sharedWithUser.id === userId) {
      return res.status(400).json({
        status: 'error',
        action: 'share_file',
        error: 'Cannot share file with yourself',
        code: 400
      })
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_with', sharedWithUser.id)
      .single()

    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        action: 'share_file',
        error: 'File is already shared with this user',
        code: 409
      })
    }

    // Create share
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .insert([{
        file_id: id,
        shared_by: userId,
        shared_with: sharedWithUser.id,
        permission: permission,
        share_type: 'user',
        link_enabled: false,
        allow_download: allow_download
      }])
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    return res.json({
      status: 'success',
      action: 'share_file',
      data: {
        share_id: share.id,
        file_id: id,
        shared_with: {
          id: sharedWithUser.id,
          name: sharedWithUser.name,
          email: sharedWithUser.email
        },
        permission: permission
      },
      message: 'File shared successfully'
    })
  } catch (error) {
    console.error('Share file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'share_file',
      error: error.message,
      code: 500
    })
  }
}

// Get users a file is shared with
const getFileShares = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_file_shares',
        error: 'File not found',
        code: 404
      })
    }

    // Get shares with user details
    const { data: shares, error: sharesError } = await supabase
      .from('file_shares')
      .select(`
        *,
        shared_with_user:shared_with (id, name, email)
      `)
      .eq('file_id', id)

    if (sharesError) {
      throw sharesError
    }

    const formattedShares = (shares || []).map(share => ({
      id: share.id,
      shared_with: share.shared_with_user,
      permission: share.permission,
      share_type: share.share_type || 'user',
      link_enabled: share.link_enabled || false,
      allow_download: share.allow_download !== false,
      expires_at: share.expires_at,
      created_at: share.created_at
    }))

    return res.json({
      status: 'success',
      action: 'get_file_shares',
      data: { shares: formattedShares },
      message: 'File shares retrieved successfully'
    })
  } catch (error) {
    console.error('Get file shares error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_file_shares',
      error: error.message,
      code: 500
    })
  }
}

// Remove a share
const unshareFile = async (req, res) => {
  try {
    const { id } = req.params
    const { share_id } = req.body
    const userId = req.user.id

    if (!share_id) {
      return res.status(400).json({
        status: 'error',
        action: 'unshare_file',
        error: 'share_id is required',
        code: 400
      })
    }

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'File not found',
        code: 404
      })
    }

    // Verify share exists and belongs to this file
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('id', share_id)
      .eq('file_id', id)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'unshare_file',
        error: 'Share not found',
        code: 404
      })
    }

    // Delete share
    const { error: deleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', share_id)

    if (deleteError) {
      throw deleteError
    }

    return res.json({
      status: 'success',
      action: 'unshare_file',
      data: { share_id: share_id },
      message: 'File share removed successfully'
    })
  } catch (error) {
    console.error('Unshare file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'unshare_file',
      error: error.message,
      code: 500
    })
  }
}

// Get shared files (files shared with me and files I shared)
const getSharedFiles = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if file_shares table exists - if not, return empty arrays
    // This allows the app to work even if migration hasn't been run
    let sharedWithMe = []
    let sharedByMe = []
    let sharedWithMeError = null
    let sharedByMeError = null

    try {
      // Get files shared WITH me - use simpler query first
      const result1 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_with', userId)

      sharedWithMe = result1.data || []
      sharedWithMeError = result1.error

      // Get files shared BY me
      const result2 = await supabase
        .from('file_shares')
        .select('*')
        .eq('shared_by', userId)

      sharedByMe = result2.data || []
      sharedByMeError = result2.error

      // If table doesn't exist, return empty arrays
      if (sharedWithMeError && (sharedWithMeError.code === 'PGRST116' || sharedWithMeError.message?.includes('does not exist'))) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }

      // Fetch file details for sharedWithMe
      if (sharedWithMe.length > 0) {
        const fileIds = sharedWithMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_by
          const userIds = [...new Set(sharedWithMe.map(s => s.shared_by))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedWithMe = sharedWithMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_by_user: userMap[share.shared_by] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // Fetch file details for sharedByMe
      if (sharedByMe.length > 0) {
        const fileIds = sharedByMe.map(s => s.file_id)
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (!filesError && files) {
          // Fetch user details for shared_with
          const userIds = [...new Set(sharedByMe.map(s => s.shared_with))]
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds)

          const userMap = {}
          if (!usersError && users) {
            users.forEach(u => { userMap[u.id] = u })
          }

          // Combine share and file data
          sharedByMe = sharedByMe.map(share => {
            const file = files.find(f => f.id === share.file_id)
            return {
              ...share,
              files: file,
              file: file,
              shared_with_user: userMap[share.shared_with] || null
            }
          }).filter(item => item.file && !item.file.deleted_at)
        }
      }

      // If table exists but has other errors, handle them
      if (sharedWithMeError && sharedWithMeError.code !== 'PGRST116') {
        throw sharedWithMeError
      }
      if (sharedByMeError && sharedByMeError.code !== 'PGRST116') {
        throw sharedByMeError
      }
    } catch (tableError) {
      // Table doesn't exist or other error - return empty arrays
      console.error('Error fetching shared files:', tableError.message || tableError)
      if (tableError.message && tableError.message.includes('does not exist')) {
        console.log('⚠️ file_shares table does not exist yet. Run the migration: file_shares_migration.sql')
        return res.json({
          status: 'success',
          action: 'get_shared_files',
          data: {
            sharedWithMe: [],
            sharedByMe: []
          },
          message: 'Shared files retrieved successfully'
        })
      }
      throw tableError
    }

    // Format files shared with me
    const filesSharedWithMe = (sharedWithMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedBy: item.shared_by_user,
          permission: item.permission,
          sharedWithMe: true,
          sharedByMe: false
        }
      })

    // Format files shared by me
    const filesSharedByMe = (sharedByMe || [])
      .filter(item => {
        const file = item.files || item.file
        return file && !file.deleted_at
      })
      .map(item => {
        const file = item.files || item.file
        return {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          folder_id: file.folder_id,
          path: file.path,
          created_at: file.created_at,
          updated_at: file.updated_at,
          sharedWith: item.shared_with_user,
          permission: item.permission,
          sharedWithMe: false,
          sharedByMe: true
        }
      })

    return res.json({
      status: 'success',
      action: 'get_shared_files',
      data: {
        sharedWithMe: filesSharedWithMe,
        sharedByMe: filesSharedByMe
      },
      message: 'Shared files retrieved successfully'
    })
  } catch (error) {
    console.error('Get shared files error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_shared_files',
      error: error.message,
      code: 500
    })
  }
}

// Generate or get share link for a file
const createShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const { permission = 'view', expires_at = null, allow_download = true } = req.body
    const userId = req.user.id
    
    console.log('🔗 Creating share link for file:', id, 'by user:', userId)

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'create_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Check if link already exists for this file
    // Use maybeSingle() to handle case where link doesn't exist
    const { data: existingLink, error: existingLinkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    let shareToken
    let shareId

    // Handle case where columns might not exist yet (migration not run)
    if (existingLinkError && existingLinkError.code !== 'PGRST116') {
      // Check if error is about missing columns
      if (existingLinkError.message && existingLinkError.message.includes('column')) {
        console.error('⚠️ Link sharing columns not found. Run migration: file_shares_link_migration.sql')
        return res.status(400).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Link sharing not enabled. Please run the database migration: file_shares_link_migration.sql',
          code: 400
        })
      }
      throw existingLinkError
    }

    if (existingLink) {
      // Update existing link
      shareToken = existingLink.share_token
      shareId = existingLink.id
      
      const { error: updateError } = await supabase
        .from('file_shares')
        .update({
          permission: permission,
          expires_at: expires_at,
          allow_download: allow_download,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (updateError) {
        // Check if it's a column error
        if (updateError.message && updateError.message.includes('column')) {
          return res.status(400).json({
            status: 'error',
            action: 'create_share_link',
            error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
            code: 400
          })
        }
        throw updateError
      }
    } else {
      // Generate new share token with retry logic for uniqueness
      const crypto = require('crypto')
      let shareCreated = false
      let maxRetries = 5
      let retryCount = 0

      while (!shareCreated && retryCount < maxRetries) {
        shareToken = crypto.randomBytes(32).toString('hex')

        // Create new link share
        const { data: share, error: shareError } = await supabase
          .from('file_shares')
          .insert([{
            file_id: id,
            shared_by: userId,
            shared_with: null, // Link shares don't have a specific user
            share_token: shareToken,
            share_type: 'link',
            link_enabled: true,
            permission: permission,
            expires_at: expires_at,
            allow_download: allow_download
          }])
          .select()
          .single()

        if (shareError) {
          // Log the full error for debugging
          console.error('Share link creation error (attempt ' + (retryCount + 1) + '):', shareError)
          
          // Check if it's a unique constraint violation on share_token (retry)
          if (shareError.code === '23505' || (shareError.message && shareError.message.includes('duplicate key value'))) {
            retryCount++
            if (retryCount >= maxRetries) {
              return res.status(500).json({
                status: 'error',
                action: 'create_share_link',
                error: 'Failed to generate unique share token. Please try again.',
                code: 500
              })
            }
            continue // Retry with new token
          }
          
          // Check if it's a column error
          if (shareError.message && shareError.message.includes('column')) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'Link sharing columns not found. Please run the database migration: file_shares_link_migration.sql',
              code: 400
            })
          }
          
          // Check if it's a NOT NULL constraint error for shared_with
          if (shareError.message && (shareError.message.includes('null value') || shareError.message.includes('NOT NULL'))) {
            return res.status(400).json({
              status: 'error',
              action: 'create_share_link',
              error: 'shared_with column must allow NULL values. Please run: file_shares_link_migration.sql',
              code: 400,
              details: shareError.message
            })
          }
          
          // Return detailed error
          return res.status(500).json({
            status: 'error',
            action: 'create_share_link',
            error: shareError.message || 'Failed to create share link',
            code: 500,
            details: shareError
          })
        }
        
        // Success!
        shareId = share.id
        shareCreated = true
        console.log('✅ Share link created successfully:', shareToken)
      }

      if (!shareCreated) {
        return res.status(500).json({
          status: 'error',
          action: 'create_share_link',
          error: 'Failed to create share link after multiple attempts',
          code: 500
        })
      }
    }

    // Generate share URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${shareToken}`
    
    console.log('🔗 Returning share URL:', shareUrl)

    return res.json({
      status: 'success',
      action: 'create_share_link',
      data: {
        share_id: shareId,
        share_token: shareToken,
        share_url: shareUrl,
        permission: permission,
        expires_at: expires_at,
        allow_download: allow_download
      },
      message: 'Share link created successfully'
    })
  } catch (error) {
    console.error('Create share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'create_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Get share link for a file
const getShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'get_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Get existing link share
    const { data: linkShare, error: linkError } = await supabase
      .from('file_shares')
      .select('*')
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('link_enabled', true)
      .eq('share_type', 'link')
      .maybeSingle()

    // Handle case where link doesn't exist (PGRST116 is the code for no rows)
    if (linkError && linkError.code !== 'PGRST116') {
      console.error('Get share link query error:', linkError)
      throw linkError
    }

    if (!linkShare) {
      return res.json({
        status: 'success',
        action: 'get_share_link',
        data: {
          share_url: null,
          link_enabled: false
        },
        message: 'No share link exists'
      })
    }

    // Check if link has expired
    const isExpired = linkShare.expires_at && new Date(linkShare.expires_at) < new Date()

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const shareUrl = `${frontendUrl}/shared/${linkShare.share_token}`

    return res.json({
      status: 'success',
      action: 'get_share_link',
      data: {
        share_id: linkShare.id,
        share_token: linkShare.share_token,
        share_url: shareUrl,
        permission: linkShare.permission,
        expires_at: linkShare.expires_at,
        allow_download: linkShare.allow_download,
        is_expired: isExpired,
        link_enabled: true
      },
      message: 'Share link retrieved successfully'
    })
  } catch (error) {
    console.error('Get share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'get_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Disable share link
const disableShareLink = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verify file exists and belongs to user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fileError || !file) {
      return res.status(404).json({
        status: 'error',
        action: 'disable_share_link',
        error: 'File not found',
        code: 404
      })
    }

    // Disable link share
    const { error: updateError } = await supabase
      .from('file_shares')
      .update({ link_enabled: false })
      .eq('file_id', id)
      .eq('shared_by', userId)
      .eq('share_type', 'link')

    if (updateError) {
      throw updateError
    }

    return res.json({
      status: 'success',
      action: 'disable_share_link',
      data: { file_id: id },
      message: 'Share link disabled successfully'
    })
  } catch (error) {
    console.error('Disable share link error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'disable_share_link',
      error: error.message,
      code: 500
    })
  }
}

// Access file via share token (public endpoint)
const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params

    // Find share by token
    const { data: share, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        *,
        file:files!file_id (*)
      `)
      .eq('share_token', token)
      .eq('link_enabled', true)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link not found or disabled',
        code: 404
      })
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'Share link has expired',
        code: 410
      })
    }

    // Check if file exists and is not deleted
    if (!share.file || share.file.deleted_at) {
      return res.status(404).json({
        status: 'error',
        action: 'access_shared_file',
        error: 'File not found',
        code: 404
      })
    }

    return res.json({
      status: 'success',
      action: 'access_shared_file',
      data: {
        file: {
          id: share.file.id,
          name: share.file.name,
          type: share.file.type,
          size: share.file.size,
          created_at: share.file.created_at
        },
        permission: share.permission,
        allow_download: share.allow_download
      },
      message: 'Shared file accessed successfully'
    })
  } catch (error) {
    console.error('Access shared file error:', error)
    return res.status(500).json({
      status: 'error',
      action: 'access_shared_file',
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
  previewFile,
  deleteFile,
  renameFile,
  moveFile,
  getRecycleBinItems,
  restoreItem,
  createEmptyFile,
  shareFile,
  getFileShares,
  unshareFile,
  getSharedFiles,
  createShareLink,
  getShareLink,
  disableShareLink,
  accessSharedFile
}