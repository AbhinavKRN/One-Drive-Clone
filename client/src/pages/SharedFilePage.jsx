import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api'
import FilePreview from '../components/FilePreview'
import './SharedFilePage.css'

const SharedFilePage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSharedFile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/files/shared/${token}`)
        const data = await response.json()

        if (data.status === 'success') {
          setFileData(data.data)
        } else {
          setError(data.error || 'File not found')
        }
      } catch (err) {
        console.error('Error loading shared file:', err)
        setError('Failed to load shared file')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadSharedFile()
    }
  }, [token])

  const handleDownload = async () => {
    if (!fileData?.file?.id) return

    try {
      // Note: This would need a special endpoint for downloading via token
      // For now, redirect to login
      navigate('/login')
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (loading) {
    return (
      <div className="shared-file-page">
        <div className="shared-file-loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-file-page">
        <div className="shared-file-error">
          <h2>File Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    )
  }

  if (!fileData?.file) {
    return (
      <div className="shared-file-page">
        <div className="shared-file-error">
          <h2>File Not Available</h2>
          <p>The file you're looking for is no longer available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-file-page">
      <FilePreview
        file={fileData.file}
        onClose={() => navigate('/login')}
        onDownload={fileData.allow_download ? handleDownload : null}
      />
    </div>
  )
}

export default SharedFilePage

