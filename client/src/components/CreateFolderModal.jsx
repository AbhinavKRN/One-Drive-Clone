import React, { useState } from 'react'
import './Modal.css'

const CreateFolderModal = ({ onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!folderName.trim()) {
      setError('Please enter a folder name')
      return
    }

    if (folderName.includes('/') || folderName.includes('\\')) {
      setError('Folder name cannot contain / or \\')
      return
    }

    onCreate(folderName.trim())
  }

  return (
    <div className="modal-overlay create-folder-overlay" onClick={onClose}>
      <div className="modal create-folder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a folder</h2>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="f"
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFolderModal
