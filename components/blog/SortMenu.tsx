'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SortMenu() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const currentSort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      
      // Calculate position to keep dropdown within viewport
      if (buttonRef.current && menuRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const dropdownWidth = 192 // w-48 = 12rem = 192px
        const viewportWidth = window.innerWidth
        const padding = 16 // 1rem padding
        
        // Try to center it
        let left = buttonRect.left + (buttonRect.width / 2) - (dropdownWidth / 2)
        
        // If it would overflow left, align to left edge with padding
        if (left < padding) {
          left = padding
        }
        
        // If it would overflow right, align to right edge with padding
        if (left + dropdownWidth > viewportWidth - padding) {
          left = viewportWidth - dropdownWidth - padding
        }
        
        setDropdownStyle({
          left: `${left}px`,
          right: 'auto',
        })
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSortChange = (sort: 'newest' | 'oldest') => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const hasActiveSort = currentSort !== 'newest'

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md border transition-colors ${
          hasActiveSort
            ? 'border-cornell-red bg-cornell-red/5 text-cornell-red'
            : 'border-gray-300 hover:border-gray-400 text-gray-600'
        }`}
        aria-label="Sort options"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      </button>

      <div 
        className={`absolute mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200/60 py-2 z-50 transition-all duration-200 ease-out origin-top backdrop-blur-sm ${
          isOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        }`}
        style={dropdownStyle}
      >
          <div className="px-3 py-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block px-2">
              Sort
            </label>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSortChange('newest')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all ${
                  currentSort === 'newest' 
                    ? 'bg-cornell-red text-white font-medium shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  {currentSort === 'newest' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>Newest</span>
                </span>
              </button>
              <button
                onClick={() => handleSortChange('oldest')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all ${
                  currentSort === 'oldest' 
                    ? 'bg-cornell-red text-white font-medium shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  {currentSort === 'oldest' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>Oldest</span>
                </span>
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}
