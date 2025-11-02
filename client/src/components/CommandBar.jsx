import React from 'react';
import {
  ShareRegular,
  LinkRegular,
  DeleteRegular,
  ArrowDownloadRegular,
  FolderArrowUpRegular,
  CopyRegular,
  RenameRegular,
  ArrowSortRegular,
  PanelRightRegular,
  DismissRegular,
  ChevronDownRegular
} from '@fluentui/react-icons';
import './CommandBar.css';

const CommandBar = ({
  selectedCount,
  onShare,
  onCopyLink,
  onDelete,
  onDownload,
  onMoveTo,
  onCopyTo,
  onRename,
  onClearSelection,
  onSort,
  onDetails,
  showSortMenu,
  onSortMenuToggle
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="command-bar-container">
      <div className="command-bar-wrapper">
        <div className="command-bar">
          {/* Primary Actions */}
          <div className="command-bar-primary">
            <button className="command-bar-btn" onClick={onShare} title="Share">
              <ShareRegular />
              <span>Share</span>
            </button>

            <button className="command-bar-btn" onClick={onCopyLink} title="Copy link">
              <LinkRegular />
              <span>Copy link</span>
            </button>

            <button className="command-bar-btn" onClick={onDelete} title="Delete">
              <DeleteRegular />
              <span>Delete</span>
            </button>

            <button className="command-bar-btn" onClick={onDownload} title="Download">
              <ArrowDownloadRegular />
              <span>Download</span>
            </button>

            <button className="command-bar-btn" onClick={onMoveTo} title="Move to">
              <FolderArrowUpRegular />
              <span>Move to</span>
            </button>

            <button className="command-bar-btn" onClick={onCopyTo} title="Copy to">
              <CopyRegular />
              <span>Copy to</span>
            </button>

            {selectedCount === 1 && (
              <button className="command-bar-btn" onClick={onRename} title="Rename">
                <RenameRegular />
                <span>Rename</span>
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="command-bar-secondary">
            <div className="sort-dropdown-wrapper">
              <button
                className="command-bar-btn"
                onClick={onSortMenuToggle}
                title="Sort all items by"
              >
                <ArrowSortRegular />
                <span>Sort</span>
                <ChevronDownRegular className="chevron-icon" />
              </button>
            </div>

            <button
              className="command-bar-btn selection-btn"
              onClick={onClearSelection}
              title="Clear selection"
            >
              <DismissRegular />
              <span>{selectedCount} selected</span>
            </button>

            <button className="command-bar-btn" onClick={onDetails} title="Open the details pane">
              <PanelRightRegular />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;
