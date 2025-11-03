import React from "react";
import { DismissRegular } from "@fluentui/react-icons";
import "./FileDetailsPanel.css";

const FileDetailsPanel = ({ file, onClose }) => {
  if (!file) return null;

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
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get file type label
  const getFileType = (file) => {
    if (file.item_type === "folder" || file.type === "folder") {
      return "Folder";
    }

    const extension = file.name.split(".").pop().toUpperCase();
    return `${extension} File`;
  };

  return (
    <div className="file-details-panel">
      <div className="details-panel-header">
        <button className="details-close-btn" onClick={onClose} title="Close">
          <DismissRegular />
        </button>
        <h2 className="details-panel-title">More details</h2>
      </div>

      <div className="details-panel-content">
        <div className="details-section">
          <div className="detail-item">
            <span className="detail-value file-type-value">{getFileType(file)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Modified</span>
            <span className="detail-value">
              {formatDate(file.deleted_at || file.modified || file.updated_at || file.created_at)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Path</span>
            <span className="detail-value path-value">
              {file.original_location || file.folder_path || file.path || "My files"} › {file.name}
            </span>
          </div>

          {file.item_type !== "folder" && file.type !== "folder" && (
            <div className="detail-item">
              <span className="detail-label">Size</span>
              <span className="detail-value">{formatSize(file.size || 0)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetailsPanel;
