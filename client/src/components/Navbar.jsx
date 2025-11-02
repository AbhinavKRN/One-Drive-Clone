import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  SearchRegular,
  SettingsRegular,
  GlobeRegular,
  PersonAddRegular,
  StarRegular,
  ImageRegular,
  AlbumRegular,
  ClockRegular,
  ChevronDownRegular,
  QuestionCircleRegular,
  PersonFeedbackRegular,
} from "@fluentui/react-icons";
import "./Navbar.css";

const Navbar = ({
  user,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab,
  storageUsed = 0,
  storageTotal = 5 * 1024 * 1024 * 1024,
  photoTab,
  setPhotoTab,
}) => {
  const { logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const profilePopupRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const avatarRef = useRef(null);
  const [darkThemeForPhotos, setDarkThemeForPhotos] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfilePopup(false);
  };

  useEffect(() => {
    if (location.pathname.includes("photos")) setActiveTab("Photos");
    else setActiveTab("Files");
  }, [location]);

  const handleTabClick = (tab) => setActiveTab(tab);
  const handleAvatarClick = () => setShowProfilePopup(!showProfilePopup);

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
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setShowSettingsDropdown(false);
      }
    };
    if (showProfilePopup || showSettingsDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePopup, showSettingsDropdown]);

  const getUserInitials = () => {
    if (!user?.name) return "";
    const parts = user.name.split(" ");
    if (parts.length >= 2)
      return (
        parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      );
    return user.name.charAt(0).toUpperCase();
  };

  const getFormattedName = () => (user?.name || "").toUpperCase();

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    if (size < 0.1 && i >= 2) {
      return `< 0.1 ${sizes[i]}`;
    }
    return Math.round(size * 10) / 10 + " " + sizes[i];
  };

  const storagePercentage = (storageUsed / storageTotal) * 100;
  const storageUsedFormatted = formatBytes(storageUsed);
  const storageTotalFormatted = formatBytes(storageTotal);
  const storagePercent = Math.max(1, Math.round(storagePercentage));

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
    if (showProfilePopup) setShowProfilePopup(false);
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

      {/* Photos sub-tabs */}
      {activeTab === "Photos" ? (
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
            className={`photos-nav-item ${photoTab === "Gallery" ? "active" : ""}`}
            onClick={() => setPhotoTab("Gallery")}
          >
            <ImageRegular />
            <span>Gallery</span>
          </button>
          <button
            className={`photos-nav-item ${photoTab === "Albums" ? "active" : ""}`}
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
      ) : (
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
      )}

      {/* Right side */}
      <div className="navbar-right">
        <button className="navbar-storage-btn">
          <GlobeRegular />
          <span>Get more storage</span>
        </button>
        <button
          ref={settingsButtonRef}
          className="navbar-icon-btn"
          title="Settings"
          onClick={handleSettingsClick}
        >
          <SettingsRegular />
        </button>

        {showSettingsDropdown && (
          <div ref={settingsDropdownRef} className="settings-dropdown">
            <div className="settings-storage-section">
              <div className="settings-storage-text">
                {storageUsedFormatted} used of {storageTotalFormatted} ({storagePercent}%)
              </div>
              <div className="settings-storage-bar">
                <div
                  className="settings-storage-bar-fill"
                  style={{
                    width: `${Math.max(1, Math.min(storagePercentage, 100))}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="settings-divider"></div>
            <div className="settings-theme-section">
              <div className="settings-theme-row">
                <label className="settings-theme-label">Theme</label>
                <select
                  className="settings-select"
                  value={theme}
                  onChange={(e) => changeTheme(e.target.value)}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System</option>
                </select>
              </div>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  checked={darkThemeForPhotos}
                  onChange={(e) => setDarkThemeForPhotos(e.target.checked)}
                />
                <span>Always use dark theme for photos</span>
              </label>
            </div>
          </div>
        )}

        <div
          ref={avatarRef}
          className="user-avatar"
          title={user?.name}
          onClick={() => setShowProfilePopup(!showProfilePopup)}
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
              <div className="profile-picture-placeholder">{getUserInitials()}</div>
              <div className="profile-user-info">
                <div className="profile-user-name">{getFormattedName()}</div>
                <div className="profile-user-email">{user?.email || ""}</div>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  View account
                </a>
              </div>
            </div>

            <div className="profile-popup-footer">
              <PersonAddRegular />
              <span>Sign in with a different account</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
