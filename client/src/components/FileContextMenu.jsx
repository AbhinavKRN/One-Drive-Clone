import React from 'react';
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
        className="file-context-menu"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
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

