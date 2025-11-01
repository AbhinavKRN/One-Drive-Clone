import React, { createContext, useContext, useState, useEffect } from 'react'
import API_BASE_URL from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token')
    const loggedInUser = localStorage.getItem('currentUser')
    
    if (token && loggedInUser) {
      setUser(JSON.parse(loggedInUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        const { user: userData, token } = data.data
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('token', token)
        localStorage.setItem('currentUser', JSON.stringify(userData))
        return { success: true }
      } else {
        return { success: false, message: data.error || 'Invalid email or password' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Failed to connect to server' }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        const { user: userData, token } = data.data
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('token', token)
        localStorage.setItem('currentUser', JSON.stringify(userData))
        return { success: true }
      } else {
        return { success: false, message: data.error || 'Failed to create account' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Failed to connect to server' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }

  // Get auth token for API requests
  const getToken = () => {
    return localStorage.getItem('token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
