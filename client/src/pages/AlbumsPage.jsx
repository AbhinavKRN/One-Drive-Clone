import React from "react";
import { AddRegular, SearchRegular } from "@fluentui/react-icons";
import "./AlbumsPage.css";

const AlbumPage = () => {
  return (
    <div className="album-page">
      <h1 className="album-header">Albums</h1>

      <div className="album-hero">
        <div className="album-image-container">
          <img src="/images/imageCopy2.png" alt="Memories" />
        </div>

        <h2 className="album-subtitle">Collect your Best moments</h2>
        <h4 className="album-description">
          Capture, save, and share your moments in albums for lasting memories
        </h4>

        <div className="album-actions">
          <div className="album-action-card">
            <div className="album-action-icon">
              <div className="album-stack-icon">
                <div className="album-card-back"></div>
                <div className="album-card-front"></div>
              </div>
              <AddRegular className="album-icon-plus" />
            </div>
            <div className="album-action-text">
              <span>Create album</span>
            </div>
          </div>
        </div>

        <div className="album-search-container">
          <button className="album-add-btn">
            <AddRegular />
          </button>
          <div className="album-search-bar">
            <SearchRegular />
            <input type="text" placeholder="Search your photos" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
