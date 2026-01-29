'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isHardcodedUser } from '@/lib/hardcoded-users'

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

    // Check if it's a hardcoded user first
    const hardcodedUser = isHardcodedUser(email, password)
    
    if (hardcodedUser) {
      // Hardcoded users are real Supabase users, so sign them in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: hardcodedUser.user.email,
        password: hardcodedUser.user.password,
      })

      if (authError) {
        setError(authError.message || 'Failed to sign in. Make sure the hardcoded users are set up in Supabase.')
        setLoading(false)
        return
      }

      if (authData.user) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verify session is established
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setError('Session not established. Please try again.')
          setLoading(false)
          return
        }

        // Store user info in cookie for middleware/auth checks (as fallback)
        const userData = {
          email: hardcodedUser.user.email,
          username: hardcodedUser.user.username,
          role: hardcodedUser.role,
          id: authData.user.id
        }
        
        // Set cookie via API route (server-side) for better reliability
        try {
          const response = await fetch('/api/auth/set-hardcoded-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userData }),
          })

          if (!response.ok) {
            throw new Error('Failed to set authentication cookie')
          }
        } catch (error) {
          console.error('Error setting cookie:', error)
          // Fallback to client-side cookie setting
          const cookieValue = encodeURIComponent(JSON.stringify(userData))
          document.cookie = `hardcoded_user=${cookieValue}; path=/; max-age=86400; SameSite=Lax`
        }

        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        // Determine redirect path based on role
        let redirectPath = '/'
        const profileRole = profile ? (profile as { role: string }).role : null
        if (profileRole === 'admin' || hardcodedUser.role === 'admin') {
          redirectPath = '/admin/dashboard'
        } else if (profileRole === 'student' || hardcodedUser.role === 'student') {
          redirectPath = '/student/dashboard'
        }

        // Force full page reload to ensure session cookies are set
        window.location.href = redirectPath
      }
      return
    }

    // Try Supabase auth
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

        // Check if profile exists, create it automatically if missing
        let { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single() as { data: { id: string; role: string } | null }

        if (!profile) {
          // Profile doesn't exist - create it automatically with role 'student'
          console.log('[Login] Profile not found, creating automatically...')
          const email = authData.user.email || ''
          const username = email.split('@')[0] || 'user'
          
          const { error: profileError, data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username,
              full_name: authData.user.user_metadata?.full_name || null,
              role: 'student', // Always set to student for automatic creation
            } as any)
            .select()
            .single()

          if (profileError) {
            console.error('[Login] Failed to create profile:', profileError)
            // Continue anyway - might be created by trigger
            await new Promise(resolve => setTimeout(resolve, 500))
            const { data: retryProfile } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', authData.user.id)
              .single()
            profile = (retryProfile as { id: string; role: string } | null) || null
          } else {
            profile = newProfile
            console.log('[Login] Profile created automatically:', profile)
          }
        } else if (profile && (!(profile as { role?: string }).role || (profile as { role: string }).role !== 'student')) {
          // Profile exists but doesn't have student role - update it
          console.log('[Login] Updating profile role to student...')
          await (supabase.from('profiles') as any)
            .update({ role: 'student' })
            .eq('id', authData.user.id)
          profile = profile ? { ...(profile as { id: string; role: string }), role: 'student' } : null
        }

        // Get user profile to determine role
        let redirectPath = '/student/dashboard' // Default to student dashboard
        const profileRole = profile ? (profile as { role: string }).role : null
        
        if (profileRole === 'admin') {
          redirectPath = '/admin/dashboard'
        } else if (profileRole === 'student') {
          redirectPath = '/student/dashboard'
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
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-cornell-red to-cornell-red/90 px-6 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/90 text-sm">Sign in to your account</p>
        </div>

        <div className="px-6 sm:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-800 mb-1">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('setup-users') && (
                    <p className="mt-2 text-xs text-red-600">
                      Or check that your Supabase credentials are correct in your .env file.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-cornell-red">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="your.email@cornell.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-cornell-red">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-cornell-red hover:text-cornell-red/80 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
