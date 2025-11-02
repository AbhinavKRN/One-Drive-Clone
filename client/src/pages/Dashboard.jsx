import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FileGrid from "../components/FileGrid";
import SharedView from "../components/SharedView";
import FilePreview from "../components/FilePreview";
import RecycleBin from "../components/RecycleBin";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameModal from "../components/RenameModal";
import CommandBar from "../components/CommandBar";
import FilterBar from "../components/FilterBar";
import { useFileManager } from "../hooks/useFileManager";
import { nameToSlug } from "../hooks/useFileManager";
import PhotosPage from "./PhotosPage"; // 👈 new Photos page component
import { ChevronDownRegular } from "@fluentui/react-icons";
import "./Dashboard.css";
import MomentsPage from "./MomentsPage";
import AlbumPage from "./AlbumsPage";
import FavouritesPage from "./FavouritesPage";

const Dashboard = () => {
  const { user, getToken } = useAuth();
  const toast = useToast();
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
  const [documentFilter, setDocumentFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set filter type based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/home")) setFilterType("all");
    else if (path.includes("/myfiles")) setFilterType("myfiles");
    else if (path.includes("/shared")) setFilterType("shared");
    else if (path.includes("/recycle")) setFilterType("recycle");
    else if (path === "/dashboard" || path === "/dashboard/")
      setFilterType("all"); // default to home
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
    createEmptyFile,
  } = useFileManager(toast);

  // Store navigateToFolderBySlug in ref for stable reference
  useEffect(() => {
    navigateToFolderBySlugRef.current = navigateToFolderBySlug;
  }, [navigateToFolderBySlug]);

  // Sync folder slug from URL to currentFolderId
  useEffect(() => {
    const path = location.pathname;
    // If URL is like /dashboard/myfiles/documents, extract the slug
    if (path.includes("/myfiles/")) {
      const slug = path.split("/myfiles/")[1];
      if (slug && navigateToFolderBySlugRef.current) {
        navigateToFolderBySlugRef.current(slug);
        // Clear selection when navigating to a new folder
        setSelectedItems([]);
      }
    } else if (
      path.includes("/home") ||
      path === "/dashboard" ||
      path === "/dashboard/"
    ) {
      // Reset to root when navigating to home
      if (navigateToFolderBySlugRef.current) {
        navigateToFolderBySlugRef.current(null);
      }
      // Clear selection when navigating away
      setSelectedItems([]);
    } else if (path === "/dashboard/myfiles") {
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
    if (newFilterType === "all") navigate("/dashboard/home");
    else if (newFilterType === "myfiles") navigate("/dashboard/myfiles");
    else if (newFilterType === "shared") navigate("/dashboard/shared");
    else if (newFilterType === "recycle") navigate("/dashboard/recycle");
    else setFilterType(newFilterType);
  };

  // Handle folder navigation from sidebar
  const handleFolderNavigation = (folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      const slug = nameToSlug(folder.name);
      navigate(`/dashboard/myfiles/${slug}`);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (folderId) => {
    if (folderId === null) {
      navigate("/dashboard/myfiles");
    } else {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        const slug = nameToSlug(folder.name);
        navigate(`/dashboard/myfiles/${slug}`);
      }
    }
  };

  // Filtered files
  const filteredFiles = (filterType === "all" ? allFilesRaw : files).filter(
    (file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (filterType === "all") {
        // Home: files only, no folders
        if (file.type === "folder") return false;
        if (!matchesSearch) return false;

        // Apply document type filter
        if (documentFilter === "all") return true;

        if (documentFilter === "word") {
          return (
            file.type.includes("word") ||
            file.type.includes(
              "application/vnd.openxmlformats-officedocument.wordprocessingml"
            ) ||
            file.name.endsWith(".doc") ||
            file.name.endsWith(".docx")
          );
        }

        if (documentFilter === "excel") {
          return (
            file.type.includes("excel") ||
            file.type.includes("spreadsheet") ||
            file.type.includes(
              "application/vnd.openxmlformats-officedocument.spreadsheetml"
            ) ||
            file.name.endsWith(".xls") ||
            file.name.endsWith(".xlsx")
          );
        }

        if (documentFilter === "powerpoint") {
          return (
            file.type.includes("powerpoint") ||
            file.type.includes("presentation") ||
            file.type.includes(
              "application/vnd.openxmlformats-officedocument.presentationml"
            ) ||
            file.name.endsWith(".ppt") ||
            file.name.endsWith(".pptx")
          );
        }

        if (documentFilter === "onenote") {
          return (
            file.type.includes("onenote") ||
            file.name.endsWith(".one") ||
            file.name.endsWith(".onepkg")
          );
        }

        return true;
      }

      if (filterType === "myfiles") {
        // Show all items (files and folders) in both root and inside folders
        return matchesSearch;
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
    }
  );

  const handleFilesUpload = (files) => {
    files.forEach((file) => uploadFile(file));
  };

  const handleFolderUpload = (files) => {
    // Backend team will implement folder upload logic
    console.log("Folder upload:", files);
    toast.info("Folder upload feature will be implemented by backend team");
  };

  const handleCreateFolder = (folderName) => {
    createFolder(folderName);
    setShowCreateFolder(false);
  };

  // Handlers for Office document creation
  const handleWordDocument = () => {
    createEmptyFile("word");
  };

  const handleExcelWorkbook = () => {
    createEmptyFile("excel");
  };

  const handlePowerPointPresentation = () => {
    createEmptyFile("powerpoint");
  };

  const handleOneNoteNotebook = () => {
    createEmptyFile("onenote");
  };

  const handleExcelSurvey = () => {
    // Excel survey is the same as Excel workbook
    createEmptyFile("excel");
  };

  const handleTextDocument = () => {
    createEmptyFile("text");
  };

  const handleDelete = (itemIds = null) => {
    const itemsToDelete = itemIds || selectedItems;
    if (itemsToDelete.length > 0) {
      const itemCount = itemsToDelete.length;
      // Delete immediately and show toast
      deleteItems(itemsToDelete);
      setSelectedItems([]);
      toast.success(`${itemCount} item(s) moved to recycle bin`);
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

  // CommandBar handlers
  const handleCommandBarDelete = () => {
    handleDelete(selectedItems);
  };

  const handleCommandBarDownload = () => {
    selectedItems.forEach((itemId) => {
      const file = files.find((f) => f.id === itemId);
      if (file && file.type !== "folder") {
        handleDownload(file);
      }
    });
  };

  const handleShare = () => {
    toast.info("Share feature will be implemented");
  };

  const handleCopyLink = () => {
    toast.info("Copy link feature will be implemented");
  };

  const handleMoveTo = () => {
    toast.info("Move to feature will be implemented");
  };

  const handleCopyTo = () => {
    toast.info("Copy to feature will be implemented");
  };

  const handleCommandBarRename = () => {
    if (selectedItems.length === 1) {
      const item = files.find((f) => f.id === selectedItems[0]);
      setRenameItem(item);
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleDetails = () => {
    console.log("Open details pane");
    toast.info("Details pane feature will be implemented");
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('dashboard-sidebar-open');
    } else {
      document.body.classList.remove('dashboard-sidebar-open');
    }
    return () => {
      document.body.classList.remove('dashboard-sidebar-open');
    };
  }, [isSidebarOpen]);

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
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
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
          {/* Mobile Backdrop */}
          {isSidebarOpen && (
            <div 
              className="sidebar-backdrop" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

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
            isMobileOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
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
                onFilesUpload={handleFilesUpload}
                onFolderUpload={handleFolderUpload}
              />
            ) : filterType === "all" ||
              filterType === "myfiles" ||
              filterType === "folders" ? (
              <div className="files-container">
                {/* Top Bar - Shows CommandBar when items selected, or normal controls when not */}
                {filterType === "myfiles" && selectedItems.length > 0 ? (
                  <div className="command-bar-top-wrapper">
                    <CommandBar
                      selectedCount={selectedItems.length}
                      onShare={handleShare}
                      onCopyLink={handleCopyLink}
                      onDelete={handleCommandBarDelete}
                      onDownload={handleCommandBarDownload}
                      onMoveTo={handleMoveTo}
                      onCopyTo={handleCopyTo}
                      onRename={handleCommandBarRename}
                      onClearSelection={handleClearSelection}
                      onSort={() => setShowSortMenu(!showSortMenu)}
                      onDetails={handleDetails}
                      showSortMenu={showSortMenu}
                      onSortMenuToggle={() => setShowSortMenu(!showSortMenu)}
                    />
                  </div>
                ) : filterType === "all" ? (
                  <FilterBar
                    filterType={documentFilter}
                    onFilterChange={setDocumentFilter}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                ) : (
                  <div className="recycle-bin-top-bar">
                    {filterType === "myfiles" ? (
                      <div className="breadcrumbs-inline">
                        {breadcrumbs.map((crumb, index) => (
                          <React.Fragment key={crumb.id}>
                            <span
                              className={`breadcrumb ${
                                index === breadcrumbs.length - 1
                                  ? "breadcrumb-current"
                                  : ""
                              }`}
                              onClick={() => handleBreadcrumbClick(crumb.id)}
                            >
                              {crumb.name}
                            </span>
                            {index < breadcrumbs.length - 1 && (
                              <span className="separator">&gt;</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <h1 className="files-title-inline">
                        {filterType === "all"
                          ? "Recent"
                          : filterType === "folders"
                          ? "Folders"
                          : "Files"}
                      </h1>
                    )}
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
                      <button
                        className="view-btn"
                        onClick={() =>
                          setViewMode(viewMode === "grid" ? "list" : "grid")
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="6"
                            height="6"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <rect
                            x="9"
                            y="2"
                            width="6"
                            height="6"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <rect
                            x="2"
                            y="9"
                            width="6"
                            height="6"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <rect
                            x="9"
                            y="9"
                            width="6"
                            height="6"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
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
                )}

                {filterType !== "all" && (
                  <h1 className="files-title">
                    {filterType === "all"
                      ? "Recent"
                      : filterType === "myfiles"
                      ? "My files"
                      : filterType === "folders"
                      ? "Folders"
                      : "Files"}
                  </h1>
                )}

                <div className="files-white-box">
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
                    onFilesUpload={handleFilesUpload}
                    onFolderUpload={handleFolderUpload}
                    onShare={handleShare}
                    onCopyLink={handleCopyLink}
                    onMoveTo={handleMoveTo}
                    onCopyTo={handleCopyTo}
                    onRename={(file) => setRenameItem(file)}
                    onDetails={handleDetails}
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
