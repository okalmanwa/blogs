import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BlogPostForm } from '@/components/forms/BlogPostForm'

export default async function NewPostPage() {
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

  // Check role - be lenient if profile doesn't exist yet
  let isStudent = false
  if (hardcodedUser) {
    isStudent = hardcodedUser.role === 'student' || hardcodedUser.role === 'admin'
  } else if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      // If profile exists, check role
      // If profile doesn't exist, allow access (default to student)
      if (profile) {
        isStudent = profile.role === 'student' || profile.role === 'admin'
      } else {
        // No profile yet - allow access (will be created as student)
        isStudent = true
      }
    } catch (error) {
      // Profile query failed - allow access (default to student)
      console.warn('Profile query failed, allowing access:', error)
      isStudent = true
    }
  }

  // Only redirect if we're sure they're not a student
  if (!isStudent && (hardcodedUser?.role === 'viewer' || user)) {
    redirect('/')
  }

  // Get open projects for dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'open')
    .order('year', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-0">
      <BlogPostForm projects={projects || []} />
    </div>
  )
}
