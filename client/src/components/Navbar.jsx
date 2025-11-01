import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
        <div className="navbar-brand">
          <i className="fas fa-cloud"></i>
          <span>OneDrive</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search in OneDrive"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="user-name">{user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
