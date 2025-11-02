import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SearchRegular,
  SettingsRegular,
  GlobeRegular,
  PersonAddRegular,
  StarRegular,
  ImageRegular,
  AlbumRegular,
  ClockRegular,
} from "@fluentui/react-icons";
import "./Navbar.css";

const Navbar = ({
  user,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef(null);
  const avatarRef = useRef(null);
  const [photoTab, setPhotoTab] = useState("Moments");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfilePopup(false);
  };

  useEffect(() => {
    if (location.pathname.includes("photos")) setActiveTab("Photos");
    else setActiveTab("Files");
  }, [location]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleAvatarClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowProfilePopup(false);
      }
    };
    if (showProfilePopup)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePopup]);

  const getUserInitials = () => {
    if (!user?.name) return "";
    const parts = user.name.split(" ");
    if (parts.length >= 2)
      return (
        parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      );
    return user.name.charAt(0).toUpperCase();
  };

  const getFormattedName = () => {
    if (!user?.name) return "";
    return user.name.toUpperCase();
  };

  return (
    <nav className={`navbar ${activeTab === "Photos" ? "photos-mode" : ""}`}>
      <div className="navbar-left">
        <button className="navbar-icon-btn apps-icon" title="Apps">
          <div className="logo-grid">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="logo-dot"></div>
              ))}
          </div>
        </button>

        <img
          src="/images/onedrive-logo.png"
          alt="OneDrive"
          className="onedrive-logo"
        />

        <div className="navbar-tabs">
          <button
            className={`navbar-tab ${activeTab === "Photos" ? "active" : ""}`}
            onClick={() => handleTabClick("Photos")}
          >
            Photos
          </button>
          <button
            className={`navbar-tab ${activeTab === "Files" ? "active" : ""}`}
            onClick={() => handleTabClick("Files")}
          >
            Files
          </button>
          <div
            className={`tab-slider ${
              activeTab === "Files" ? "move-right" : "move-left"
            }`}
          ></div>
        </div>
      </div>

      {/* When Photos is active, hide search bar and show 4 buttons */}
      {activeTab === "Files" ? (
        <div className="navbar-center">
          <div className="search-bar">
            <SearchRegular />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="photos-nav">
          <button
            className={`photos-nav-item ${
              photoTab === "Moments" ? "active" : ""
            }`}
            onClick={() => setPhotoTab("Moments")}
          >
            <ClockRegular />
            <span>Moments</span>
          </button>
          <button
            className={`photos-nav-item ${
              photoTab === "Gallery" ? "active" : ""
            }`}
            onClick={() => setPhotoTab("Gallery")}
          >
            <ImageRegular />
            <span>Gallery</span>
          </button>
          <button
            className={`photos-nav-item ${
              photoTab === "Albums" ? "active" : ""
            }`}
            onClick={() => setPhotoTab("Albums")}
          >
            <AlbumRegular />
            <span>Albums</span>
          </button>
          <button
            className={`photos-nav-item ${
              photoTab === "Favorites" ? "active" : ""
            }`}
            onClick={() => setPhotoTab("Favorites")}
          >
            <StarRegular />
            <span>Favorites</span>
          </button>
        </div>
      )}

      <div className="navbar-right">
        <button className="navbar-storage-btn">
          <GlobeRegular />
          <span>Get more storage</span>
        </button>
        <button className="navbar-icon-btn" title="Settings">
          <SettingsRegular />
        </button>
        <div
          ref={avatarRef}
          className="user-avatar"
          title={user?.name}
          onClick={handleAvatarClick}
        >
          {getUserInitials()}
        </div>

        {showProfilePopup && (
          <div ref={profilePopupRef} className="profile-popup">
            <div className="profile-popup-header">
              <div className="profile-popup-logo">
                <div className="microsoft-logo-grid">
                  <div className="microsoft-square microsoft-red"></div>
                  <div className="microsoft-square microsoft-green"></div>
                  <div className="microsoft-square microsoft-blue"></div>
                  <div className="microsoft-square microsoft-yellow"></div>
                </div>
                <span className="microsoft-text">Microsoft</span>
              </div>
              <button className="profile-popup-signout" onClick={handleLogout}>
                Sign out
              </button>
            </div>

            <div className="profile-popup-content">
              <div className="profile-picture-placeholder">
                {getUserInitials()}
              </div>
              <div className="profile-user-info">
                <div className="profile-user-name">{getFormattedName()}</div>
                <div className="profile-user-email">{user?.email || ""}</div>
                <a
                  href="#"
                  className="profile-view-account"
                  onClick={(e) => e.preventDefault()}
                >
                  View account
                </a>
              </div>
            </div>

            <div className="profile-popup-footer">
              <div className="profile-add-account-icon">
                <PersonAddRegular />
              </div>
              <span className="profile-add-account-text">
                Sign in with a different account
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
