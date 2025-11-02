import React, { useState, useEffect, useRef } from "react";
import { ChevronDownRegular, DocumentRegular, DeleteRegular } from "@fluentui/react-icons";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API_BASE_URL from "../config/api";
import "./RecycleBin.css";

const RecycleBin = () => {
  const { getToken } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [sortBy, setSortBy] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const sortMenuRef = useRef(null);

  // Handle item selection
  const handleItemSelection = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === sortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedItems.map((item) => item.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      const token = getToken();
      if (!token) return;

      const deletePromises = selectedItems.map(async (itemId) => {
        const item = deletedItems.find((i) => i.id === itemId);
        if (!item) return { status: "error", error: "Item not found" };

        const endpoint =
          item.item_type === "folder"
            ? `${API_BASE_URL}/folders/${itemId}?permanent=true`
            : `${API_BASE_URL}/files/${itemId}?permanent=true`;

        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.json();
      });

      const results = await Promise.all(deletePromises);
      const hasError = results.some((r) => r.status !== "success");

      if (hasError) {
        toast.error("Some items could not be deleted");
      } else {
        toast.success(`${selectedItems.length} item(s) permanently deleted`);
      }

      setSelectedItems([]);
      loadRecycleBinItems();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Failed to delete items");
    }
  };

  // Handle empty recycle bin
  const handleEmptyRecycleBin = async () => {
    if (deletedItems.length === 0) {
      toast.info("Recycle bin is already empty");
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const deletePromises = deletedItems.map(async (item) => {
        const endpoint =
          item.item_type === "folder"
            ? `${API_BASE_URL}/folders/${item.id}?permanent=true`
            : `${API_BASE_URL}/files/${item.id}?permanent=true`;

        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.json();
      });

      const results = await Promise.all(deletePromises);
      const hasError = results.some((r) => r.status !== "success");

      if (hasError) {
        toast.error("Some items could not be deleted");
      } else {
        toast.success("Recycle bin emptied successfully");
      }

      setSelectedItems([]);
      loadRecycleBinItems();
    } catch (error) {
      console.error("Error emptying recycle bin:", error);
      toast.error("Failed to empty recycle bin");
    }
  };

  // Handle bulk restore
  const handleBulkRestore = async () => {
    if (selectedItems.length === 0) return;

    try {
      const token = getToken();
      if (!token) return;

      const restorePromises = selectedItems.map(async (itemId) => {
        const item = deletedItems.find((i) => i.id === itemId);
        if (!item) return { status: "error", error: "Item not found" };

        const response = await fetch(
          `${API_BASE_URL}/files/restore/${itemId}?item_type=${item.item_type}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.json();
      });

      const results = await Promise.all(restorePromises);
      const hasError = results.some((r) => r.status !== "success");

      if (hasError) {
        toast.error("Some items could not be restored");
      } else {
        toast.success(`${selectedItems.length} item(s) restored successfully`);
      }

      setSelectedItems([]);
      loadRecycleBinItems();
    } catch (error) {
      console.error("Error restoring items:", error);
      toast.error("Failed to restore items");
    }
  };

  // Load recycle bin items
  const loadRecycleBinItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/files/recycle-bin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        setDeletedItems(data.data.items || []);
      }
    } catch (error) {
      console.error("Error loading recycle bin items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load recycle bin items on mount and when navigating to recycle bin
  useEffect(() => {
    loadRecycleBinItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Reload when pathname changes (user navigates to Recycle Bin)

  // Sort items
  const sortedItems = [...deletedItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.deleted_at) - new Date(a.deleted_at);
      case "size":
        return b.size - a.size;
      case "location":
        return a.original_location.localeCompare(b.original_location);
      default:
        return 0;
    }
  });

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setShowSortMenu(false);
  };

  // Restore item
  const handleRestore = async (item) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/files/restore/${item.id}?item_type=${item.item_type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        loadRecycleBinItems(); // Reload items
        toast.success(
          `${
            item.item_type === "folder" ? "Folder" : "File"
          } restored successfully`
        );
      } else {
        toast.error(data.error || "Failed to restore item");
      }
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  // Permanently delete item
  const handlePermanentDelete = async (item) => {
    // Delete immediately without confirmation
    // User will be notified via toast

    try {
      const token = getToken();
      if (!token) return;

      const endpoint =
        item.item_type === "folder"
          ? `${API_BASE_URL}/folders/${item.id}?permanent=true`
          : `${API_BASE_URL}/files/${item.id}?permanent=true`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        loadRecycleBinItems(); // Reload items
        toast.success(`"${item.name}" permanently deleted`);
      } else {
        toast.error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Close sort menu when clicking outside
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

  return (
    <div className="recycle-bin-container">
      {/* Top Bar */}
      <div className="recycle-bin-top-bar">
        {selectedItems.length > 0 ? (
          <div className="selection-command-bar">
            <div className="command-bar-primary">
              <button className="command-bar-btn" onClick={handleBulkRestore} title="Restore">
                <svg className="command-bar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2v6l4-4M8 8l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8v6M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Restore</span>
              </button>
              <button className="command-bar-btn" onClick={handleBulkDelete} title="Delete">
                <svg className="command-bar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M4 4h8v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Delete</span>
              </button>
            </div>
            <div className="command-bar-secondary">
              <button className="command-bar-btn-selection" onClick={() => setSelectedItems([])} title="Clear selection">
                <svg className="command-bar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="selection-count-text">{selectedItems.length} selected</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="command-bar-group">
            <div className="personal-vault-toggle">
              <svg
                className="vault-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 1L3 4V7C3 10.87 5.61 14.34 8 15C10.39 14.34 13 10.87 13 7V4L8 1Z"
                  fill="currentColor"
                />
              </svg>
              <span>Show Personal Vault items</span>
            </div>
            <button
              className="empty-recycle-bin-btn"
              onClick={handleEmptyRecycleBin}
              disabled={deletedItems.length === 0}
              title="Empty Recycle Bin"
            >
              <DeleteRegular className="empty-bin-icon" />
              <span>Empty Recycle Bin</span>
            </button>
          </div>
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
                <button onClick={() => handleSort("name")}>Name</button>
                <button onClick={() => handleSort("date")}>Date deleted</button>
                <button onClick={() => handleSort("size")}>File size</button>
                <button onClick={() => handleSort("location")}>
                  Original location
                </button>
              </div>
            )}
          </div>
          <button className="view-btn">
            <svg
              className="view-icon"
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
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="8"
                x2="12"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="12"
                x2="10"
                y2="12"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            <ChevronDownRegular className="dropdown-icon" />
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

      {/* Title */}
      <h1 className="recycle-bin-title">Recycle bin</h1>

      {/* Table Header */}
      <div className="recycle-bin-table-header">
        <div className="recycle-bin-table-wrapper">
          <table className="recycle-bin-table">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell checkbox-header">
                  <label className="select-all-checkbox-label">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length > 0 &&
                        selectedItems.length === sortedItems.length
                      }
                      onChange={handleSelectAll}
                      className="select-all-checkbox-input"
                    />
                    <span className="circular-checkbox-checkmark">
                      {selectedItems.length > 0 &&
                        selectedItems.length === sortedItems.length && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
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
                </th>
                <th className="table-header-cell">
                  <DocumentRegular className="header-icon" />
                  Name
                </th>
                <th className="table-header-cell">Original location</th>
                <th className="table-header-cell sortable">
                  Date deleted
                  <ChevronDownRegular className="sort-icon" />
                </th>
                <th className="table-header-cell">File size</th>
              </tr>
            </thead>
            {sortedItems.length > 0 && (
              <tbody>
                {sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`table-row ${
                      selectedItems.includes(item.id) ? "selected" : ""
                    }`}
                  >
                    <td className="table-cell checkbox-cell">
                      <label className="row-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelection(item.id)}
                          className="row-checkbox-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="circular-checkbox-checkmark">
                          {selectedItems.includes(item.id) && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
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
                    </td>
                    <td className="table-cell">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {item.item_type === "folder" ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 3h5l2 2h5v8H2V3z"
                              fill="currentColor"
                              opacity="0.6"
                            />
                          </svg>
                        ) : (
                          <DocumentRegular
                            style={{ width: "16px", height: "16px" }}
                          />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td className="table-cell">{item.original_location}</td>
                    <td className="table-cell">
                      {formatDate(item.deleted_at)}
                    </td>
                    <td className="table-cell">{formatSize(item.size)}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Empty State */}
      {loading ? (
        <div className="recycle-bin-empty">
          <p className="empty-state-text">Loading...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="recycle-bin-empty">
          <div className="empty-state-icon">
            <img src="/images/image copy.png" alt="Empty recycle bin" />
          </div>
          <p className="empty-state-text">This folder is empty</p>
        </div>
      ) : null}
    </div>
  );
};

export default RecycleBin;
