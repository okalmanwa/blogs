import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StudentPostsList } from '@/components/posts/StudentPostsList'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudentDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile-first responsive */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 relative">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
        <div className="flex-shrink-0 ml-2">
          <Link href="/student/posts/new">
            <Button variant="primary" className="w-full sm:w-auto">New Post</Button>
          </Link>
        </div>
      </div>

      {/* Your Posts */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Your Posts</h2>
          <p className="text-sm text-gray-600">Manage and track all your blog posts and drafts</p>
        </div>
        {/* Use client component to fetch posts - browser client has session so RLS allows drafts */}
        <StudentPostsList />
      </div>

    </div>
  )
}
