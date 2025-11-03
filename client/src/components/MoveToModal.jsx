import React, { useState, useEffect } from 'react';
import {
  FolderRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  DismissRegular,
  HomeRegular,
  CheckmarkRegular
} from '@fluentui/react-icons';
import './MoveToModal.css';

const MoveToModal = ({ 
  onClose, 
  onMove, 
  folders = [], 
  selectedItems = [],
  currentFolderId = null 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // Build folder hierarchy
  const buildFolderTree = (folders, parentId = null) => {
    return folders
      .filter(folder => folder.parent_id === parentId || folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folders, folder.id)
      }));
  };

  const folderTree = buildFolderTree(folders);

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Check if a folder is disabled (can't move to itself or its children)
  const isFolderDisabled = (folderId) => {
    // Can't move to current location
    if (folderId === currentFolderId) return true;
    
    // Can't move folder into itself or its children
    if (selectedItems.length === 1) {
      const selectedItem = [...folders].find(f => 
        selectedItems.includes(f.id)
      );
      
      if (selectedItem && selectedItem.type === 'folder') {
        // Check if target is the selected folder or a child of it
        const isChildOf = (targetId, parentId) => {
          const folder = folders.find(f => f.id === targetId);
          if (!folder) return false;
          if (folder.parent_id === parentId || folder.parentId === parentId) return true;
          if (folder.parent_id || folder.parentId) {
            return isChildOf(folder.parent_id || folder.parentId, parentId);
          }
          return false;
        };
        
        if (folderId === selectedItem.id || isChildOf(folderId, selectedItem.id)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Handle move action
  const handleMove = async () => {
    if (selectedDestination === undefined || selectedDestination === null) {
      return;
    }

    setIsMoving(true);
    try {
      await onMove(selectedItems, selectedDestination);
      onClose();
    } catch (error) {
      console.error('Move error:', error);
      setIsMoving(false);
    }
  };

  // Render folder tree recursively
  const renderFolderTree = (folders, level = 0) => {
    return folders.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasChildren = folder.children && folder.children.length > 0;
      const isDisabled = isFolderDisabled(folder.id);
      const isSelected = selectedDestination === folder.id;

      return (
        <div key={folder.id} className="folder-tree-item">
          <div 
            className={`folder-row ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => !isDisabled && setSelectedDestination(folder.id)}
          >
            {hasChildren ? (
              <button
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                disabled={isDisabled}
              >
                {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
              </button>
            ) : (
              <span className="expand-placeholder" />
            )}
            
            <FolderRegular className="folder-icon" />
            <span className="folder-name">{folder.name}</span>
            
            {isSelected && (
              <CheckmarkRegular className="checkmark-icon" />
            )}
          </div>

          {isExpanded && hasChildren && (
            <div className="folder-children">
              {renderFolderTree(folder.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="move-to-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Move to</h2>
          <button className="close-btn" onClick={onClose}>
            <DismissRegular />
          </button>
        </div>

        <div className="modal-body">
          <div className="destination-info">
            <p className="info-text">
              Choose a location to move {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="folder-tree-container">
            {/* Root / My Files option */}
            <div 
              className={`folder-row root-folder ${selectedDestination === null ? 'selected' : ''} ${currentFolderId === null ? 'disabled' : ''}`}
              onClick={() => currentFolderId !== null && setSelectedDestination(null)}
            >
              <span className="expand-placeholder" />
              <HomeRegular className="folder-icon" />
              <span className="folder-name">My Files</span>
              {selectedDestination === null && (
                <CheckmarkRegular className="checkmark-icon" />
              )}
            </div>

            {/* Folder tree */}
            {folderTree.length > 0 ? (
              renderFolderTree(folderTree)
            ) : (
              <div className="empty-folders">
                <p>No folders available</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isMoving}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleMove}
            disabled={selectedDestination === undefined || isMoving}
          >
            {isMoving ? 'Moving...' : 'Move here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToModal;

