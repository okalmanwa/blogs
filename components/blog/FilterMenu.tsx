'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from '@/types'

interface FilterMenuProps {
  projects: Project[]
  currentProject?: string
}

export function FilterMenu({ projects, currentProject }: FilterMenuProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentProjectStatus = searchParams.get('projectStatus') || ''

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
    setIsOpen(false)
  }

  const handleProjectStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('projectStatus', status)
    } else {
      params.delete('projectStatus')
    }
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const hasActiveFilters = currentProject || currentProjectStatus

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md border transition-colors ${
          hasActiveFilters
            ? 'border-cornell-red bg-cornell-red/5 text-cornell-red'
            : 'border-gray-300 hover:border-gray-400 text-gray-600'
        }`}
        aria-label="Filter options"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Project Status Filter */}
          <div className="px-4 py-2 border-b border-gray-100">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Project Status
            </label>
            <div className="space-y-1">
              <button
                onClick={() => handleProjectStatusChange('')}
                className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                  !currentProjectStatus ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                All Statuses
              </button>
              <button
                onClick={() => handleProjectStatusChange('open')}
                className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                  currentProjectStatus === 'open' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                Active (Open)
              </button>
              <button
                onClick={() => handleProjectStatusChange('closed')}
                className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                  currentProjectStatus === 'closed' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Project Filter */}
          <div className="px-4 py-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Project
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => handleProjectChange('')}
                className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                  !currentProject ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`}
              >
                All Projects
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectChange(project.id)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-50 transition-colors ${
                    currentProject === project.id ? 'bg-gray-100 font-medium' : 'text-gray-700'
                  }`}
                >
                  {project.name} ({project.year})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
