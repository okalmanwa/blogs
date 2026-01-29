import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ProjectsPage() {
  const supabase = createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('year', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-cornell-dark-gray">Projects</h1>
        <p className="text-gray-600">Explore student projects by year</p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-semibold text-cornell-red">
                  {project.name}
                </h2>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Year: {project.year}</span>
                <span>{formatDate(project.created_at)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/blogs?project=${project.id}`}>
                  <span className="text-sm text-cornell-red hover:underline">
                    View Blogs →
                  </span>
                </Link>
                <Link href={`/gallery?project=${project.id}`}>
                  <span className="text-sm text-cornell-red hover:underline">
                    View Gallery →
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-600 py-8">No projects found.</p>
        </Card>
      )}
    </div>
  )
}
