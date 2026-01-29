import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { access_token, refresh_token } = body

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    // Create Supabase client with cookie handling
    // We'll build the response as cookies are set
    let response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Update response with cookies - create new response to ensure cookies are included
            const newResponse = NextResponse.json({ success: true })
            cookiesToSet.forEach(({ name, value, options }) => {
              // Use Supabase's default options but ensure they're compatible
              newResponse.cookies.set(name, value, {
                ...(options || {}),
                httpOnly: options?.httpOnly ?? false,
                secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
                sameSite: options?.sameSite ?? ('lax' as const),
                path: options?.path ?? '/',
                maxAge: options?.maxAge,
              })
            })
            response = newResponse
          },
        },
      }
    )

    // Set the session using the tokens
    // This will trigger setAll to set the cookies
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Supabase setSession error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return response with cookies set
    return response
  } catch (error: any) {
    console.error('Set session error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
