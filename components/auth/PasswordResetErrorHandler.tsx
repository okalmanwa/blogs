'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function PasswordResetErrorHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for password reset codes in query params (backup for server-side redirect)
    const code = searchParams.get('code')
    const hasOtherParams = searchParams.get('project') || searchParams.get('search') || 
                          searchParams.get('sort') || searchParams.get('projectStatus') || 
                          searchParams.get('page')
    
    if (code && !hasOtherParams) {
      // Redirect to auth callback with recovery type
      router.replace(`/auth/callback?code=${code}&type=recovery&next=/reset-password`)
      return
    }

    // Check hash fragment for password reset errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashError = hashParams.get('error')
    const hashErrorCode = hashParams.get('error_code')
    
    if (hashError && hashErrorCode) {
      // If it's an OTP/password reset error, redirect to forgot password page
      if (hashErrorCode === 'otp_expired' || hashErrorCode === 'token_expired') {
        const errorDescription = hashParams.get('error_description') || hashError
        const errorMsg = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        router.push(`/forgot-password?error=${encodeURIComponent(errorMsg)}`)
      }
    }
  }, [router, searchParams])

  return null
}
