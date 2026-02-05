import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always try to refresh session first to ensure it's available to server components
  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
  
  // Get user - this should work if session exists
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Only log errors if we're trying to access a protected route
  // (to avoid spam on public pages)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/student') || 
                           request.nextUrl.pathname.startsWith('/admin')
  if (isProtectedRoute && refreshError && refreshError.message !== 'Auth session missing!') {
    console.warn('[Middleware] Session refresh error:', refreshError.message)
  }
  if (isProtectedRoute && userError && userError.message !== 'Auth session missing!') {
    console.warn('[Middleware] Get user error:', userError.message)
  }

  // Skip auth check for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/student') || 
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect admin routes - check role from database
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Only allow if profile exists and role is admin
      if (!profile || profile.role !== 'admin') {
        if (profile?.role === 'student') {
          return NextResponse.redirect(new URL('/student/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    } catch (error) {
      // Profile doesn't exist - redirect to registration
      return NextResponse.redirect(new URL('/register', request.url))
    }
  }

  // Protect student routes - block viewers and require profile
  if (request.nextUrl.pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Profile must exist - if not, redirect to registration
      if (!profile) {
        return NextResponse.redirect(new URL('/register', request.url))
      }

      // Block viewers from student routes
      if (profile.role === 'viewer') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // Profile doesn't exist or query failed - redirect to registration
      console.warn('Profile query failed in middleware, redirecting to registration:', error)
      return NextResponse.redirect(new URL('/register', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route - handled separately)
     * - api routes (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
