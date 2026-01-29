import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
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
  
  // Check for hardcoded user
  const cookieStore = cookies()
  const hardcodedUserCookie = cookieStore.get('hardcoded_user')
  let hardcodedUser = null
  if (hardcodedUserCookie) {
    try {
      hardcodedUser = JSON.parse(decodeURIComponent(hardcodedUserCookie.value))
    } catch (e) {
      // Invalid cookie
    }
  }

  if (!user && !hardcodedUser) {
    redirect('/login')
  }

  // Use client component to fetch post - browser client has session so RLS allows drafts
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      <EditPostWrapper postId={params.id} returnTo={searchParams.returnTo} />
    </div>
  )
}
