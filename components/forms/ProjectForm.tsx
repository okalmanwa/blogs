'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Project } from '@/types'

interface ProjectFormProps {
  project?: Project
  onSuccess?: () => void
  onCancel?: () => void
  isDeleting?: boolean
  defaultOpen?: boolean // Force form to be open (for editing from ProjectCard)
}

export function ProjectForm({ project, onSuccess, onCancel, isDeleting, defaultOpen }: ProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(defaultOpen !== undefined ? defaultOpen : !project)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize form data immediately from project prop
  const [formData, setFormData] = useState(() => ({
    name: project?.name || '',
    description: project?.description || '',
    year: project?.year || new Date().getFullYear(),
    status: project?.status || 'open',
  }))

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        year: project.year || new Date().getFullYear(),
        status: project.status || 'open',
      })
    } else {
      // Reset to defaults for new project
      setFormData({
        name: '',
        description: '',
        year: new Date().getFullYear(),
        status: 'open',
      })
    }
  }, [project?.id, project?.name, project?.description, project?.year, project?.status]) // Update when project data changes

  // Sync isOpen with defaultOpen prop
  useEffect(() => {
    if (defaultOpen !== undefined) {
      setIsOpen(defaultOpen)
    }
  }, [defaultOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Get user ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }
    
    const userId = user.id

    try {
      if (project) {
        // Update existing project
        const { error } = await (supabase
          .from('projects') as any)
          .update({
            name: formData.name,
            description: formData.description || null,
            year: formData.year,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)

        if (error) {
          console.error('Update error:', error)
          throw new Error(`Failed to update project: ${error.message}`)
        }
      } else {
        // Create new project
        const { error } = await (supabase
          .from('projects') as any)
          .insert({
            name: formData.name,
            description: formData.description || null,
            year: formData.year,
            status: formData.status,
            admin_id: userId,
          })

        if (error) throw error
      }

      // Reset form for new project
      if (!project) {
        setFormData({
          name: '',
          description: '',
          year: new Date().getFullYear(),
          status: 'open',
        })
        setIsOpen(false)
      } else {
        setIsOpen(false)
        // Call onSuccess immediately to close the form before refresh
        // This prevents showing a blank form while waiting for refresh
        if (onSuccess) {
          onSuccess()
        }
      }
      
      // Refresh the server component to fetch fresh data
      router.refresh()
      
      // For new projects, call onSuccess after refresh
      if (!project && onSuccess) {
        onSuccess()
      }
      
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) {
        console.error('Delete error:', error)
        setError(`Failed to delete project: ${error.message}`)
        setLoading(false)
      } else {
        // Refresh the server component to fetch fresh data
        setLoading(false)
        router.refresh()
        onSuccess?.()
      }
    } catch (err: any) {
      console.error('Delete exception:', err)
      setError(`Failed to delete project: ${err.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  // If isDeleting is true, show delete confirmation UI
  if (isDeleting && project) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-2">
            Delete &quot;{project.name}&quot;?
          </p>
          <p className="text-sm text-red-700 mb-4">
            This will permanently remove the project and all associated content. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Project'}
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
          {error && (
            <div className="mt-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleEditClick = () => {
    // Reset form data to current project data when opening edit form
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        year: project.year || new Date().getFullYear(),
        status: project.status || 'open',
      })
    }
    setIsOpen(true)
  }

  // Don't render buttons if isDeleting is true (handled above)
  if (!isOpen && project && !isDeleting) {
    return null // Buttons are now handled by ProjectCard component
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-cornell-red to-cornell-red/90 px-6 py-4 border-b border-gray-200 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">
              {project ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-sm text-white/90 mt-1">
              {project ? 'Update project details below' : 'Fill in the details to create a new project'}
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-white/90 hover:text-white active:text-white rounded-full p-2 hover:bg-white/20 active:bg-white/30 transition-all flex-shrink-0 touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
                min={2000}
                max={2100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'closed' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 appearance-none cursor-pointer hover:border-gray-400"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {project && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  onCancel?.()
                }}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                project ? 'Update Project' : 'Create Project'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
