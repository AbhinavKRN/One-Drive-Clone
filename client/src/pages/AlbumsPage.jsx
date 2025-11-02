import React from "react";
import { AddRegular, SearchRegular, PhoneRegular } from "@fluentui/react-icons";
import "./AlbumsPage.css";

const AlbumPage = () => {
  return (
    <div className="photos-page">
      <h1 className="header">Albums</h1>
      <div className="photos-hero">
        <div className="photos-stack">
          <img src="/images/imageCopy2.png" alt="Memories" />
        </div>
        <h2 className="no-favourites-text">Collect your Best moments</h2>
        <h4>
          Captture, save, and share your moments in album for lasting memories
        </h4>

        <div className="photos-actions">
          <div className="action-card">
            <div className="action-icon phone-icon">
              <PhoneRegular />
            </div>
            <div className="action-text">
              <span>Create Album</span>
            </div>
          </div>
        </div>
      </div>

      <div className="photos-search-container">
        <button className="add-photo-btn">
          <AddRegular />
        </button>
        <div className="photos-search-bar">
          <SearchRegular />
          <input type="text" placeholder="Search your photos" />
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
