import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function Footer() {
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

  // Get user role and context
  let userRole: string | null = null
  let currentYear: number | null = null
  
  if (user) {
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role || null
  } else if (hardcodedUser) {
    userRole = hardcodedUser.role || null
  }

  // Get current academic year from most recent open project
  if (userRole === 'admin') {
    const { data: openProjects } = await (supabase
      .from('projects') as any)
      .select('year')
      .eq('status', 'open')
      .order('year', { ascending: false })
      .limit(1)
    
    if (openProjects && openProjects.length > 0) {
      currentYear = openProjects[0].year
    } else {
      // Fallback to most recent project year
      const { data: recentProjects } = await (supabase
        .from('projects') as any)
        .select('year')
        .order('year', { ascending: false })
        .limit(1)
      
      if (recentProjects && recentProjects.length > 0) {
        currentYear = recentProjects[0].year
      }
    }
  }

  const roleLabel = userRole === 'admin' ? 'Administrator' : userRole === 'student' ? 'Student' : null

  return (
    <footer className="bg-cornell-dark-gray text-white mt-auto border-t border-gray-700">
      {/* Top divider for visual separation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 space-y-6">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and branding */}
            <div className="flex flex-col">
              <Link href="/" className="flex items-center mb-4 group">
                <div className="h-12 w-auto flex items-center relative">
                  <Image
                    src="/logos/logo.png"
                    alt="Cornell SC Johnson College of Business"
                    width={200}
                    height={48}
                    className="h-12 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                    priority={false}
                  />
                </div>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Student blog platform for academic projects and experiences.
              </p>
            </div>

            {/* Useful links */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                Resources
              </h3>
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/blogs" 
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Browse Blogs
                </Link>
                {userRole === 'admin' && (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Support and policies */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                Support
              </h3>
              <nav className="flex flex-col space-y-2">
                <a 
                  href="mailto:support@cornell.edu" 
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Help & Support
                </a>
                <a 
                  href="https://privacy.cornell.edu" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </nav>
            </div>
          </div>

          {/* Context-aware information */}
          {(currentYear || roleLabel) && (
            <div className="pt-4 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-400">
                <div className="flex flex-wrap gap-4">
                  {currentYear && (
                    <span>
                      Managing projects for Academic Year {currentYear}
                    </span>
                  )}
                  {roleLabel && (
                    <span>
                      Access level: {roleLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Copyright and legal */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Cornell SC Johnson College of Business. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <a 
                  href="https://www.cornell.edu" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  Cornell University
                </a>
                <span className="text-gray-600">•</span>
                <a 
                  href="https://business.cornell.edu" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  SC Johnson College
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
