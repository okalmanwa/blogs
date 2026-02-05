import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { CreateProjectButton } from '@/components/forms/CreateProjectButton'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { ProjectsList } from '@/components/admin/ProjectsList'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProjectsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') {
    redirect('/student/dashboard')
  }

  // Fetch projects - ensure RLS allows public read
  // Create a fresh client instance to avoid any caching issues
  const projectsClient = createClient()
  
  const result = await projectsClient
    .from('projects')
    .select('*')
    .order('year', { ascending: false })
  const projects = (result.data || []) as any[]
  const projectsError = result.error
  
  // Log for debugging - this will appear in server logs
  if (projectsError) {
    console.error('[Admin Projects] Error fetching projects:', {
      code: projectsError.code,
      message: projectsError.message,
      details: projectsError.details,
      hint: projectsError.hint,
      fullError: JSON.stringify(projectsError, null, 2)
    })
  } else {
    console.log('[Admin Projects] Successfully fetched projects:', {
      count: projects?.length || 0,
      hasData: !!projects,
      isArray: Array.isArray(projects)
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Projects</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Organize submissions by academic year or initiative
          </p>
        </div>
        <div className="flex-shrink-0">
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
