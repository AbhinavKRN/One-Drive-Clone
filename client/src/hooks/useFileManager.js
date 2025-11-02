import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config/api";

// Helper to convert folder name to URL-friendly slug
const nameToSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

// Helper to find folder by slug
const findFolderBySlug = (slug, folders) => {
  return folders.find((f) => nameToSlug(f.name) === slug);
};

export const useFileManager = () => {
  const { getToken } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFilesRaw, setAllFilesRaw] = useState([]);
  const foldersRef = useRef([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: null, name: "My Files" },
  ]);
  const storageTotal = 5 * 1024 * 1024 * 1024; // 5GB in bytes
  const [storageUsed, setStorageUsed] = useState(0);
  const [loading, setLoading] = useState(false);

  // Build path to folder for breadcrumbs
  const buildPathToFolder = useCallback((folderId, allFolders) => {
    const path = [];
    let currentId = folderId;

    while (currentId) {
      const folder = allFolders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  }, []);

  // Load files and folders
  const loadData = useCallback(async () => {
    console.log("🔄 loadData called");
    setLoading(true);
    try {
      const token = getToken();
      console.log("🔑 Token:", token ? "Found" : "NOT FOUND");
      if (!token) {
        console.log("❌ No token, skipping load");
        return;
      }

      // Load files
      console.log("📥 Fetching files from:", API_BASE_URL + "/files");
      const filesResponse = await fetch(`${API_BASE_URL}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filesData = await filesResponse.json();
      console.log(
        "📁 Files response:",
        filesData.status,
        filesData.data?.files?.length || 0,
        "files"
      );

      // Load folders
      console.log("📥 Fetching folders from:", API_BASE_URL + "/folders");
      const foldersResponse = await fetch(`${API_BASE_URL}/folders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const foldersData = await foldersResponse.json();
      console.log(
        "📂 Folders response:",
        foldersData.status,
        foldersData.data?.folders?.length || 0,
        "folders"
      );

      if (filesData.status === "success" && foldersData.status === "success") {
        const allFiles = filesData.data.files || [];
        const allFolders = foldersData.data.folders || [];

        // Filter files and folders by current folder
        const currentFiles = allFiles.filter(
          (file) =>
            (currentFolderId === null && !file.folder_id) ||
            file.folder_id === currentFolderId
        );
        const currentFoldersList = allFolders.filter(
          (folder) =>
            (currentFolderId === null && !folder.parent_id) ||
            folder.parent_id === currentFolderId
        );

        // Combine and sort
        const combined = [
          ...currentFoldersList.map((folder) => ({
            ...folder,
            id: folder.id,
            name: folder.name,
            type: "folder",
            modified: folder.created_at,
            parentId: folder.parent_id,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at,
          })),
          ...currentFiles.map((file) => ({
            ...file,
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            modified: file.updated_at,
          })),
        ].sort((a, b) => {
          // Folders first, then alphabetically
          if (a.type === "folder" && b.type !== "folder") return -1;
          if (a.type !== "folder" && b.type === "folder") return 1;
          return a.name.localeCompare(b.name);
        });

        console.log(
          "✅ Setting",
          combined.length,
          "items to state:",
          combined.map((i) => i.name).join(", ")
        );
        setFiles(combined);
        // Store all files for recent view
        setAllFilesRaw(allFiles);
        // Normalize folder field names from snake_case to camelCase
        const normalizedFolders = allFolders.map((folder) => ({
          ...folder,
          parentId: folder.parent_id,
          createdAt: folder.created_at,
          updatedAt: folder.updated_at,
        }));
        setFolders(normalizedFolders);
        foldersRef.current = normalizedFolders;

        // Calculate storage
        const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
        setStorageUsed(totalSize);

        // Build breadcrumbs
        if (currentFolderId) {
          const path = buildPathToFolder(currentFolderId, normalizedFolders);
          setBreadcrumbs([{ id: null, name: "My Files" }, ...path]);
        } else {
          setBreadcrumbs([{ id: null, name: "My Files" }]);
        }
      } else {
        console.log(
          "⚠️ Response not successful:",
          filesData.status,
          foldersData.status
        );
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, currentFolderId, buildPathToFolder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Upload file
  const uploadFile = async (file) => {
    try {
      const token = getToken();
      if (!token) return;

      const formData = new FormData();
      formData.append("file", file);
      // Don't send folder_id - let backend auto-organize files into type-based folders
      // Files will go to Documents, Pictures, Videos, etc. based on file type

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.status === "success") {
        loadData();
      } else {
        alert(data.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    }
  };

  // Create folder
  const createFolder = async (folderName) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          parent_id: currentFolderId || null,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        loadData();
      } else {
        alert(data.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Create folder error:", error);
      alert("Failed to create folder");
    }
  };

  // Delete items (soft delete - moves to recycle bin)
  const deleteItems = async (itemIds) => {
    try {
      const token = getToken();
      if (!token) return;

      // Combine files and allFilesRaw to find items from any view (Recent, My Files, etc.)
      const allItems = [...files, ...allFilesRaw];
      // Remove duplicates by ID
      const uniqueItems = Array.from(
        new Map(allItems.map((item) => [item.id, item])).values()
      );

      const deletePromises = itemIds.map(async (itemId) => {
        // Find item in combined list (covers both Recent and My Files views)
        const item = uniqueItems.find((f) => f.id === itemId);
        if (!item) {
          console.error("Item not found:", itemId);
          // If item not found, try to delete anyway (might be in a different location)
          // Determine type from endpoint or try both
          const endpoints = [
            `${API_BASE_URL}/files/${itemId}`,
            `${API_BASE_URL}/folders/${itemId}`,
          ];

          // Try file first, then folder
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await response.json();
              if (data.status === "success") {
                return data;
              }
            } catch (err) {
              continue;
            }
          }
          return { status: "error", error: "Item not found" };
        }

        const endpoint =
          item.type === "folder"
            ? `${API_BASE_URL}/folders/${itemId}`
            : `${API_BASE_URL}/files/${itemId}`;

        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.status !== "success") {
          console.error("Delete failed for item:", itemId, data.error);
          return data;
        }
        return data;
      });

      const results = await Promise.all(deletePromises);
      const hasError = results.some((r) => r.status !== "success");

      if (hasError) {
        alert("Some items could not be deleted. Please try again.");
      } else {
        // Show success message
        const itemCount = itemIds.length;
        const itemText = itemCount === 1 ? "item" : "items";
        console.log(`Successfully deleted ${itemCount} ${itemText}`);
      }

      // Refresh the file list to update all views (Recent, My Files, etc.)
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete items");
    }
  };

  // Rename item
  const renameItem = async (itemId, newName) => {
    try {
      const token = getToken();
      if (!token) return;

      const item = files.find((f) => f.id === itemId);
      if (!item) {
        alert("Item not found");
        return;
      }

      const endpoint =
        item.type === "folder"
          ? `${API_BASE_URL}/folders/${itemId}/rename`
          : `${API_BASE_URL}/files/${itemId}/rename`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();
      if (data.status === "success") {
        loadData(); // Refresh the file list
      } else {
        alert(data.error || "Failed to rename item");
      }
    } catch (error) {
      console.error("Rename error:", error);
      alert("Failed to rename item");
    }
  };

  // Navigate to folder
  const navigateToFolder = useCallback((folderId) => {
    setCurrentFolderId(folderId);
  }, []);

  // Navigate to specific path (for breadcrumbs)
  const navigateToPath = useCallback((pathId) => {
    setCurrentFolderId(pathId);
  }, []);

  // Download file
  const downloadFile = async (file) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/files/${file.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  // Navigate to folder by ID or slug
  const navigateToFolderBySlug = useCallback((slugOrId) => {
    // If it's a UUID, use it directly
    if (
      slugOrId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId
      )
    ) {
      setCurrentFolderId(slugOrId);
    } else if (slugOrId) {
      // Otherwise, find by slug using ref
      const folder = findFolderBySlug(slugOrId, foldersRef.current);
      if (folder) {
        setCurrentFolderId(folder.id);
      }
    } else {
      setCurrentFolderId(null);
    }
  }, []);

  // Create empty file with specific category
  const createEmptyFile = useCallback(
    async (category) => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/files/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category,
            // Don't send folder_id - let backend auto-organize files into type-based folders
          }),
        });

        const data = await response.json();
        if (data.status === "success") {
          loadData();
        } else {
          alert(data.error || "Failed to create file");
        }
      } catch (error) {
        console.error("Create file error:", error);
        alert("Failed to create file");
      }
    },
    [getToken, loadData]
  );

  // Move file to folder
  const moveFileToFolder = useCallback(
    async (fileId, folderId) => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/files/${fileId}/move`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folder_id: folderId,
          }),
        });

        const data = await response.json();
        if (data.status === "success") {
          loadData();
          return true;
        } else {
          alert(data.error || "Failed to move file");
          return false;
        }
      } catch (error) {
        console.error("Move file error:", error);
        alert("Failed to move file");
        return false;
      }
    },
    [getToken, loadData]
  );

  // Refresh files and folders
  const refreshFiles = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    files,
    folders,
    allFilesRaw,
    currentPath: currentFolderId,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem,
    navigateToFolder,
    navigateToFolderBySlug,
    navigateToPath,
    downloadFile,
    refreshFiles,
    loading,
    nameToSlug, // Export helper for Dashboard
    createEmptyFile,
    moveFileToFolder,
  };
};

// Export helper functions
export { nameToSlug, findFolderBySlug };
