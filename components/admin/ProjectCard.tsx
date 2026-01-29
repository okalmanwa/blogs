'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Project } from '@/types'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { useState } from 'react'

interface ProjectCardProps {
  project: Project
  onEdit?: () => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEditClick = () => {
    setIsEditing(true)
    onEdit?.()
  }

  const handleDeleteClick = () => {
    setIsDeleting(true)
  }

  const handleFormSuccess = () => {
    setIsEditing(false)
  }

  const handleFormCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="py-4 border-b border-gray-200 bg-gray-50/30">
        <div className="border-l-2 border-cornell-red pl-6">
          <ProjectForm 
            key={project.id}
            project={project} 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            defaultOpen={true}
          />
        </div>
      </div>
    )
  }

  const statusConfig = {
    open: {
      label: 'Active',
      dotColor: 'bg-green-500'
    },
    closed: {
      label: 'Archived',
      dotColor: 'bg-gray-400'
    }
  }

  const status = statusConfig[project.status as 'open' | 'closed'] || statusConfig.closed

  return (
    <>
      <div className="group px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 last:border-b-0 bg-white even:bg-gray-50/30 hover:bg-gray-100/50 transition-colors">
        {/* Mobile Layout - Card style */}
        <div className="md:hidden space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-0.5">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            {/* Status badge - Mobile */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
              <span className="text-xs text-gray-500">{status.label}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>Year: {project.year}</span>
          </div>

          {/* Actions - Always visible on mobile */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleEditClick}
              className="flex-1 text-sm text-gray-600 hover:text-cornell-red transition-colors py-1.5 px-3 rounded-md hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 text-sm text-red-600 hover:text-red-700 transition-colors py-1.5 px-3 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Desktop Layout - Table row style */}
        <div className="hidden md:flex items-center gap-4 md:gap-6">
          {/* Left: Project name and description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors mb-0.5">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 truncate max-w-2xl">
                {project.description}
              </p>
            )}
          </div>

          {/* Center: Year */}
          <div className="flex-shrink-0 w-16 text-right">
            <span className="text-sm text-gray-500">{project.year}</span>
          </div>

          {/* Center-right: Status */}
          <div className="flex-shrink-0 w-20 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
              <span className="text-sm text-gray-500">{status.label}</span>
            </div>
          </div>

          {/* Right: Actions - hidden until hover */}
          <div className="flex items-center gap-2 flex-shrink-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="text-sm text-gray-600 hover:text-cornell-red transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {isDeleting && (
        <div className="py-4 border-b border-gray-200 bg-red-50/30">
          <div className="border-l-2 border-red-300 pl-6">
            <ProjectForm 
              project={project} 
              isDeleting={true}
              onSuccess={() => setIsDeleting(false)}
              onCancel={() => setIsDeleting(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
