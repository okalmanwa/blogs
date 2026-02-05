import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { UserMenu } from './UserMenu'
import { SignOutButton } from './SignOutButton'
import { NavLink } from './NavLink'
import { MobileNav } from './MobileNav'

export async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for hardcoded user in cookies
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
  
  let profile = null
  if (user) {
    const { data } = await (supabase
      .from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  } else if (hardcodedUser) {
    // Use hardcoded user as profile
    profile = {
      id: hardcodedUser.id,
      username: hardcodedUser.username,
      full_name: hardcodedUser.email,
      role: hardcodedUser.role,
    }
  }
  
  // Determine if user is admin
  const isAdmin = profile?.role === 'admin' || hardcodedUser?.role === 'admin'

  return (
    <header className="bg-white border-b border-cornell-red/60 sm:border-b-2 sm:border-cornell-red sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16 md:h-20">
          <Link href="/" className="flex items-center flex-shrink-0 z-10 relative">
            <div className="h-8 sm:h-12 md:h-14 w-auto flex items-center relative">
              <Image
                src="/logos/logo.png"
                alt="Cornell SC Johnson College of Business"
                width={200}
                height={40}
                className="h-8 sm:h-12 md:h-14 w-auto object-contain"
                priority
              />
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 font-serif">
            {(user && profile) || hardcodedUser ? (
              <>
                {/* Admin Navigation */}
                {isAdmin ? (
                  <>
                    <NavLink href="/admin/dashboard">Create Project</NavLink>
                    <NavLink href="/">Blogs</NavLink>
                    <NavLink href="/admin/moderation">
                      Moderation
                    </NavLink>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    {/* Student Navigation */}
                    <NavLink href="/">Blogs</NavLink>
                    <NavLink href="/student/dashboard">
                      Dashboard
                    </NavLink>
                    <SignOutButton />
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-cornell-red hover:bg-cornell-red/90 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile menu */}
          <div className="md:hidden flex-shrink-0 relative z-10">
            <MobileNav 
              isAuthenticated={!!((user && profile) || hardcodedUser)}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
