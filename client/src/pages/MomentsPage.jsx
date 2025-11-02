import React from "react";
import { AddRegular, SearchRegular, PhoneRegular } from "@fluentui/react-icons";
import "./PhotosPage.css";

const MomentsPage = () => {
  return (
    <div className="photos-page">
      <div className="photos-hero">
        <h2 className="h2">Explore Highlights From Your photo Collection</h2>
        <h4 className="h4">Add photos to relieve specila times , revisit favourite places , and celebrate what matters most </h4>
        <div className="photos-stack">
          <img src="/images/img2Hackathon.png" alt="Memories" />
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

export default MomentsPage;
