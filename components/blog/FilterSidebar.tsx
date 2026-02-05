'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from '@/types'

interface FilterSidebarProps {
  projects: Project[]
  currentProject?: string
}

export function FilterSidebar({ projects, currentProject }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentSort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest'

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleProjectChange = (projectId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (projectId) {
      params.set('project', projectId)
    } else {
      params.delete('project')
    }
    router.push(`?${params.toString()}`)
  }

  const handleSortChange = (sort: 'newest' | 'oldest') => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters = currentProject || currentSort !== 'newest'

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-md border transition-colors relative ${
          hasActiveFilters
            ? 'border-cornell-red bg-cornell-red/5 text-cornell-red'
            : 'border-gray-300 hover:border-gray-400 text-gray-600'
        }`}
        aria-label="Open filters"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cornell-red rounded-full"></span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-14 sm:top-16 md:top-20 bottom-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-14 sm:top-16 md:top-20 left-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-72 max-w-[85vw] bg-cornell-red shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors active:bg-white/30"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Sort Section */}
            <div className="px-4 pt-5 pb-4 flex-shrink-0 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Sort</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all ${
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
                    <span>Newest First</span>
                  </span>
                </button>
                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all ${
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
                    <span>Oldest First</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Project Filter - Takes remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 flex-shrink-0">Project</h3>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2" style={{ paddingBottom: '1.5rem' }}>
                <button
                  onClick={() => handleProjectChange('')}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all ${
                    !currentProject
                      ? 'bg-cornell-red text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {!currentProject && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>All Projects</span>
                  </span>
                </button>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all ${
                      currentProject === project.id
                        ? 'bg-cornell-red text-white font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {currentProject === project.id && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>{project.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
