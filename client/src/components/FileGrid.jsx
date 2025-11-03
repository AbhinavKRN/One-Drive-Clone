import React, { useState, useEffect, useRef } from "react";
import {
  FolderRegular,
  ImageRegular,
  DocumentRegular,
  VideoRegular,
  MusicNote2Regular,
  ArchiveRegular,
  ShareRegular,
  MoreVerticalRegular,
} from "@fluentui/react-icons";
import FileContextMenu from "./FileContextMenu";
import "./FileGrid.css";

const FileGrid = ({
  files,
  viewMode,
  selectedItems,
  onSelectionChange,
  onItemClick,
  onDownload,
  onDelete,
  onShare,
  sortBy,
  filterType,
  currentPath,
  user,
  onSortChange,
  onFilesUpload,
  onFolderUpload,
  onMoveFileToFolder,
}) => {
  const [showNameMenu, setShowNameMenu] = useState(false);
  const [showModifiedMenu, setShowModifiedMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSharingMenu, setShowSharingMenu] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState("descending"); // Default descending for Name
  const [nameColumnWidth, setNameColumnWidth] = useState(2); // Default 2fr
  const [modifiedSortOrder, setModifiedSortOrder] = useState("descending");
  const [sizeSortOrder, setSizeSortOrder] = useState("ascending");
  const [sharingSortOrder, setSharingSortOrder] = useState("descending");
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [draggedFileId, setDraggedFileId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Check if we're in My Files view (root or inside folder) - MUST be declared early
  // Check if we're in Recent/Home view - MUST be declared early
  // Use direct filterType check to avoid TDZ issues
  const isMyFilesView = filterType === "myfiles";
  const isRecentView = filterType === "all";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".name-header-wrapper") &&
        !e.target.closest(".col-modified") &&
        !e.target.closest(".col-size") &&
        !e.target.closest(".col-sharing")
      ) {
        setShowNameMenu(false);
        setShowModifiedMenu(false);
        setShowSizeMenu(false);
        setShowSharingMenu(false);
        setShowColumnSettings(false);
      }
      
      // Close context menu when clicking outside
      if (!e.target.closest(".file-context-menu") && contextMenu) {
        setContextMenu(null);
      }
    };

    if (showNameMenu || showModifiedMenu || showSizeMenu || showSharingMenu || contextMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNameMenu, showModifiedMenu, showSizeMenu, showSharingMenu, contextMenu]);

  // Drag and drop handlers for file upload (from outside)
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (!onFilesUpload && !onFolderUpload) return;

    const items = Array.from(e.dataTransfer.items);
    const droppedFiles = Array.from(e.dataTransfer.files);

    // Check if any items are directories
    let hasDirectories = false;
    for (const item of items) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          hasDirectories = true;
          break;
        }
      }
    }

    if (hasDirectories && onFolderUpload) {
      // Handle folder upload
      onFolderUpload(droppedFiles);
    } else if (droppedFiles.length > 0 && onFilesUpload) {
      // Handle file upload
      onFilesUpload(droppedFiles);
    }
  };

  // Drag and drop handlers for moving files to folders (internal)
  const handleFileDragStart = (e, fileId) => {
    if (!onMoveFileToFolder || filterType !== "myfiles") return;
    setDraggedFileId(fileId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fileId);
    // Make the dragged element semi-transparent
    e.target.style.opacity = "0.5";
  };

  const handleFileDragEnd = (e) => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
    e.target.style.opacity = "1";
  };

  const handleFolderDragEnter = (e, folderId) => {
    if (!draggedFileId || draggedFileId === folderId) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the folder element, not entering a child
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverFolderId(null);
    }
  };

  const handleFolderDragOver = (e, folderId) => {
    if (!draggedFileId || draggedFileId === folderId) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleFolderDrop = async (e, folderId) => {
    if (!draggedFileId || !onMoveFileToFolder) return;

    e.preventDefault();
    e.stopPropagation();

    const fileId = draggedFileId;
    setDraggedFileId(null);
    setDragOverFolderId(null);

    // Don't move if dropping on the same folder
    const draggedFile = files.find((f) => f.id === fileId);
    if (draggedFile) {
      // Check if file is already in this folder
      const currentFolderId = draggedFile.folder_id || null;
      if (
        currentFolderId === folderId ||
        (currentFolderId === null && folderId === null)
      ) {
        return;
      }

      // Move the file to the folder
      await onMoveFileToFolder(fileId, folderId);
    }
  };
  const getFileIcon = (file) => {
    if (file.type === "folder") {
      return <FolderRegular />;
    }
    if (file.type.startsWith("image/")) {
      return <ImageRegular />;
    }
    if (file.type.includes("video")) {
      return <VideoRegular />;
    }
    if (file.type.includes("audio")) {
      return <MusicNote2Regular />;
    }
    if (
      file.type.includes("zip") ||
      file.type.includes("rar") ||
      file.type.includes("7z")
    ) {
      return <ArchiveRegular />;
    }
    return <DocumentRegular />;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelection = (fileId, e) => {
    e.stopPropagation();
    if (selectedItems.includes(fileId)) {
      onSelectionChange(selectedItems.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedItems, fileId]);
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    // Could implement context menu here
  };

  // Sort files based on sort order and sortBy prop
  // Use filterType directly to avoid TDZ issues
  const sortedFiles = [...files].sort((a, b) => {
    if (filterType === "all") {
      // Recent view sorting
      if (sortBy === "name" || !sortBy) {
        return sortOrder === "ascending"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "date") {
        const dateA = new Date(a.modified || a.updated_at || a.created_at || 0);
        const dateB = new Date(b.modified || b.updated_at || b.created_at || 0);
        return modifiedSortOrder === "ascending"
          ? dateA - dateB
          : dateB - dateA;
      }
      // Default to name sorting for Recent view
      return sortOrder === "ascending"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    // Standard My Files sorting - folders always first
    // First, ensure folders come before files
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    // If both are folders or both are files, sort by selected criteria
    if (sortBy === "name") {
      if (sortOrder === "ascending") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    } else if (sortBy === "date") {
      const dateA = new Date(a.modified || a.createdAt || 0);
      const dateB = new Date(b.modified || b.createdAt || 0);
      return modifiedSortOrder === "ascending" ? dateA - dateB : dateB - dateA;
    } else if (sortBy === "size") {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;
      return sizeSortOrder === "ascending" ? sizeA - sizeB : sizeB - sizeA;
    } else if (sortBy === "sharing") {
      // Sort by sharing status (Private vs Shared)
      const sharingA = a.is_shared ? "Shared" : "Private";
      const sharingB = b.is_shared ? "Shared" : "Private";
      if (sharingSortOrder === "ascending") {
        return sharingA.localeCompare(sharingB);
      } else {
        return sharingB.localeCompare(sharingA);
      }
    }
    // Default to name sorting
    return sortOrder === "ascending"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const handleSortChange = (order) => {
    setSortOrder(order);
    setShowNameMenu(false);
  };

  // Handle arrow click for Name column
  const handleNameArrowClick = (e) => {
    e.stopPropagation();
    if (sortBy !== "name") {
      // If switching to name column, start with ascending
      setSortOrder("ascending");
    } else {
      // If already sorting by name, toggle order
      const newOrder = sortOrder === "ascending" ? "descending" : "ascending";
      setSortOrder(newOrder);
    }
    if (onSortChange) {
      onSortChange("name");
    }
  };

  // Handle arrow click for Modified column
  const handleModifiedArrowClick = (e) => {
    e.stopPropagation();
    if (sortBy !== "date") {
      // If switching to date column, start with ascending
      setModifiedSortOrder("ascending");
    } else {
      // If already sorting by date, toggle order
      const newOrder = modifiedSortOrder === "ascending" ? "descending" : "ascending";
      setModifiedSortOrder(newOrder);
    }
    if (onSortChange) {
      onSortChange("date");
    }
  };

  // Handle arrow click for Size column
  const handleSizeArrowClick = (e) => {
    e.stopPropagation();
    if (sortBy !== "size") {
      // If switching to size column, start with ascending
      setSizeSortOrder("ascending");
    } else {
      // If already sorting by size, toggle order
      const newOrder = sizeSortOrder === "ascending" ? "descending" : "ascending";
      setSizeSortOrder(newOrder);
    }
    if (onSortChange) {
      onSortChange("size");
    }
  };

  // Handle arrow click for Sharing column
  const handleSharingArrowClick = (e) => {
    e.stopPropagation();
    if (sortBy !== "sharing") {
      // If switching to sharing column, start with ascending
      setSharingSortOrder("ascending");
    } else {
      // If already sorting by sharing, toggle order
      const newOrder = sharingSortOrder === "ascending" ? "descending" : "ascending";
      setSharingSortOrder(newOrder);
    }
    if (onSortChange) {
      onSortChange("sharing");
    }
  };

  const handleWidenColumn = () => {
    setNameColumnWidth((prev) => Math.min(prev + 0.5, 4));
    setShowColumnSettings(false);
    setShowNameMenu(false);
  };

  const handleNarrowColumn = () => {
    setNameColumnWidth((prev) => Math.max(prev - 0.5, 1));
    setShowColumnSettings(false);
    setShowNameMenu(false);
  };

  if (files.length === 0) {
    return (
      <div
        className={`empty-state ${isDragOver ? "drag-over" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h3>Your recent files will show up here</h3>
        <div className="empty-state-illustration">
          <img
            src="/images/image.png"
            alt="Recent files illustration"
            className="empty-state-image"
          />
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div
        className={`file-grid ${isDragOver ? "drag-over" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.map((file) => (
          <div
            key={file.id}
            className={`file-card ${
              selectedItems.includes(file.id) ? "selected" : ""
            } ${
              file.type === "folder" && dragOverFolderId === file.id
                ? "drag-over-folder"
                : ""
            }`}
            onClick={() => onItemClick(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            draggable={
              file.type !== "folder" &&
              filterType === "myfiles" &&
              !!onMoveFileToFolder
            }
            onDragStart={(e) =>
              file.type !== "folder" && handleFileDragStart(e, file.id)
            }
            onDragEnd={handleFileDragEnd}
            onDragEnter={(e) =>
              file.type === "folder" && handleFolderDragEnter(e, file.id)
            }
            onDragLeave={
              file.type === "folder" ? handleFolderDragLeave : undefined
            }
            onDragOver={(e) =>
              file.type === "folder" && handleFolderDragOver(e, file.id)
            }
            onDrop={(e) =>
              file.type === "folder" && handleFolderDrop(e, file.id)
            }
          >
            <div className="file-card-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.includes(file.id)}
                onChange={(e) => handleSelection(file.id, e)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="file-card-icon">
              {file.type === "folder" ? (
                <div style={{ color: "#ffb900" }}>{getFileIcon(file)}</div>
              ) : file.type.startsWith("image/") && file.data ? (
                <img src={file.data} alt={file.name} />
              ) : (
                <div style={{ color: "#0078d4" }}>{getFileIcon(file)}</div>
              )}
            </div>

            <div className="file-card-info">
              <div className="file-name" title={file.name}>
                {file.name}
              </div>
              <div className="file-meta">
                {file.type !== "folder" && (
                  <span>{formatBytes(file.size)}</span>
                )}
                <span>{formatDate(file.modified)}</span>
              </div>
            </div>

            <div className="file-card-actions">
              {file.type !== "folder" && (
                <button
                  className="file-card-download"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                  title="Download"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  className="file-card-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete([file.id]);
                  }}
                  title="Delete"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
              <button
                className="file-card-more"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setContextMenu({
                    file,
                    position: {
                      x: rect.left,
                      y: rect.bottom + 4,
                    },
                  });
                }}
                title="More options"
              >
                <MoreVerticalRegular />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Format date for Recent view (shorter format like "Aug 26", "Jan 8, 2024")
  const formatRecentDate = (date) => {
    if (!date) return "Invalid Date";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date";

      const now = new Date();
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If within current year, show "Mon DD"
      if (d.getFullYear() === now.getFullYear()) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      // Otherwise show "Mon DD, YYYY"
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Get owner name - use current user's name formatted like "AAYUSH KHOP."
  const getOwnerName = (file) => {
    if (user?.name) {
      // Format name like "AAYUSH KHOP." (first name + first 4 chars of last name)
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        const firstName = parts[0].toUpperCase();
        const lastName = parts[parts.length - 1].toUpperCase().substring(0, 4);
        return `${firstName} ${lastName}.`;
      }
      return user.name.toUpperCase();
    }
    return "My Files"; // Default fallback
  };

  // Get file location/subtitle
  const getFileLocation = (file) => {
    if (file.folder_name) return file.folder_name;
    if (file.parent_folder) return file.parent_folder;
    if (file.owner && file.owner !== "My Files") return `${file.owner}'s Files`;
    return "My Files";
  };

  // Recent View Layout (Name, Opened, Owner)
  if (isRecentView) {
    return (
      <div
        className={`recent-view ${isDragOver ? "drag-over" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="file-list-header recent-header"
          style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
        >
          <div
            className="file-list-col col-name sortable-header"
            onClick={() =>
              handleSortChange(
                sortOrder === "ascending" ? "descending" : "ascending"
              )
            }
          >
            Name
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              style={{ marginLeft: "6px" }}
            >
              <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
            </svg>
          </div>
          <div
            className="file-list-col col-opened sortable-header"
            onClick={(e) => {
              e.stopPropagation();
              const newOrder =
                modifiedSortOrder === "ascending" ? "descending" : "ascending";
              setModifiedSortOrder(newOrder);
              // Trigger sort change for date
              if (onSortChange) {
                onSortChange("date");
              }
            }}
          >
            Opened
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              style={{ marginLeft: "6px" }}
            >
              {modifiedSortOrder === "ascending" ? (
                <path d="M6 3.5L1 8.5L11 8.5L6 3.5Z" />
              ) : (
                <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
              )}
            </svg>
          </div>
          <div
            className="file-list-col col-owner sortable-header"
            onClick={(e) => {
              e.stopPropagation();
              // Owner sort logic could go here
            }}
          >
            Owner
          </div>
        </div>

        {sortedFiles.map((file) => {
          const isSelected = selectedItems.includes(file.id);

          return (
            <div
              key={file.id}
              className={`file-list-row recent-row ${
                isSelected ? "selected" : ""
              }`}
              style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
              onClick={(e) => {
                if (
                  e.target.type !== "checkbox" &&
                  !e.target.closest(".btn-icon")
                ) {
                  onItemClick(file);
                }
              }}
            >
              <div className="file-list-col col-name">
                <div
                  style={{
                    color: file.type === "folder" ? "#ffb900" : "#0078d4",
                    marginRight: "12px",
                  }}
                >
                  {getFileIcon(file)}
                </div>
                <div className="file-name-wrapper">
                  <div className="file-name-primary">{file.name}</div>
                  <div className="file-name-secondary">
                    {getFileLocation(file)}
                  </div>
                </div>
              </div>

              <div className="file-list-col col-opened">
                {formatRecentDate(
                  file.modified || file.updated_at || file.created_at
                )}
              </div>

              <div className="file-list-col col-owner">
                {getOwnerName(file)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (selectedItems.length === files.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(files.map((f) => f.id));
    }
  };

  // Standard My Files View Layout
  return (
    <div
      className={`file-list ${isDragOver ? "drag-over" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`file-list-header ${isMyFilesView ? "my-files-header" : ""}`}
        style={{ gridTemplateColumns: `48px minmax(150px, ${nameColumnWidth}fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)` }}
      >
        {/* Select All Checkbox Column */}
        <div className="file-list-col col-checkbox">
          <label
            className="circular-checkbox-wrapper select-all-checkbox"
            onClick={handleSelectAll}
            style={{ opacity: 1, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={
                selectedItems.length === files.length && files.length > 0
              }
              onChange={handleSelectAll}
              className="circular-checkbox"
            />
            <span className="circular-checkbox-checkmark">
              {selectedItems.length === files.length && files.length > 0 && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </label>
        </div>

        <div className="file-list-col col-name">
          <div className="name-header-wrapper">
            <span
              className="name-header-text"
              onClick={() => setShowNameMenu(!showNameMenu)}
            >
              Name
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{ marginLeft: "4px", cursor: "pointer" }}
                onClick={handleNameArrowClick}
              >
                {sortBy === "name" && sortOrder === "ascending" ? (
                  <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
                ) : (
                  <path d="M6 3.5L1 8.5L11 8.5L6 3.5Z" />
                )}
              </svg>
            </span>
            {showNameMenu && (
              <div className="name-dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => handleSortChange("ascending")}
                >
                  Ascending
                </div>
                <div
                  className="menu-item"
                  onClick={() => handleSortChange("descending")}
                >
                  Descending
                </div>
                <div
                  className="menu-item menu-item-with-arrow"
                  onMouseEnter={() => setShowColumnSettings(true)}
                  onMouseLeave={() => setShowColumnSettings(false)}
                >
                  Column settings
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M4 2L9 6L4 10V2Z" />
                  </svg>
                  {showColumnSettings && (
                    <div className="column-settings-submenu">
                      <div className="menu-item" onClick={handleWidenColumn}>
                        Widen column
                      </div>
                      <div className="menu-item" onClick={handleNarrowColumn}>
                        Narrow column
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="file-list-col col-modified">
          <div className="name-header-wrapper">
            <span
              className="name-header-text"
              onClick={() => setShowModifiedMenu(!showModifiedMenu)}
            >
              Modified
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{ marginLeft: "6px", marginRight: "2px" }}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5.5"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="0.8"
                />
                <text
                  x="6"
                  y="8"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  fontWeight="bold"
                >
                  i
                </text>
              </svg>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{ marginLeft: "2px", cursor: "pointer" }}
                onClick={handleModifiedArrowClick}
              >
                {sortBy === "date" && modifiedSortOrder === "ascending" ? (
                  <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
                ) : (
                  <path d="M6 3.5L1 8.5L11 8.5L6 3.5Z" />
                )}
              </svg>
            </span>
            {showModifiedMenu && (
              <div className="name-dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => {
                    setModifiedSortOrder("ascending");
                    setShowModifiedMenu(false);
                  }}
                >
                  Ascending
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setModifiedSortOrder("descending");
                    setShowModifiedMenu(false);
                  }}
                >
                  Descending
                </div>
                <div
                  className="menu-item menu-item-with-arrow"
                  onMouseEnter={() => setShowColumnSettings(true)}
                  onMouseLeave={() => setShowColumnSettings(false)}
                >
                  Column settings
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M4 2L9 6L4 10V2Z" />
                  </svg>
                  {showColumnSettings && (
                    <div className="column-settings-submenu">
                      <div className="menu-item">Widen column</div>
                      <div className="menu-item">Narrow column</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="file-list-col col-size">
          <div className="name-header-wrapper">
            <span
              className="name-header-text"
              onClick={() => setShowSizeMenu(!showSizeMenu)}
            >
              File size
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{ marginLeft: "4px", cursor: "pointer" }}
                onClick={handleSizeArrowClick}
              >
                {sortBy === "size" && sizeSortOrder === "ascending" ? (
                  <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
                ) : (
                  <path d="M6 3.5L1 8.5L11 8.5L6 3.5Z" />
                )}
              </svg>
            </span>
            {showSizeMenu && (
              <div className="name-dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => {
                    setSizeSortOrder("ascending");
                    setShowSizeMenu(false);
                  }}
                >
                  Ascending
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setSizeSortOrder("descending");
                    setShowSizeMenu(false);
                  }}
                >
                  Descending
                </div>
                <div
                  className="menu-item menu-item-with-arrow"
                  onMouseEnter={() => setShowColumnSettings(true)}
                  onMouseLeave={() => setShowColumnSettings(false)}
                >
                  Column settings
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M4 2L9 6L4 10V2Z" />
                  </svg>
                  {showColumnSettings && (
                    <div className="column-settings-submenu">
                      <div className="menu-item">Widen column</div>
                      <div className="menu-item">Narrow column</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="file-list-col col-sharing">
          <div className="name-header-wrapper">
            <span
              className="name-header-text"
              onClick={() => setShowSharingMenu(!showSharingMenu)}
            >
              Sharing
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{ marginLeft: "4px", cursor: "pointer" }}
                onClick={handleSharingArrowClick}
              >
                {sortBy === "sharing" && sharingSortOrder === "ascending" ? (
                  <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
                ) : (
                  <path d="M6 3.5L1 8.5L11 8.5L6 3.5Z" />
                )}
              </svg>
            </span>
            {showSharingMenu && (
              <div className="name-dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => {
                    setSharingSortOrder("ascending");
                    setShowSharingMenu(false);
                  }}
                >
                  Ascending
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setSharingSortOrder("descending");
                    setShowSharingMenu(false);
                  }}
                >
                  Descending
                </div>
                <div
                  className="menu-item menu-item-with-arrow"
                  onMouseEnter={() => setShowColumnSettings(true)}
                  onMouseLeave={() => setShowColumnSettings(false)}
                >
                  Column settings
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M4 2L9 6L4 10V2Z" />
                  </svg>
                  {showColumnSettings && (
                    <div className="column-settings-submenu">
                      <div className="menu-item">Widen column</div>
                      <div className="menu-item">Narrow column</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sortedFiles.map((file) => {
        const isSelected = selectedItems.includes(file.id);
        const isInMyFilesView = isMyFilesView;

        // Calculate folder item count (placeholder - would need backend data)
        const folderItemCount = file.type === "folder" ? "3 items" : null;

        return (
          <div
            key={file.id}
            className={`file-list-row ${isSelected ? "selected" : ""} ${
              isInMyFilesView && isSelected ? "my-files-selected" : ""
            } ${
              file.type === "folder" && dragOverFolderId === file.id
                ? "drag-over-folder"
                : ""
            }`}
            style={{
              gridTemplateColumns: `48px minmax(150px, ${nameColumnWidth}fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)`,
            }}
            draggable={
              file.type !== "folder" &&
              filterType === "myfiles" &&
              !!onMoveFileToFolder
            }
            onDragStart={(e) =>
              file.type !== "folder" && handleFileDragStart(e, file.id)
            }
            onDragEnd={handleFileDragEnd}
            onDragEnter={(e) =>
              file.type === "folder" && handleFolderDragEnter(e, file.id)
            }
            onDragLeave={
              file.type === "folder" ? handleFolderDragLeave : undefined
            }
            onDragOver={(e) =>
              file.type === "folder" && handleFolderDragOver(e, file.id)
            }
            onDrop={(e) =>
              file.type === "folder" && handleFolderDrop(e, file.id)
            }
            onClick={(e) => {
              // Only handle row click if not clicking on interactive elements
              if (
                e.target.type === "checkbox" ||
                e.target.closest(".circular-checkbox-wrapper") ||
                e.target.closest(".btn-icon") ||
                e.target.closest(".file-icon-clickable") ||
                e.target.closest(".file-name-clickable")
              ) {
                return; // Let those elements handle their own clicks
              }

              // In My Files view, clicking empty space toggles selection
              if (isInMyFilesView) {
                handleSelection(file.id, e);
              } else {
                // Outside My Files, clicking row opens/navigates
                onItemClick(file);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, file)}
          >
            {/* Checkbox Column */}
            <div className="file-list-col col-checkbox">
              <label
                className="circular-checkbox-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection(file.id, e);
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleSelection(file.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="circular-checkbox"
                />
                <span className="circular-checkbox-checkmark">
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l2.5 2.5L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </label>
            </div>

            <div className="file-list-col col-name">
              <div
                className="file-icon-clickable"
                style={{
                  color: file.type === "folder" ? "#ffb900" : "#0078d4",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(file);
                }}
              >
                {getFileIcon(file)}
              </div>
              <span
                className="file-name file-name-clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(file);
                }}
                style={{ cursor: "pointer" }}
              >
                {file.name}
              </span>
              <div className="file-row-actions">
                {file.type !== "folder" && (
                  <button
                    className="btn-icon action-icon share-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShare) {
                        onShare(file);
                      }
                    }}
                    title="Share"
                  >
                    <ShareRegular />
                  </button>
                )}
                <button
                  className="btn-icon action-icon ellipsis-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setContextMenu({
                      file,
                      position: {
                        x: rect.left,
                        y: rect.bottom + 4,
                      },
                    });
                  }}
                  title="More options"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <circle cx="8" cy="3" r="1.5"></circle>
                    <circle cx="8" cy="8" r="1.5"></circle>
                    <circle cx="8" cy="13" r="1.5"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="file-list-col col-modified">
              {formatDate(file.modified || file.createdAt)}
            </div>

            <div className="file-list-col col-size">
              {file.type === "folder"
                ? folderItemCount
                : formatBytes(file.size || 0)}
            </div>

            <div className="file-list-col col-sharing">Private</div>
          </div>
        );
      })}
      
      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onShare={() => {
            if (onShare && contextMenu.file) {
              onShare(contextMenu.file);
            }
          }}
          onCopyLink={async () => {
            if (onCopyLink && contextMenu.file) {
              // Use the file from context menu for copy link
              if (contextMenu.file.type === 'folder') {
                return;
              }
              await onCopyLink(contextMenu.file);
            }
          }}
          onDelete={() => {
            if (onDelete) onDelete([contextMenu.file.id]);
          }}
          onDownload={() => {
            if (onDownload && contextMenu.file.type !== 'folder') {
              onDownload(contextMenu.file);
            }
          }}
          onMoveTo={() => {
            if (onMoveTo) onMoveTo();
          }}
          onCopyTo={() => {
            if (onCopyTo) onCopyTo();
          }}
          onRename={() => {
            if (onRename) onRename(contextMenu.file);
          }}
          onDetails={() => {
            if (onDetails) onDetails();
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default FileGrid;
