'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

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
          .single()

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
              .single()
            
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
          // Profile exists, but ensure role is 'student' if it's not set
          const profile = existingProfile as { id: string; role?: string }
          if (!profile.role || profile.role !== 'student') {
            console.log('[Register] Updating profile role to student...')
            await (supabase
              .from('profiles') as any)
              .update({ role: 'student' })
              .eq('id', authData.user.id)
          }
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
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-cornell-red to-cornell-red/90 px-6 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Join Us
      </h1>
          <p className="text-white/90 text-sm">Create your account to get started</p>
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
                </div>
              </div>
        </div>
      )}

          <form onSubmit={handleSubmit} className="space-y-5">
        <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Cornell Email <span className="text-cornell-red">*</span>
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
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Only @cornell.edu email addresses are accepted
              </p>
        </div>

        <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-cornell-red">*</span>
          </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={50}
            autoComplete="username"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors text-gray-900 placeholder-gray-400"
            placeholder="username"
          />
              </div>
        </div>

        <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            autoComplete="name"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors text-gray-900 placeholder-gray-400"
            placeholder="John Doe"
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
            minLength={6}
            autoComplete="new-password"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="Create a password"
          />
              </div>
              <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters</p>
        </div>

        <Button
          type="submit"
          variant="primary"
              className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow mt-6"
          disabled={loading}
        >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
        </Button>
      </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
              <Link href="/login" className="text-cornell-red hover:text-cornell-red/80 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
          </div>
        </div>
      </div>
    </div>
  )
}
