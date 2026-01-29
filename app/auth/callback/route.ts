import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user and profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Determine redirect path based on role
        let redirectPath = '/'
        if (profile?.role === 'admin') {
          redirectPath = '/admin/dashboard'
        } else if (profile?.role === 'student') {
          redirectPath = '/student/dashboard'
        }

        // Create response with redirect
        const response = NextResponse.redirect(new URL(redirectPath, request.url))
        
        // Ensure all cookies from the session exchange are included in the response
        // The Supabase client should have already set them via setAll, but we ensure they're in the response
        const allCookies = cookieStore.getAll()
        allCookies.forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value, {
            httpOnly: cookie.name.includes('auth-token'),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
        })

        return response
      }
    } else {
      console.error('Error exchanging code for session:', error)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
