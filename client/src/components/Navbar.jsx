import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  SearchRegular,
  SettingsRegular,
  GlobeRegular
} from '@fluentui/react-icons'
import './Navbar.css'

const Navbar = ({ user, searchQuery, onSearchChange }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
        <img src="/images/onedrive-logo.png" alt="OneDrive" className="onedrive-logo" />
        <div className="navbar-tabs">
          <button className="navbar-tab">Photos</button>
          <button className="navbar-tab active">Files</button>
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
        <div className="user-avatar" title={user?.name}>
          {user?.name?.charAt(0).toUpperCase()}{user?.name?.charAt(1)?.toUpperCase() || ''}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
