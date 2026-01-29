'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { ProjectFilter } from './ProjectFilter'
import { ProjectCard } from './ProjectCard'
import { EmptyProjectsState } from './EmptyProjectsState'
import { Project } from '@/types'
import { PostgrestError } from '@supabase/supabase-js'

interface ProjectsListProps {
  projects: Project[]
  error: PostgrestError | null
}

type FilterType = 'all' | 'open' | 'closed'

export function ProjectsList({ projects, error }: ProjectsListProps) {
  const [filter, setFilter] = useState<FilterType>('open') // Default to 'open' as requested

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter(p => p.status === filter)
  }, [projects, filter])

  const counts = useMemo(() => ({
    all: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    closed: projects.filter(p => p.status === 'closed').length,
  }), [projects])

  if (error) {
    return (
      <Card className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800">
        <p className="font-semibold mb-2">Unable to load projects</p>
        <p className="mb-2 text-sm">{error.message || 'An unexpected error occurred'}</p>
        <div className="text-xs space-y-1 mt-3 text-red-700">
          {error.code && <p><strong>Code:</strong> {error.code}</p>}
          {error.details && <p><strong>Details:</strong> {error.details}</p>}
          {error.hint && <p><strong>Hint:</strong> {error.hint}</p>}
        </div>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        </div>
        <EmptyProjectsState />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Projects
        </h2>
        <ProjectFilter value={filter} onChange={setFilter} counts={counts} />
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">
            No {filter === 'open' ? 'open' : filter === 'closed' ? 'closed' : ''} projects found.
          </p>
          {filter !== 'all' && (
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different filter or create a new project.
            </p>
          )}
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header row - Hidden on mobile */}
          <div className="hidden md:block px-4 md:px-6 py-2.5 bg-gray-50/50 border-b border-gray-200">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project</span>
              </div>
              <div className="flex-shrink-0 w-16 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</span>
              </div>
              <div className="flex-shrink-0 w-20 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
              </div>
              <div className="flex-shrink-0 w-24"></div>
            </div>
          </div>
          {/* Project rows */}
          <div>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
