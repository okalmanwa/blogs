'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Sign in with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message || 'Invalid credentials')
      setLoading(false)
      return
    }

    if (authData.user && authData.session) {
      try {
        // Verify session is established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!session) {
          console.error('Session not established:', sessionError)
          setError('Session not established. Please try again.')
          setLoading(false)
          return
        }

        // Set session cookies server-side via API route to ensure middleware can read them
        try {
          const sessionResponse = await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are included and set
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          })

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to set session cookies')
          }
        } catch (error) {
          console.error('Error setting session cookies:', error)
          // Continue anyway - cookies might still be set by browser client
        }

        // Get user profile from database to determine role
        // IMPORTANT: Only read the profile - NEVER create or update it here
        // Profiles should only be created during registration
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single() as { data: { id: string; role: string | null } | null; error: any }

        // If profile doesn't exist, user must register first
        if (!profile || profileError) {
          console.error('[Login] Profile not found - user must register first')
          setError('No profile found. Please register first or contact support.')
          setLoading(false)
          // Sign out the user since they don't have a profile
          await supabase.auth.signOut()
          return
        }

        // Profile exists - read the role from database (never modify it)
        const profileRole = (profile as { role: string | null }).role
        
        if (!profileRole) {
          console.error('[Login] Profile exists but role is missing')
          setError('Your profile is incomplete. Please contact support.')
          setLoading(false)
          return
        }

        console.log(`[Login] User role from database: "${profileRole}"`)
        
        // Determine redirect path based on role from database
        let redirectPath = '/student/dashboard' // Default to student dashboard
        
        if (profileRole === 'admin') {
          redirectPath = '/admin/dashboard'
        } else if (profileRole === 'student') {
          redirectPath = '/student/dashboard'
        } else if (profileRole === 'viewer') {
          redirectPath = '/' // Viewers go to home page
        }

        // Wait a moment for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 200))

        // Redirect using window.location.href for full page reload to ensure cookies are read
        setLoading(false)
        console.log('Redirecting to:', redirectPath)
        window.location.href = redirectPath
      } catch (error: any) {
        console.error('Login error:', error)
        setError('An error occurred during login. Please try again.')
        setLoading(false)
      }
    } else {
      setError('Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Header - Subtle like post form */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
            <p className="text-xs text-gray-500">Sign in to your account</p>
          </div>

          <div className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="your.email@cornell.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-cornell-red hover:text-cornell-red/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}
