import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { StudentPostsList } from '@/components/posts/StudentPostsList'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudentDashboardPage() {
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

  // Get user ID - prioritize Supabase user, then hardcoded user ID
  const userId = user?.id || (hardcodedUser?.id && !hardcodedUser.id.startsWith('hardcoded-') ? hardcodedUser.id : null)

  if (!userId) {
    redirect('/login')
  }



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile-first responsive */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 relative">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
        <div className="flex-shrink-0 ml-2">
          <RefreshButton />
        </div>
      </div>

      {/* Posts */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Posts</h2>
          <Link href="/student/posts/new" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">New Post</Button>
          </Link>
        </div>
        {/* Use client component to fetch posts - browser client has session so RLS allows drafts */}
        <StudentPostsList />
      </div>

    </div>
  )
}
