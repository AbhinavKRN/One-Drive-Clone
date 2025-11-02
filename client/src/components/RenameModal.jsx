import React, { useState, useEffect, useRef } from 'react'
import { DismissRegular } from '@fluentui/react-icons'
import './Modal.css'

const RenameModal = ({ item, onClose, onRename }) => {
  const [newName, setNewName] = useState(item.name)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Auto-select filename (without extension) when modal opens
  useEffect(() => {
    if (inputRef.current && item.type !== 'folder') {
      const lastDotIndex = item.name.lastIndexOf('.')
      if (lastDotIndex > 0) {
        inputRef.current.setSelectionRange(0, lastDotIndex)
      } else {
        inputRef.current.select()
      }
    } else if (inputRef.current) {
      inputRef.current.select()
    }
  }, [item])

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
      <div className="modal rename-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rename</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <DismissRegular />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <input
                ref={inputRef}
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name"
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameModal
