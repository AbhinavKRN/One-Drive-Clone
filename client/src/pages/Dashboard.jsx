import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { nameToSlug } from "../hooks/useFileManager";
import PhotosPage from "./PhotosPage"; // 👈 new Photos page component
import { ChevronDownRegular } from "@fluentui/react-icons";
import "./Dashboard.css";
import MomentsPage from "./MomentsPage";
import AlbumPage from "./AlbumsPage";
import FavouritesPage from "./FavouritesPage";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [previewFile, setPreviewFile] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("Files");
  const [sortBy, setSortBy] = useState("name");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);
  const navigateToFolderBySlugRef = useRef(null);
  const [photoTab, setPhotoTab] = useState("Moments");

  // Set filter type based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/home')) setFilterType('all');
    else if (path.includes('/myfiles')) setFilterType('myfiles');
    else if (path.includes('/shared')) setFilterType('shared');
    else if (path.includes('/recycle')) setFilterType('recycle');
    else if (path === '/dashboard' || path === '/dashboard/') setFilterType('all'); // default to home
  }, [location.pathname]);

  const {
    files,
    folders,
    allFilesRaw,
    currentPath,
    breadcrumbs,
    storageUsed,
    storageTotal,
    uploadFile,
    createFolder,
    deleteItems,
    renameItem: renameFileOrFolder,
    navigateToFolder,
    navigateToFolderBySlug,
    navigateToPath,
    downloadFile,
  } = useFileManager();

  // Store navigateToFolderBySlug in ref for stable reference
  useEffect(() => {
    navigateToFolderBySlugRef.current = navigateToFolderBySlug;
  }, [navigateToFolderBySlug]);

  // Sync folder slug from URL to currentFolderId
  useEffect(() => {
    const path = location.pathname;
    // If URL is like /dashboard/myfiles/documents, extract the slug
    if (path.includes('/myfiles/')) {
      const slug = path.split('/myfiles/')[1];
      if (slug && navigateToFolderBySlugRef.current) {
        navigateToFolderBySlugRef.current(slug);
        // Clear selection when navigating to a new folder
        setSelectedItems([]);
      }
    } else if (path.includes('/home') || path === '/dashboard' || path === '/dashboard/') {
      // Reset to root when navigating to home
      if (navigateToFolderBySlugRef.current) {
        navigateToFolderBySlugRef.current(null);
      }
      // Clear selection when navigating away
      setSelectedItems([]);
    } else if (path === '/dashboard/myfiles') {
      // Reset to root when navigating to My Files root
      if (navigateToFolderBySlugRef.current) {
        navigateToFolderBySlugRef.current(null);
      }
      // Clear selection when navigating to root
      setSelectedItems([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortMenu]);

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setShowSortMenu(false);
  };

  // Handle navigation from sidebar
  const handleFilterChange = (newFilterType) => {
    if (newFilterType === 'all') navigate('/dashboard/home');
    else if (newFilterType === 'myfiles') navigate('/dashboard/myfiles');
    else if (newFilterType === 'shared') navigate('/dashboard/shared');
    else if (newFilterType === 'recycle') navigate('/dashboard/recycle');
    else setFilterType(newFilterType);
  };

  // Handle folder navigation from sidebar
  const handleFolderNavigation = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const slug = nameToSlug(folder.name);
      navigate(`/dashboard/myfiles/${slug}`);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (folderId) => {
    if (folderId === null) {
      navigate('/dashboard/myfiles');
    } else {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        const slug = nameToSlug(folder.name);
        navigate(`/dashboard/myfiles/${slug}`);
      }
    }
  };

  // Filtered files
  const filteredFiles = (filterType === "all" ? allFilesRaw : files).filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filterType === "all") return matchesSearch && file.type !== "folder"; // Home: files only, no folders
    if (filterType === "myfiles") {
      // If we're inside a folder (currentPath is set), show all items, otherwise show folders only
      if (currentPath) return matchesSearch; // Inside folder: show files and folders
      return matchesSearch && file.type === "folder"; // My Files root: folders only
    }
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

  const handleFilesUpload = (files) => {
    files.forEach((file) => uploadFile(file));
  };

  const handleFolderUpload = (files) => {
    // Backend team will implement folder upload logic
    console.log("Folder upload:", files);
    alert("Folder upload feature will be implemented by backend team");
  };

  const handleCreateFolder = (folderName) => {
    createFolder(folderName);
    setShowCreateFolder(false);
  };

  // Handlers for Office document creation - Backend team will implement these
  const handleWordDocument = () => {
    console.log("Create Word document");
    alert("Word document creation feature will be implemented by backend team");
  };

  const handleExcelWorkbook = () => {
    console.log("Create Excel workbook");
    alert(
      "Excel workbook creation feature will be implemented by backend team"
    );
  };

  const handlePowerPointPresentation = () => {
    console.log("Create PowerPoint presentation");
    alert(
      "PowerPoint presentation creation feature will be implemented by backend team"
    );
  };

  const handleOneNoteNotebook = () => {
    console.log("Create OneNote notebook");
    alert(
      "OneNote notebook creation feature will be implemented by backend team"
    );
  };

  const handleExcelSurvey = () => {
    console.log("Create Excel survey");
    alert("Excel survey creation feature will be implemented by backend team");
  };

  const handleTextDocument = () => {
    console.log("Create Text document");
    alert("Text document creation feature will be implemented by backend team");
  };

  const handleDelete = (itemIds = null) => {
    const itemsToDelete = itemIds || selectedItems;
    if (itemsToDelete.length > 0) {
      const itemCount = itemsToDelete.length;
      if (window.confirm(`Delete ${itemCount} item(s)?`)) {
        deleteItems(itemsToDelete);
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
      const slug = nameToSlug(file.name);
      navigate(`/dashboard/myfiles/${slug}`);
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
        storageUsed={storageUsed}
        storageTotal={storageTotal}
        photoTab={photoTab}
        setPhotoTab={setPhotoTab}
      />

      {/* --- Conditionally Render Tabs --- */}
      {activeTab === "Photos" ? (
        photoTab === "Moments" ? (
          <MomentsPage />
        ) : photoTab === "Gallery" ? (
          <PhotosPage /> // or GalleryPage
        ) : photoTab === "Albums" ? (
          <AlbumPage />
        ) : photoTab === "Favorites" ? (
          <FavouritesPage />
        ) : null
      ) : (
        <div className="dashboard-content">
          {/* Sidebar */}
          <Sidebar
            storageUsed={storageUsed}
            storageTotal={storageTotal}
            filterType={filterType}
            onFilterChange={handleFilterChange}
            folders={folders}
            onFolderClick={handleFolderNavigation}
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
            {filterType === "recycle" ? (
              <RecycleBin />
            ) : filterType === "shared" ? (
              <SharedView
                files={files}
                viewMode={viewMode}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                onItemClick={handleItemClick}
                onDownload={handleDownload}
              />
            ) : filterType === "all" || filterType === "myfiles" || filterType === "folders" ? (
              <div className="files-container">
                {/* Action Bar - Show when items are selected in My Files */}
                {/* Show when we're in My Files and at least one item is selected */}
                {filterType === "myfiles" && selectedItems.length > 0 ? (
                  <div className="action-bar">
                    <div className="action-bar-left">
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Share functionality
                          console.log("Share clicked");
                        }}
                        title="Share"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v2.667A1.333 1.333 0 0 0 5.333 16h9.334A1.333 1.333 0 0 0 16 14.667V5.333A1.333 1.333 0 0 0 14.667 4H12" />
                          <path d="M10.667 1.333H2.667A1.333 1.333 0 0 0 1.333 2.667v8A1.333 1.333 0 0 0 2.667 12H4" />
                          <path d="M6.667 6.667L16 1.333M16 10.667L6.667 16" />
                        </svg>
                        <span>Share</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Copy link functionality
                          console.log("Copy link clicked");
                        }}
                        title="Copy link"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7.333 8.667a2.667 2.667 0 1 0 0-5.334 2.667 2.667 0 0 0 0 5.334z" />
                          <path d="M10.667 13.333a2.667 2.667 0 1 0 0-5.334 2.667 2.667 0 0 0 0 5.334z" />
                          <path d="M6 10.667l2.667 2.666" />
                        </svg>
                        <span>Copy link</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={handleDelete}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4h12M5.333 4V2.667A1.333 1.333 0 0 1 6.667 1.333h2.667a1.333 1.333 0 0 1 1.333 1.334V4m2 0v9.333A1.333 1.333 0 0 1 11.333 14.667H4.667A1.333 1.333 0 0 1 3.333 13.333V4h9.334z" />
                          <path d="M6.667 7.333v4M9.333 7.333v4" />
                        </svg>
                        <span>Delete</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          if (selectedItems.length === 1) {
                            const file = files.find(f => f.id === selectedItems[0]);
                            if (file && file.type !== 'folder') {
                              handleDownload(file);
                            }
                          }
                        }}
                        disabled={selectedItems.length !== 1 || files.find(f => f.id === selectedItems[0])?.type === 'folder'}
                        title="Download"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 11.333V1.333M8 11.333l-3.333-3.333M8 11.333l3.333-3.333" />
                          <path d="M1.333 14.667h13.334" />
                        </svg>
                        <span>Download</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Move to functionality
                          console.log("Move to clicked");
                        }}
                        title="Move to"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3.333v9.334A1.333 1.333 0 0 0 3.333 14h9.334A1.333 1.333 0 0 0 14 12.667V5.333L9.333 2H3.333A1.333 1.333 0 0 0 2 3.333z" />
                          <path d="M9.333 2v3.333H14M10.667 8l2 2 2-2" />
                        </svg>
                        <span>Move to</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Copy to functionality
                          console.log("Copy to clicked");
                        }}
                        title="Copy to"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.667 2H4.667A1.333 1.333 0 0 0 3.333 3.333v8A1.333 1.333 0 0 0 4.667 12.667h6A1.333 1.333 0 0 0 12.667 11.333v-8A1.333 1.333 0 0 0 10.667 2z" />
                          <path d="M8 1.333v1.334M6.667 3.333h2.666M6.667 5.333h4" />
                        </svg>
                        <span>Copy to</span>
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          if (selectedItems.length === 1) {
                            const item = files.find(f => f.id === selectedItems[0]);
                            setRenameItem(item);
                          }
                        }}
                        disabled={selectedItems.length !== 1}
                        title="Rename"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11.333 2a1.414 1.414 0 0 1 2 2l-8.667 8.667-2.666.667.667-2.667L11.333 2z" />
                        </svg>
                        <span>Rename</span>
                      </button>
                      
                      <div className="action-separator"></div>
                      
                      <div className="sort-dropdown" ref={sortMenuRef}>
                        <button
                          className="action-btn"
                          onClick={() => setShowSortMenu(!showSortMenu)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="2" y1="4" x2="14" y2="4" />
                            <line x1="2" y1="8" x2="14" y2="8" />
                            <line x1="2" y1="12" x2="14" y2="12" />
                          </svg>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px' }}>
                            <path d="M6 8.5L1 3.5L11 3.5L6 8.5Z" />
                          </svg>
                          <span>Sort</span>
                          <ChevronDownRegular className="dropdown-icon" />
                        </button>
                        {showSortMenu && (
                          <div className="sort-menu">
                            <button onClick={() => handleSort("name")}>
                              Name
                            </button>
                            <button onClick={() => handleSort("date")}>
                              Date modified
                            </button>
                            <button onClick={() => handleSort("size")}>
                              File size
                            </button>
                            <button onClick={() => handleSort("type")}>
                              File type
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="action-separator"></div>
                      
                      <button 
                        className="selected-count-btn"
                        onClick={() => setSelectedItems([])}
                        title="Clear selection"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
                          <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" />
                        </svg>
                        <span>{selectedItems.length} selected</span>
                      </button>
                      
                      <div className="action-separator"></div>
                      
                      <button 
                        className="action-btn view-toggle-btn"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        title="Toggle view"
                      >
                        {viewMode === 'list' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="2" width="6" height="6" rx="1" />
                            <rect x="9" y="2" width="6" height="6" rx="1" />
                            <rect x="2" y="9" width="6" height="6" rx="1" />
                            <rect x="9" y="9" width="6" height="6" rx="1" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="2" y1="4" x2="14" y2="4" />
                            <line x1="2" y1="8" x2="14" y2="8" />
                            <line x1="2" y1="12" x2="14" y2="12" />
                          </svg>
                        )}
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Details functionality
                          console.log("Details clicked");
                        }}
                        title="Details"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 3h8v10H4V3z" />
                          <path d="M6 6h4M6 9h3" />
                          <path d="M11 5l2-2v4l-2-2z" />
                        </svg>
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Top Bar - Default controls when no selection or not in My Files */}
                {!(filterType === "myfiles" && selectedItems.length > 0) ? (
                  <div className="recycle-bin-top-bar">
                    <div style={{ flex: 1 }}></div>
                    <div className="top-bar-controls">
                      <div className="sort-dropdown" ref={sortMenuRef}>
                        <button
                          className="sort-btn-top"
                          onClick={() => setShowSortMenu(!showSortMenu)}
                        >
                          <svg
                            className="sort-icon-top"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <line
                              x1="2"
                              y1="4"
                              x2="14"
                              y2="4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <line
                              x1="2"
                              y1="8"
                              x2="14"
                              y2="8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <line
                              x1="2"
                              y1="12"
                              x2="14"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M11 10l2 2 2-2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                          <span>Sort</span>
                          <ChevronDownRegular className="dropdown-icon" />
                        </button>
                        {showSortMenu && (
                          <div className="sort-menu">
                            <button onClick={() => handleSort("name")}>
                              Name
                            </button>
                            <button onClick={() => handleSort("date")}>
                              Date modified
                            </button>
                            <button onClick={() => handleSort("size")}>
                              File size
                            </button>
                            <button onClick={() => handleSort("type")}>
                              File type
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="view-btn" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="9" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="2" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                        <span>View</span>
                      </button>
                      <button className="details-btn-top">
                        <svg
                          className="details-icon-top"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 3h8v10H4V3z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <path
                            d="M6 6h4M6 9h3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M11 5l2-2v4l-2-2z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                <h1 className="files-title">
                  {filterType === "all" ? "Recent" : 
                   filterType === "myfiles" ? "My files" :
                   filterType === "folders" ? "Folders" : "Files"}
                </h1>

                <div className="files-white-box">
                  <div className="toolbar">
                    {filterType === "myfiles" || breadcrumbs.length > 1 ? (
                      <div className="breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                          <React.Fragment key={crumb.id}>
                            <span
                              className="breadcrumb"
                              onClick={() => handleBreadcrumbClick(crumb.id)}
                            >
                              {crumb.name}
                            </span>
                            {index < breadcrumbs.length - 1 && (
                              <span className="separator">/</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div></div>
                    )}

                    <div className="toolbar-actions">
                      <label className="btn-upload">
                        <i className="fas fa-upload"></i>
                        Upload
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
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
                          <button className="btn-action" onClick={handleDelete}>
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>

                          {selectedItems.length === 1 && (
                            <button
                              className="btn-action"
                              onClick={() => {
                                const item = files.find(
                                  (f) => f.id === selectedItems[0]
                                );
                                setRenameItem(item);
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
                    onDelete={handleDelete}
                    sortBy={sortBy}
                    filterType={filterType}
                    currentPath={currentPath}
                    user={user}
                    onSortChange={handleSort}
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
