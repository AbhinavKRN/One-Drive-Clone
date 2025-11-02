import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FileGrid from "../components/FileGrid";
import SharedView from "../components/SharedView";
import FilePreview from "../components/FilePreview";
import RecycleBin from "../components/RecycleBin";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameModal from "../components/RenameModal";
import { useFileManager } from "../hooks/useFileManager";
import PhotosPage from "./PhotosPage"; // 👈 new Photos page component
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [previewFile, setPreviewFile] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("Files");

  const {
    files,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem: renameFileOrFolder,
    navigateToFolder,
    navigateToPath,
    downloadFile,
  } = useFileManager();

  // Filtered files
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "folders")
      return matchesSearch && file.type === "folder";
    if (filterType === "images")
      return matchesSearch && file.type.startsWith("image/");
    if (filterType === "documents") {
      return (
        matchesSearch &&
        (file.type.includes("pdf") ||
          file.type.includes("document") ||
          file.type.includes("text") ||
          file.type.includes("word") ||
          file.type.includes("excel") ||
          file.type.includes("powerpoint"))
      );
    }
    return matchesSearch;
  });

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach((file) => uploadFile(file));
  };

  const handleCreateFolder = (folderName) => {
    createFolder(folderName);
    setShowCreateFolder(false);
  };

  const handleDelete = () => {
    if (selectedItems.length > 0) {
      if (window.confirm(`Delete ${selectedItems.length} item(s)?`)) {
        deleteItems(selectedItems);
        setSelectedItems([]);
      }
    }
  };

  const handleRename = (newName) => {
    if (renameItem) {
      renameFileOrFolder(renameItem.id, newName);
      setRenameItem(null);
    }
  };

  const handleItemClick = (file) => {
    if (file.type === "folder") {
      navigateToFolder(file.id);
      setSelectedItems([]);
    } else {
      setPreviewFile(file);
    }
  };

  const handleDownload = (file) => downloadFile(file);

  return (
    <div className="dashboard">
      <Navbar
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* --- Conditionally Render Tabs --- */}
      {activeTab === "Photos" ? (
        <PhotosPage />
      ) : (
        <div className="dashboard-content">
          {/* Sidebar */}
          <Sidebar
            storageUsed={storageUsed}
            storageTotal={storageTotal}
            filterType={filterType}
            onFilterChange={setFilterType}
            onCreateClick={() => setShowCreateFolder(true)}
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
          ) : filterType === 'folders' ? (
            <div className="files-container">
              <div className="files-header">
                <h1 className="files-title">My files</h1>
                <div className="files-header-actions">
                  <button className="header-btn">
                    <i className="fas fa-sort"></i>
                    Sort
                  </button>
                  <div className="view-toggle">
                    <button
                      className={viewMode === 'grid' ? 'active' : ''}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <i className="fas fa-th"></i>
                    </button>
                    <button
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>
                  <button className="header-btn">
                    <i className="fas fa-info-circle"></i>
                    Details
                  </button>
                </div>
              </div>

              <div className="files-white-box">
                <div className="toolbar">
                  <div className="breadcrumbs">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={crumb.id}>
                        <span
                          className="breadcrumb"
                          onClick={() => navigateToPath(crumb.id)}
                        >
                          {crumb.name}
                        </span>
                        {index < breadcrumbs.length - 1 && <span className="separator">/</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="toolbar-actions">
                    <label className="btn-upload">
                      <i className="fas fa-upload"></i>
                      Upload
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <button
                      className="btn-action"
                      onClick={() => setShowCreateFolder(true)}
                    >
                      <i className="fas fa-folder-plus"></i>
                      New folder
                    </button>

                    {selectedItems.length > 0 && (
                      <>
                        <button
                          className="btn-action"
                          onClick={handleDelete}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>

                        {selectedItems.length === 1 && (
                          <button
                            className="btn-action"
                            onClick={() => {
                              const item = files.find(f => f.id === selectedItems[0])
                              setRenameItem(item)
                            }}
                          >
                            <i className="fas fa-edit"></i>
                            Rename
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <FileGrid
                  files={filteredFiles}
                  viewMode={viewMode}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  onItemClick={handleItemClick}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          ) : (
            <div className="home-empty-state">
              <h3>Your recent files will show up here</h3>
              <div className="home-empty-illustration">
                <img
                  src="/images/image.png"
                  alt="Recent files illustration"
                  className="home-empty-image"
                />
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Modals & Preview */}
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
  );
};

export default Dashboard;
