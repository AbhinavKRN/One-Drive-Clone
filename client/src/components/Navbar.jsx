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
  const [showAppsLauncher, setShowAppsLauncher] = useState(false);
  const [appsSearchQuery, setAppsSearchQuery] = useState("");
  const profilePopupRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const appsLauncherRef = useRef(null);
  const appsButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const avatarRef = useRef(null);
  const [darkThemeForPhotos, setDarkThemeForPhotos] = useState(false);

  const allApps = [
    {
      name: "Microsoft 365 Copilot",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/M365_24x_da036bc4.svg",
    },
    {
      name: "Outlook",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/outlook_24x1_16f15926.svg",
    },
    {
      name: "OneDrive",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/onedrive_24x1_3dca28ce.svg",
    },
    {
      name: "Teams",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/teams_24x1_737122d8.svg",
    },
    {
      name: "Word",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/word_24x1_4f14d4f1.svg",
    },
    {
      name: "Excel",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/excel_24x1_ef67616b.svg",
    },
    {
      name: "PowerPoint",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/powerpoint_24x1_088c0a01.svg",
    },
    {
      name: "OneNote",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/onenote_24x1_917c6a51.svg",
    },
    {
      name: "To Do",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/todo_24x1_22d5b93f.svg",
    },
    {
      name: "Family Safety",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/FamilySafety_24x_449a71b9.svg",
    },
    {
      name: "Calendar",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/Calendar_24x_e50a5ecb.svg",
    },
    {
      name: "Clipchamp",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/clipchamp_24x1_2eb14be3.svg",
    },
    {
      name: "Designer",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/Designer_24x_ac7eb4e6.svg",
    },
    {
      name: "Skype",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/Skype_24x_905a0e94.svg",
    },
    {
      name: "More apps",
      icon: "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/MoreAppsDark_50f3694f.svg",
    },
  ];

  const filteredApps = allApps.filter((app) =>
    app.name.toLowerCase().includes(appsSearchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfilePopup(false);
  };

  useEffect(() => {
    if (location.pathname.includes("photos")) setActiveTab("Photos");
    else setActiveTab("Files");
  }, [location, setActiveTab]);

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
      if (
        appsLauncherRef.current &&
        !appsLauncherRef.current.contains(event.target) &&
        appsButtonRef.current &&
        !appsButtonRef.current.contains(event.target)
      ) {
        setShowAppsLauncher(false);
      }
    };
    if (showProfilePopup || showSettingsDropdown || showAppsLauncher)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePopup, showSettingsDropdown, showAppsLauncher]);

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
        <button
          ref={appsButtonRef}
          className="navbar-icon-btn apps-icon"
          title="Apps"
          onClick={() => setShowAppsLauncher(!showAppsLauncher)}
        >
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

        {showAppsLauncher && (
          <div ref={appsLauncherRef} className="apps-launcher">
            {/* Search Bar */}
            <div className="apps-search-container">
              <div className="apps-search-bar">
                <div className="apps-search-icon">
                  <svg
                    fill="currentColor"
                    aria-hidden="true"
                    width="1em"
                    height="1em"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.73 13.44a6.5 6.5 0 1 1 .7-.7l3.42 3.4a.5.5 0 0 1-.63.77l-.07-.06-3.42-3.41Zm-.71-.71A5.54 5.54 0 0 0 14 8.5a5.5 5.5 0 1 0-1.98 4.23Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Find Microsoft 365 apps"
                  className="apps-search-input"
                  value={appsSearchQuery}
                  onChange={(e) => setAppsSearchQuery(e.target.value)}
                />
                {appsSearchQuery && (
                  <button
                    className="apps-search-clear"
                    aria-label="clear"
                    onClick={() => setAppsSearchQuery("")}
                    tabIndex={-1}
                  >
                    <svg
                      fill="currentColor"
                      aria-hidden="true"
                      width="1em"
                      height="1em"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m4.09 4.22.06-.07a.5.5 0 0 1 .63-.06l.07.06L10 9.29l5.15-5.14a.5.5 0 0 1 .63-.06l.07.06c.18.17.2.44.06.63l-.06.07L10.71 10l5.14 5.15c.18.17.2.44.06.63l-.06.07a.5.5 0 0 1-.63.06l-.07-.06L10 10.71l-5.15 5.14a.5.5 0 0 1-.63.06l-.07-.06a.5.5 0 0 1-.06-.63l.06-.07L9.29 10 4.15 4.85a.5.5 0 0 1-.06-.63l.06-.07-.06.07Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Apps Grid */}
            <div className="apps-grid-wrapper">
              <div className="apps-grid">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app, index) => (
                    <a
                      key={index}
                      href="#"
                      className="app-item"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="app-icon-container">
                        <img
                          src={app.icon}
                          className="app-icon-img"
                          alt={app.name}
                        />
                      </div>
                      <span className="app-label">{app.name}</span>
                    </a>
                  ))
                ) : (
                  <div className="no-results">No apps found</div>
                )}
              </div>
            </div>
            {/* Separator */}
            <div className="apps-separator"></div>

            {/* Document Creation */}
            <div className="apps-create-wrapper">
              <div className="apps-create-section">
                <a
                  href="#"
                  className="app-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="app-icon-container">
                    <img
                      src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/word_24x1_4f14d4f1.svg"
                      className="app-icon-img"
                      alt="Document"
                    />
                  </div>
                  <span className="app-label">Document</span>
                </a>
                <a
                  href="#"
                  className="app-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="app-icon-container">
                    <img
                      src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/excel_24x1_ef67616b.svg"
                      className="app-icon-img"
                      alt="Workbook"
                    />
                  </div>
                  <span className="app-label">Workbook</span>
                </a>
                <a
                  href="#"
                  className="app-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="app-icon-container">
                    <img
                      src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/powerpoint_24x1_088c0a01.svg"
                      className="app-icon-img"
                      alt="Presentation"
                    />
                  </div>
                  <span className="app-label">Presentation</span>
                </a>
                <a
                  href="#"
                  className="app-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="app-icon-container">
                    <img
                      src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/forms_24x1_7713cded.svg"
                      className="app-icon-img"
                      alt="Survey"
                    />
                  </div>
                  <span className="app-label">Survey</span>
                </a>
                <a
                  href="#"
                  className="app-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="app-icon-container">
                    <img
                      src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/CreateMore_f4049e25.svg"
                      className="app-icon-img"
                      alt="Create more"
                    />
                  </div>
                  <span className="app-label">Create more</span>
                </a>
              </div>
            </div>
          </div>
        )}

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
                {storageUsedFormatted} used of {storageTotalFormatted} (
                {storagePercent}%)
              </div>
              <div className="settings-storage-bar">
                <div
                  className="settings-storage-bar-fill"
                  style={{
                    width: `${Math.max(1, Math.min(storagePercentage, 100))}%`,
                  }}
                ></div>
              </div>
              <div className="settings-storage-links">
                <button className="settings-link">Manage</button>
                <span className="settings-link-separator">|</span>
                <button className="settings-link">Buy storage</button>
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
              <div className="settings-divider"></div>

              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  checked={darkThemeForPhotos}
                  onChange={(e) => setDarkThemeForPhotos(e.target.checked)}
                />
                <span>Always use dark theme for photos</span>
              </label>
              <div className="settings-actions-section">
                <button className="settings-action-item">
                  <SettingsRegular className="settings-action-icon" />

                  <span>Settings</span>
                </button>

                <button className="settings-action-item">
                  <QuestionCircleRegular className="settings-action-icon" />

                  <span>Help</span>
                </button>

                <button className="settings-action-item">
                  <PersonFeedbackRegular className="settings-action-icon" />

                  <span>Submit feedback</span>
                </button>
              </div>
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
              <div className="profile-picture-placeholder">
                {getUserInitials()}
              </div>
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
