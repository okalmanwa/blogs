import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { CreateProjectButton } from '@/components/forms/CreateProjectButton'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { ProjectsList } from '@/components/admin/ProjectsList'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
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

  // Check role
  let isAdmin = false
  if (hardcodedUser) {
    isAdmin = hardcodedUser.role === 'admin'
  } else if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  if (!isAdmin) {
    redirect('/student/dashboard')
  }

  // Fetch projects - ensure RLS allows public read
  // Create a fresh client instance to avoid any caching issues
  const projectsClient = createClient()
  
  const { data: projects, error: projectsError } = await projectsClient
    .from('projects')
    .select('*')
    .order('year', { ascending: false })
  
  // Log for debugging - this will appear in server logs
  if (projectsError) {
    console.error('[Admin Dashboard] Error fetching projects:', {
      code: projectsError.code,
      message: projectsError.message,
      details: projectsError.details,
      hint: projectsError.hint,
      fullError: JSON.stringify(projectsError, null, 2)
    })
  } else {
    console.log('[Admin Dashboard] Successfully fetched projects:', {
      count: projects?.length || 0,
      hasData: !!projects,
      isArray: Array.isArray(projects)
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 relative">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <div className="flex-shrink-0 ml-2">
          <RefreshButton />
        </div>
      </div>

      {/* Create New Project */}
      <CreateProjectButton />

      {/* Existing Projects */}
      <div>
        <ProjectsList projects={projects || []} error={projectsError} />
      </div>
    </div>
  )
}
