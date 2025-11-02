import React, { useEffect, useRef, useState } from 'react';
import {
  ShareRegular,
  LinkRegular,
  DeleteRegular,
  ArrowDownloadRegular,
  FolderArrowUpRegular,
  CopyRegular,
  RenameRegular,
  PanelRightRegular,
} from '@fluentui/react-icons';
import './FileContextMenu.css';

const FileContextMenu = ({
  file,
  position,
  onShare,
  onCopyLink,
  onDelete,
  onDownload,
  onMoveTo,
  onCopyTo,
  onRename,
  onDetails,
  onClose,
}) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!menuRef.current || !position) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Check if menu goes off the right edge
    if (newX + menuRect.width > viewportWidth) {
      newX = viewportWidth - menuRect.width - 10; // 10px padding from edge
    }

    // Check if menu goes off the left edge
    if (newX < 10) {
      newX = 10;
    }

    // Check if menu goes off the bottom edge
    if (newY + menuRect.height > viewportHeight) {
      // Position above the trigger point instead
      newY = position.y - menuRect.height - 8; // 8px gap above
      
      // If it still goes off the top, position at the top with padding
      if (newY < 10) {
        newY = 10;
      }
    }

    // Check if menu goes off the top edge
    if (newY < 10) {
      newY = 10;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position]);

  if (!file || !position) return null;

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop to close menu */}
      <div className="context-menu-backdrop" onClick={onClose} />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="file-context-menu"
        style={{
          top: `${adjustedPosition.y}px`,
          left: `${adjustedPosition.x}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="context-menu-item" onClick={() => handleAction(onShare)}>
          <ShareRegular className="context-menu-icon" />
          <span>Share</span>
        </div>

        <div className="context-menu-item" onClick={() => handleAction(onCopyLink)}>
          <LinkRegular className="context-menu-icon" />
          <span>Copy link</span>
        </div>

        <div className="context-menu-separator" />

        {file.type !== 'folder' && (
          <div className="context-menu-item" onClick={() => handleAction(onDownload)}>
            <ArrowDownloadRegular className="context-menu-icon" />
            <span>Download</span>
          </div>
        )}

        <div className="context-menu-item" onClick={() => handleAction(onDelete)}>
          <DeleteRegular className="context-menu-icon" />
          <span>Delete</span>
        </div>

        <div className="context-menu-separator" />

        <div className="context-menu-item" onClick={() => handleAction(onMoveTo)}>
          <FolderArrowUpRegular className="context-menu-icon" />
          <span>Move to</span>
        </div>

        <div className="context-menu-item" onClick={() => handleAction(onCopyTo)}>
          <CopyRegular className="context-menu-icon" />
          <span>Copy to</span>
        </div>

        <div className="context-menu-item" onClick={() => handleAction(onRename)}>
          <RenameRegular className="context-menu-icon" />
          <span>Rename</span>
        </div>

        <div className="context-menu-separator" />

        <div className="context-menu-item" onClick={() => handleAction(onDetails)}>
          <PanelRightRegular className="context-menu-icon" />
          <span>Details</span>
        </div>
      </div>
    </>
  );
};

export default FileContextMenu;

