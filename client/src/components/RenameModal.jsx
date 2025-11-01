import React, { useState } from 'react'
import './Modal.css'

const RenameModal = ({ item, onClose, onRename }) => {
  const [newName, setNewName] = useState(item.name)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!newName.trim()) {
      setError('Please enter a name')
      return
    }

    if (newName.includes('/') || newName.includes('\\')) {
      setError('Name cannot contain / or \\')
      return
    }

    if (newName === item.name) {
      onClose()
      return
    }

    onRename(newName.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rename {item.type === 'folder' ? 'folder' : 'file'}</h2>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="newName">New name</label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameModal
