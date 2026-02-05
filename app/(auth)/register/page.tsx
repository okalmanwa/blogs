'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate Cornell email
    if (!email.toLowerCase().endsWith('@cornell.edu')) {
      setError('Only Cornell University email addresses (@cornell.edu) are allowed')
      setLoading(false)
      return
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username,
          full_name: fullName || null,
        }
      }
    })

    if (authError) {
      // Handle rate limiting errors
      if (authError.status === 429 || authError.message.includes('rate') || authError.message.includes('too many')) {
        setError('Too many signup attempts. Please wait 5-10 minutes before trying again, or use a different email address.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (authData.user) {
      try {
        // Sign in the user immediately to establish a session
        // This is needed because signUp doesn't always create an active session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })

        if (signInError) {
          // If email confirmation is required, tell user to check email
          if (signInError.message.includes('Email not confirmed') || signInError.message.includes('confirm')) {
            setError('Please check your email to confirm your account, then try logging in.')
            setLoading(false)
            return
          }
          console.warn('Sign in after signup failed:', signInError)
          setError('Account created but failed to sign in. Please try logging in manually.')
          setLoading(false)
          return
        }

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Verify session is established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!session) {
          console.error('Session not established after signup:', sessionError)
          setError('Session not established. Please try logging in manually.')
          setLoading(false)
          return
        }

        // Wait a moment for trigger to create profile (if trigger exists)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if profile exists (might be created by database trigger)
        let { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single() as { data: { id: string; role: string } | null }

        // If profile doesn't exist, create it automatically
        if (!existingProfile) {
          console.log('[Register] Profile not found, creating profile...')
          
          // Try to create profile - RLS policy requires auth.uid() = id
          const { error: profileError, data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name: fullName || null,
              role: 'student', // Always set to student for new signups
            } as any)
            .select()
            .single()

      if (profileError) {
            console.error('[Register] Profile creation error:', profileError)
            
            // Wait a bit more and check again (trigger might have created it)
            await new Promise(resolve => setTimeout(resolve, 500))
            const { data: retryProfile } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', authData.user.id)
              .single() as { data: { id: string; role: string } | null }
            
            if (!retryProfile) {
              setError(`Failed to create profile: ${profileError.message}. Please contact support.`)
              setLoading(false)
              return
            } else {
              existingProfile = retryProfile
            }
          } else {
            existingProfile = newProfile
            console.log('[Register] Profile created successfully:', existingProfile)
          }
        } else {
          // Profile exists, but ensure role is 'student' if it's not set (don't overwrite existing roles)
          const profile = existingProfile as { id: string; role?: string }
          if (!profile.role) {
            console.log('[Register] Profile missing role, setting to student...')
            await (supabase
              .from('profiles') as any)
              .update({ role: 'student' })
              .eq('id', authData.user.id)
          }
          // Don't overwrite existing roles - respect admin/viewer roles from database
        }

        // Refresh session to ensure cookies are set by browser client
        await supabase.auth.refreshSession()
        
        // Wait for cookies to be set by browser client
        await new Promise(resolve => setTimeout(resolve, 500))

        // Always redirect - browser client should have set cookies automatically
        setLoading(false)
        console.log('Redirecting to student dashboard')
        window.location.href = '/student/dashboard'
      } catch (error: any) {
        console.error('Registration error:', error)
        setError('An error occurred during registration. Please try logging in manually.')
        setLoading(false)
      }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create account</h2>
            <p className="text-xs text-gray-500">Sign up to get started</p>
          </div>

          <div className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                Cornell Email
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
              <p className="mt-1.5 text-xs text-gray-500">
                Only @cornell.edu email addresses are accepted
              </p>
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-600 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                autoComplete="username"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="username"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                autoComplete="name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="John Doe"
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
                minLength={6}
                autoComplete="new-password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Create a password"
              />
              <p className="mt-1.5 text-xs text-gray-500">Must be at least 6 characters</p>
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-cornell-red hover:text-cornell-red/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}
