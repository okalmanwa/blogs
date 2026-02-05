import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectFilter } from '@/components/gallery/ProjectFilter'

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { project?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('gallery_images')
    .select('*, author:profiles(*), project:projects(*)')
    .order('created_at', { ascending: false })

  if (searchParams.project) {
    query = query.eq('project_id', searchParams.project)
  }

  const { data: images } = await query

  // Get all projects for filter
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('year', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-cornell-dark-gray">Gallery</h1>
        <p className="text-gray-600">Browse images from student projects</p>
      </div>

      {/* Project Filter */}
      <div className="mb-8">
        <ProjectFilter projects={projects || []} currentProject={searchParams.project} />
      </div>

      {/* Images Grid */}
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image: any) => (
            <Card key={image.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/gallery/${image.id}`}>
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.title || 'Gallery image'}
                    fill
                    className="object-cover"
                  />
                </div>
                {(image.title || image.project) && (
                  <div className="p-3">
                    {image.title && (
                      <h3 className="font-semibold text-sm mb-1">{image.title}</h3>
                    )}
                    {image.project && (
                      <p className="text-xs text-gray-500">{image.project.name}</p>
                    )}
                  </div>
                )}
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-600 py-8">No images found.</p>
        </Card>
      )}
    </div>
  )
}
