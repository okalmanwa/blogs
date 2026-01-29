import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData } = body

    if (!userData || !userData.role) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
    }

    // Set cookie server-side with proper attributes
    const cookieValue = encodeURIComponent(JSON.stringify(userData))
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('hardcoded_user', cookieValue, {
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access if needed
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
