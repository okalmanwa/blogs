import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

export default async function StudentGalleryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: images } = await supabase
    .from('gallery_images')
    .select('*, project:projects(*)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Get open projects for upload
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'open')
    .order('year', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Gallery</h1>
        <Link href="/student/gallery/upload">
          <Button variant="primary">Upload Image</Button>
        </Link>
      </div>

      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image: any) => (
            <Card key={image.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
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
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No images yet. <Link href="/student/gallery/upload" className="text-cornell-red hover:underline">Upload your first image</Link>
          </p>
        </Card>
      )}
    </div>
  )
}
