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
        className={`fixed top-14 sm:top-16 md:top-20 left-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cornell-red to-cornell-red/90 border-b border-cornell-red/20">
            <h2 className="text-lg font-bold text-white tracking-wide">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-150 active:bg-white/30"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            {/* Sort Section */}
            <div className="px-6 pt-6 pb-5 flex-shrink-0 bg-white border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Sort</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                    currentSort === 'newest'
                      ? 'bg-cornell-red text-white font-semibold shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {currentSort === 'newest' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>Newest First</span>
                  </span>
                </button>
                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                    currentSort === 'oldest'
                      ? 'bg-cornell-red text-white font-semibold shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {currentSort === 'oldest' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>Oldest First</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Project Filter - Takes remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 pt-6 bg-white">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex-shrink-0">Project</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ paddingBottom: '1.5rem' }}>
                <button
                  onClick={() => handleProjectChange('')}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                    !currentProject
                      ? 'bg-cornell-red text-white font-semibold shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {!currentProject && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>All Projects</span>
                  </span>
                </button>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-150 ${
                      currentProject === project.id
                        ? 'bg-cornell-red text-white font-semibold shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {currentProject === project.id && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className="line-clamp-1">{project.name}</span>
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
