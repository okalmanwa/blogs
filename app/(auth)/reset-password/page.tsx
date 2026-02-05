'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a valid password reset token
    // Supabase password reset tokens come via hash fragments in the URL
    const checkToken = async () => {
      try {
        // Check if there are hash fragments (password reset token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (accessToken && type === 'recovery') {
          // Supabase automatically processes hash fragments and sets session
          // Wait a moment for Supabase to process the token
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check if session was established
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setIsValidToken(true)
            // Clear hash from URL for security
            window.history.replaceState(null, '', window.location.pathname)
          } else {
            setIsValidToken(false)
          }
        } else {
          // Check if there's already a session (user came from callback)
          const { data: { session } } = await supabase.auth.getSession()
          setIsValidToken(!!session)
        }
      } catch (err) {
        console.error('Error checking token:', err)
        setIsValidToken(false)
      }
    }
    
    checkToken()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to reset password. The link may have expired.')
        setLoading(false)
        return
      }

      // Success - sign out the user so they sign in with new password
      await supabase.auth.signOut()
      
      setSuccess(true)
      setLoading(false)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-cornell-red border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Verifying reset link...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-gray-600 mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login" className="block mt-3 text-sm text-cornell-red hover:text-cornell-red/80">
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your password has been successfully reset. Redirecting you to sign in...
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
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
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Set New Password</h2>
            <p className="text-xs text-gray-500">Enter your new password below</p>
          </div>

          <div className="px-4 sm:px-6 py-4 space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Confirm new password"
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Remember your password?{' '}
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
