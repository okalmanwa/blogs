'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './Button'

interface KebabMenuProps {
  onDelete: () => void
  onEdit: () => void
  deleteLabel?: string
  editLabel?: string
}

export function KebabMenu({ onDelete, onEdit, deleteLabel = 'Delete', editLabel = 'Edit' }: KebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [positionUp, setPositionUp] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      
      // Check if dropdown would overflow below viewport
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownHeight = 100 // Approximate height of dropdown
        setPositionUp(spaceBelow < dropdownHeight)
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDelete = () => {
    setIsOpen(false)
    onDelete()
  }

  const handleEdit = () => {
    setIsOpen(false)
    onEdit()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cornell-red focus:ring-offset-2"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999] ${
          positionUp ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          <button
            onClick={handleEdit}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {editLabel}
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  )
}
