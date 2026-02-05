'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for error in URL parameters (from expired/invalid reset links)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    // Also check hash fragment for errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashError = hashParams.get('error')
    const hashErrorCode = hashParams.get('error_code')
    if (hashError && hashErrorCode) {
      const errorDescription = hashParams.get('error_description') || hashError
      setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
      // Clear hash from URL
      window.history.replaceState(null, '', window.location.pathname + (errorParam ? `?error=${encodeURIComponent(errorParam)}` : ''))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Use the callback route with recovery type for password reset
      // Supabase will append the code and type parameters
      const redirectUrl = `${window.location.origin}/auth/callback?type=recovery&next=/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email. Please try again.')
        setLoading(false)
        return
      }

      // Success - show success message
      setSuccess(true)
      setLoading(false)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-600 mb-4">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Back to Sign In
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Reset Password</h2>
            <p className="text-xs text-gray-500">Enter your email address and we&apos;ll send you a link to reset your password</p>
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
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
