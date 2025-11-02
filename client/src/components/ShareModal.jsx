import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DismissRegular, CopyRegular, SendRegular, ChevronDownRegular, PersonRegular } from '@fluentui/react-icons'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../config/api'
import Toast from './Toast'
import './Modal.css'
import './ShareModal.css'

const ShareModal = ({ file, onClose, onShareSuccess }) => {
  const { getToken } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [permission, setPermission] = useState('edit') // 'view' or 'edit'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false)
  const [showLinkSettings, setShowLinkSettings] = useState(false)
  const [linkAllowDownload, setLinkAllowDownload] = useState(true)
  const [linkExpiresAt, setLinkExpiresAt] = useState('')
  const [toast, setToast] = useState(null)
  const permissionDropdownRef = useRef(null)
  const linkSettingsRef = useRef(null)

  const createLinkShare = async () => {
    try {
      const token = getToken()
      if (!token) {
        console.error('❌ No auth token available')
        return null
      }

      console.log('🔗 Frontend: Creating share link for file:', file.id)
      const response = await fetch(`${API_BASE_URL}/files/${file.id}/share-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission: permission,
          allow_download: true
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('❌ Create link HTTP error:', response.status, data)
        const errorMsg = data.error || data.message || `Failed to create share link (${response.status})`
        setError(errorMsg)
        throw new Error(errorMsg)
      }
      
      if (data.status === 'success') {
        console.log('✅ Frontend: Share link created successfully:', data.data.share_token)
        // Generate full URL using current origin
        const fullUrl = `${window.location.origin}/shared/${data.data.share_token}`
        const linkData = {
          ...data.data,
          share_url: fullUrl
        }
        setShareLink(linkData)
        setLinkAllowDownload(data.data.allow_download !== false)
        if (data.data.expires_at) {
          setLinkExpiresAt(data.data.expires_at.split('T')[0])
        }
        return linkData
      } else {
        console.error('Create link error:', data.error, data)
        throw new Error(data.error || 'Failed to create share link')
      }
    } catch (error) {
      console.error('Error creating link:', error)
      setError(error.message || 'Failed to create share link')
      setToast({
        message: error.message || 'Failed to create share link',
        type: 'error'
      })
      return null
    }
  }

  // Load existing share link on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken()
        if (!token) return

        // Load share link
        const linkResponse = await fetch(`${API_BASE_URL}/files/${file.id}/share-link`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const linkData = await linkResponse.json()
        
        // Handle errors when loading link
        if (!linkResponse.ok) {
          console.error('Load link HTTP error:', linkResponse.status, linkData)
          // Continue - we'll create link on demand
        } else if (linkData.status === 'success') {
          if (linkData.data.link_enabled) {
            // Generate full URL using current origin
            const fullUrl = `${window.location.origin}/shared/${linkData.data.share_token}`
            const linkDataWithUrl = {
              ...linkData.data,
              share_url: fullUrl
            }
            setShareLink(linkDataWithUrl)
            setPermission(linkData.data.permission || 'edit')
            setLinkAllowDownload(linkData.data.allow_download !== false)
            if (linkData.data.expires_at) {
              setLinkExpiresAt(linkData.data.expires_at.split('T')[0])
            }
          } else {
            // Create link if it doesn't exist
            try {
              await createLinkShare()
            } catch (err) {
              console.error('Auto-create link failed:', err)
              // Continue without link - user can create manually
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    if (file) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, getToken])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (permissionDropdownRef.current && !permissionDropdownRef.current.contains(event.target)) {
        setShowPermissionDropdown(false)
      }
      if (linkSettingsRef.current && !linkSettingsRef.current.contains(event.target)) {
        setShowLinkSettings(false)
      }
    }

    if (showPermissionDropdown || showLinkSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPermissionDropdown, showLinkSettings])


  const handleCopyLink = async () => {
    console.log('📋 Copy link clicked, shareLink:', shareLink)
    let linkToCopy = shareLink
    
    if (!shareLink) {
      console.log('🔗 No existing link, creating new one...')
      setError('') // Clear previous errors
      try {
        linkToCopy = await createLinkShare()
        if (!linkToCopy) {
          console.error('❌ Failed to create link - returned null')
          setError('Failed to create share link. Please try again or check the console for details.')
          return
        }
        console.log('✅ Link created, linkToCopy:', linkToCopy)
      } catch (err) {
        console.error('❌ Create link error:', err)
        const errorMsg = err.message || 'Failed to create share link. Please try again.'
        setError(errorMsg)
        setToast({
          message: errorMsg,
          type: 'error'
        })
        return
      }
    } else {
      console.log('✅ Using existing link:', shareLink.share_url)
    }

    if (linkToCopy?.share_url) {
      try {
        await navigator.clipboard.writeText(linkToCopy.share_url)
        setCopied(true)
        setError('') // Clear any errors on success
        setToast({
          message: 'Share link copied to clipboard!',
          type: 'success'
        })
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy link:', err)
        const errorMsg = 'Failed to copy link to clipboard'
        setError(errorMsg)
        setToast({
          message: errorMsg,
          type: 'error'
        })
      }
    } else {
      const errorMsg = 'No share URL available. Please try creating the link again.'
      setError(errorMsg)
      setToast({
        message: errorMsg,
        type: 'error'
      })
    }
  }

  const handlePermissionChange = async (newPermission) => {
    setPermission(newPermission)
    
    // Update link share immediately
    try {
      const token = getToken()
      if (!token) return

      await fetch(`${API_BASE_URL}/files/${file.id}/share-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission: newPermission,
          allow_download: true
        })
      })
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }


  const linkPermissionText = permission === 'edit' 
    ? 'Anyone with the link can edit.' 
    : 'Anyone with the link can view.'

  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal share-modal onedrive-style" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share "{file.name}"</h2>
          <div className="share-header-actions">
            <button className="btn-icon" onClick={onClose} aria-label="Settings">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                <path d="M9.796 2.343c.18-.36.584-.504.903-.32l.015.007 1.097.548c.302.151.638.157.944.017l.072-.04c.314-.18.708-.036.888.28.18.318.035.722-.28.902l-.013.008-1.097.547a1.44 1.44 0 0 0-.727.79l-.024.09-.278 1.12a.75.75 0 0 1-1.453.356l-.006-.02-.277-1.12a2.94 2.94 0 0 1 1.48-1.617l.013-.008 1.096-.548-.013-.008a.44.44 0 0 0-.222-.24l-.072-.04-1.097-.548.015-.007a.584.584 0 0 0-.294-.32l-.09-.024-1.12-.278a.75.75 0 0 1 .356-1.453l.02.006 1.12.278.09.024zm-3.592 0l.09-.024 1.12-.278a.75.75 0 0 1 .356 1.453l-.02-.006-1.12-.278-.09-.024a.584.584 0 0 0-.294-.32L6.04 2.03l-1.097.548a.44.44 0 0 0-.222.24l-.072.04-.013.008L3.65 3.38l.013.008c.335.189.56.54.584.93l.024.09.278 1.12a.75.75 0 0 1-1.453.356l-.006-.02-.277-1.12a2.94 2.94 0 0 1-.388-1.34l.024-.09L2.4 3.39l-.015-.007a.584.584 0 0 0-.903.32l-.024.09-.278 1.12a.75.75 0 0 1-1.453-.356l.006.02.277 1.12c.144.58.478 1.066.955 1.392l.09.05 1.097.548c.302.151.638.157.944.017l.072-.04.294-.169a.75.75 0 1 1 .75 1.298l-.294.168a2.94 2.94 0 0 1-1.617.48l-.09-.024-1.12-.277a.75.75 0 0 1 .356-1.453l.02.006 1.12.278.09.024zm3.592 11.314l-.09.024-1.12.278a.75.75 0 0 1-.356-1.453l.02.006 1.12.278.09.024c.13.052.24.148.294.32l.024.09 1.097.548a.44.44 0 0 0 .222.24l.072.04.013.008 1.097.548-.013.008a1.44 1.44 0 0 0-.79.727l-.024.09-.278 1.12a.75.75 0 0 1 1.453-.356l.006.02.277 1.12a2.94 2.94 0 0 1 1.48-1.617l.013-.008 1.096-.548-.013-.008a.44.44 0 0 0 .222-.24l.072-.04 1.097-.548-.015-.007a.584.584 0 0 0 .294-.32l.09-.024 1.12-.278a.75.75 0 0 1-.356 1.453l-.02-.006-1.12-.278-.09-.024z"/>
              </svg>
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <DismissRegular />
            </button>
          </div>
        </div>

        <div className="share-modal-body">
          {error && <div className="error-message">{error}</div>}

          <form className="share-form" onSubmit={(e) => { e.preventDefault(); }}>
            {/* Recipient Input with Permission Selector */}
            <div className="share-recipient-input">
              <div className="recipient-input-wrapper">
                <PersonRegular className="input-icon" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Add a name, group, or email"
                  className="recipient-input"
                  disabled={loading}
                />
                <div className="input-divider"></div>
                <div className="permission-selector-inline">
                  <button
                    type="button"
                    className="permission-btn-inline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPermissionDropdown(!showPermissionDropdown)
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M10.896 2.854a.5.5 0 0 1 0 .708L8.207 6.25a.5.5 0 0 1-.708 0L4.104 3.354a.5.5 0 0 1 .708-.708L7.5 5.293l2.688-2.647a.5.5 0 0 1 .708 0z"/>
                      <path d="M2 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    <span>{permission === 'edit' ? 'Can edit' : 'Can view'}</span>
                    <ChevronDownRegular />
                  </button>
                </div>
              </div>
              {showPermissionDropdown && (
                <div className="permission-dropdown" ref={permissionDropdownRef}>
                  <button
                    type="button"
                    className={permission === 'edit' ? 'active' : ''}
                    onClick={() => {
                      handlePermissionChange('edit')
                      setShowPermissionDropdown(false)
                    }}
                  >
                    Can edit
                  </button>
                  <button
                    type="button"
                    className={permission === 'view' ? 'active' : ''}
                    onClick={() => {
                      handlePermissionChange('view')
                      setShowPermissionDropdown(false)
                    }}
                  >
                    Can view
                  </button>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="share-message-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="message-icon">
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zM1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v.817l-7 4.167-7-4.167V3.5zm0 2.233 6.625 3.942L14 5.75v6.75a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5.733z"/>
              </svg>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message"
                className="message-textarea"
                rows="3"
                disabled={loading}
              />
            </div>

            {/* Link Access Info - Clickable with options */}
            <div 
              className="share-link-info clickable"
              onClick={() => setShowLinkSettings(!showLinkSettings)}
            >
              <span className="link-icon">🔒</span>
              <span className="link-text">{linkPermissionText}</span>
              <ChevronDownRegular className="link-chevron" />
            </div>
            
            {/* Link Settings Dropdown */}
            {showLinkSettings && (
              <div className="link-settings-panel" ref={linkSettingsRef}>
                <div className="link-settings-header">Link settings</div>
                
                <div className="link-setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={linkAllowDownload}
                      onChange={(e) => setLinkAllowDownload(e.target.checked)}
                    />
                    <span>Allow download</span>
                  </label>
                </div>
                
                <div className="link-setting-item">
                  <label>
                    Expires (optional):
                    <input
                      type="date"
                      value={linkExpiresAt}
                      onChange={(e) => setLinkExpiresAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="No expiration"
                    />
                  </label>
                  {linkExpiresAt && (
                    <button
                      type="button"
                      className="btn-remove-expiry"
                      onClick={() => setLinkExpiresAt('')}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <button
                  type="button"
                  className="btn-save-link-settings"
                  onClick={async () => {
                    try {
                      const token = getToken()
                      if (!token) return

                      const expiresAt = linkExpiresAt ? new Date(linkExpiresAt).toISOString() : null

                      const response = await fetch(`${API_BASE_URL}/files/${file.id}/share-link`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          permission: permission,
                          expires_at: expiresAt,
                          allow_download: linkAllowDownload
                        })
                      })

                      const data = await response.json()
                      if (data.status === 'success') {
                        const fullUrl = `${window.location.origin}/shared/${data.data.share_token}`
                        setShareLink({
                          ...data.data,
                          share_url: fullUrl
                        })
                        setShowLinkSettings(false)
                        if (onShareSuccess) {
                          onShareSuccess()
                        }
                      } else {
                        setError(data.error || 'Failed to update link settings')
                      }
                    } catch (error) {
                      console.error('Update link settings error:', error)
                      setError('Failed to update link settings')
                    }
                  }}
                >
                  Save
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="share-actions">
              <button
                type="button"
                className="btn-copy-link-outline"
                onClick={handleCopyLink}
                disabled={loading}
              >
                <CopyRegular />
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
              <button
                type="button"
                className="btn-send"
                onClick={() => {
                  if (email.trim()) {
                    setToast({
                      message: `"${file.name}" sent to ${email}`,
                      type: 'success'
                    })
                    // Close modal after a short delay to show the toast
                    setTimeout(() => {
                      onClose()
                    }, 500)
                  } else {
                    setToast({
                      message: `Please enter an email address to send "${file.name}"`,
                      type: 'error'
                    })
                  }
                }}
                disabled={loading}
              >
                <SendRegular />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    {/* Toast Notification - Rendered outside modal using Portal */}
    {toast && createPortal(
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
        duration={3000}
      />,
      document.body
    )}
  </>
  )
}

export default ShareModal
