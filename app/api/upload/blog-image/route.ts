import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let response = NextResponse.next()
  
  try {
    // Create Supabase client from request cookies (like middleware does)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Set cookies in the response
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Refresh session to ensure it's available
    await supabase.auth.refreshSession()
    
    const { data: { user } } = await supabase.auth.getUser()

    // Get user ID from Supabase auth
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const authenticatedUserId = user.id

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('project_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 })
    }


    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${authenticatedUserId}/${Date.now()}.${fileExt}`
    const filePath = `blog-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: `Upload failed: ${uploadError.message}. Please ensure you're logged in with a valid session.` 
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    // Optionally save to gallery_images table if project_id is provided
    // Note: This might fail due to RLS policies if the session isn't properly established
    // We'll catch and ignore the error since the image upload itself succeeded
    if (projectId && authenticatedUserId) {
      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          url: publicUrl,
          author_id: authenticatedUserId,
          project_id: projectId,
        })
      
      // Log error but don't fail the request - the image was uploaded successfully
      if (insertError) {
        console.warn('Failed to insert gallery image (RLS policy may be blocking):', insertError.message)
      }
    }

    const jsonResponse = NextResponse.json({ url: publicUrl })
    
    // Copy any cookies that were set during the request
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return jsonResponse
  } catch (error: any) {
    const errorResponse = NextResponse.json({ error: error.message }, { status: 500 })
    
    // Copy any cookies that were set during the request
    response.cookies.getAll().forEach((cookie) => {
      errorResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return errorResponse
  }
}
