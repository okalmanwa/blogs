'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from '@/types'

interface ProjectFilterProps {
  projects: Project[]
  currentProject?: string
}

export function ProjectFilter({ projects, currentProject }: ProjectFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('project', e.target.value)
    } else {
      params.delete('project')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      name="project"
      value={currentProject || ''}
      onChange={handleChange}
      className="input"
    >
      <option value="">All Projects</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name} ({project.year})
        </option>
      ))}
    </select>
  )
}
