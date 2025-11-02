import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && ['Light', 'Dark', 'System'].includes(savedTheme)) {
      return savedTheme
    }
    return 'Light'
  })

  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Determine actual dark mode state based on theme setting
    const updateDarkMode = () => {
      if (theme === 'Dark') {
        setIsDarkMode(true)
        document.documentElement.classList.add('dark-theme')
        document.documentElement.classList.remove('light-theme')
      } else if (theme === 'Light') {
        setIsDarkMode(false)
        document.documentElement.classList.remove('dark-theme')
        document.documentElement.classList.add('light-theme')
      } else if (theme === 'System') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
        if (prefersDark) {
          document.documentElement.classList.add('dark-theme')
          document.documentElement.classList.remove('light-theme')
        } else {
          document.documentElement.classList.remove('dark-theme')
          document.documentElement.classList.add('light-theme')
        }
      }
    }

    updateDarkMode()

    // Listen for system theme changes if using System theme
    if (theme === 'System' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateDarkMode()
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } 
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [theme])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

