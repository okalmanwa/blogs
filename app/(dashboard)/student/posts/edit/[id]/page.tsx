import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditPostWrapper } from '@/components/posts/EditPostWrapper'

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { returnTo?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use client component to fetch post - browser client has session so RLS allows drafts
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      <EditPostWrapper postId={params.id} returnTo={searchParams.returnTo} />
    </div>
  )
}
