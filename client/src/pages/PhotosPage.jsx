import React from "react";
import { AddRegular, SearchRegular, PhoneRegular } from "@fluentui/react-icons";
import "./PhotosPage.css";

const PhotosPage = () => {
  return (
    <div className="photos-page">
      <div className="photos-hero">
        <h1>Keep your memories safe with OneDrive</h1>

        <div className="photos-stack">
          <img src="/images/background.png" alt="Memories" />
        </div>

        <div className="photos-actions">
          <div className="action-card">
            <div className="action-icon upload-icon">
              <AddRegular />
            </div>
            <div className="action-text">
              <p>Add photos here</p>
              <button className="action-link" onClick={() => {}}>
                Upload from your device
              </button>
            </div>
          </div>

          <div className="action-card">
            <div className="action-icon phone-icon">
              <PhoneRegular />
            </div>
            <div className="action-text">
              <p>Back up phone photos</p>
              <button className="action-link" onClick={() => {}}>
                Get the mobile app
              </button>
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

export default PhotosPage;
