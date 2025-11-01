import React, { createContext, useContext, useState, useEffect } from 'react'

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

  useEffect(() => {
    // Check if user is logged in on mount
    const loggedInUser = localStorage.getItem('currentUser')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === email && u.password === password)

    if (user) {
      const userWithoutPassword = { email: user.email, name: user.name }
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const signup = (name, email, password) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]')

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' }
    }

    // Add new user
    const newUser = { name, email, password }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    // Auto login after signup
    const userWithoutPassword = { email, name }
    setUser(userWithoutPassword)
    setIsAuthenticated(true)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUser')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
