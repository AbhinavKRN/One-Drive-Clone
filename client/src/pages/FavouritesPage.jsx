import React from "react";
import { AddRegular, SearchRegular, PhoneRegular } from "@fluentui/react-icons";
import "./FavouritesPage.css";

const FavouritesPage = () => {
  return (
    <div className="photos-page">
      <h1 className="header">Favourites</h1>
      <div className="photos-hero">

        <div className="photos-stack">
          <img src="/images/image_copy2.png" alt="Memories" />
        </div>
        <div >
          <h2 className="no-favourites-text">No favourite Yet</h2>
          <h4>mark photos and videos as favourite to see them here</h4>
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

export default FavouritesPage;
