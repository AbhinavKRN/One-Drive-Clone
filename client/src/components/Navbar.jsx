import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SearchRegular,
  SettingsRegular,
  GlobeRegular,
  PersonAddRegular,
} from "@fluentui/react-icons";
import "./Navbar.css";
import { useLocation } from "react-router-dom";

const Navbar = ({ user, searchQuery, onSearchChange , activeTab  , setActiveTab}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // const [activeTab, setActiveTab] = useState("Files");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef(null);
  const avatarRef = useRef(null);

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

  // Close popup when clicking outside
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

    if (showProfilePopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfilePopup]);

  // Get user initials for profile picture
  const getUserInitials = () => {
    if (!user?.name) return "";
    const parts = user.name.split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      );
    }
    return user.name.charAt(0).toUpperCase();
  };

  // Format name to uppercase
  const getFormattedName = () => {
    if (!user?.name) return "";
    return user.name.toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-icon-btn apps-icon" title="Apps">
          <div className="logo-grid">
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
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
                <img src="/images/Microsoft.png" alt="Microsoft" />
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
