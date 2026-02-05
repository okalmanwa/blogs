import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogPostForm } from '@/components/forms/BlogPostForm'

export default async function NewPostPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role - be lenient if profile doesn't exist yet
  let isStudent = false
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }
    
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

  // Only redirect if we're sure they're not a student
  if (!isStudent) {
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
