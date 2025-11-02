import React from "react";
import { AddRegular, SearchRegular, PhoneRegular } from "@fluentui/react-icons";
import "./FavouritesPage.css";

const FavouritesPage = () => {
  return (
    <div className="favs-page">
      <h1 className="favs-header">Favourites</h1>
      <div className="favs-hero">

        <div className="favs-stack">
          <img src="/images/image_copy2.png" alt="Memories" />
        </div>
        <div>
          <h2 className="favs-no-text">No favourite Yet</h2>
          <h4>mark photos and videos as favourite to see them here</h4>
        </div>
      </div>

      <div className="favs-search-container">
        <button className="favs-add-btn">
          <AddRegular />
        </button>
        <div className="favs-search-bar">
          <SearchRegular />
          <input type="text" placeholder="Search your photos" />
        </div>
      </div>
    </div>
  );
};

export default FavouritesPage;
