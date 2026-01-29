'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { slugify } from '@/lib/utils'
import { isImageUrl, processImageUrls } from '@/lib/image-utils'
import { BlogPost, Project } from '@/types'
import { Database } from '@/types/database'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

interface BlogPostFormProps {
  post?: BlogPost
  projects: Project[]
  returnTo?: string
}

export function BlogPostForm({ post, projects, returnTo }: BlogPostFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authorName, setAuthorName] = useState<string>('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageCaptionInput, setImageCaptionInput] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const titleTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Fetch author name and verify session
  useEffect(() => {
    async function fetchAuthorName() {
      // Refresh session first to ensure it's available
      await supabase.auth.refreshSession()
      
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single() as { data: { username?: string; full_name?: string | null } | null }
        
        if (profile) {
          setAuthorName((profile as { username?: string; full_name?: string | null }).username || (profile as { username?: string; full_name?: string | null }).full_name || 'You')
        } else {
          // Check hardcoded user cookie
          const cookies = document.cookie.split(';')
          const hardcodedCookie = cookies.find(c => c.trim().startsWith('hardcoded_user='))
          if (hardcodedCookie) {
            try {
              const cookieValue = hardcodedCookie.split('=').slice(1).join('=')
              const userData = JSON.parse(decodeURIComponent(cookieValue))
              setAuthorName(userData.username || userData.email || 'You')
            } catch (e) {
              setAuthorName('You')
            }
          } else {
            setAuthorName('You')
          }
        }
      } else {
        // Check hardcoded user cookie
        const cookies = document.cookie.split(';')
        const hardcodedCookie = cookies.find(c => c.trim().startsWith('hardcoded_user='))
        if (hardcodedCookie) {
          try {
            const cookieValue = hardcodedCookie.split('=').slice(1).join('=')
            const userData = JSON.parse(decodeURIComponent(cookieValue))
            setAuthorName(userData.username || userData.email || 'You')
          } catch (e) {
            setAuthorName('You')
          }
        } else {
          setAuthorName('You')
        }
      }
      
      // Log session status for debugging
      if (!session && !user) {
        console.warn('[BlogPostForm] No session or user found on mount')
      }
    }
    fetchAuthorName()
  }, [supabase])

  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    project_id: post?.project_id || '',
    status: post?.status || 'draft',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Get user ID from Supabase auth or hardcoded user cookie
    let userId: string | null = null
    let isHardcodedUser = false
    
    // First check session, then get user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Get user error:', userError)
    }
    
    if (user) {
      userId = user.id
      console.log('[BlogPostForm] User from auth:', user.id)
    } else {
      // Check for hardcoded user cookie
      const cookies = document.cookie.split(';')
      const hardcodedCookie = cookies.find(c => c.trim().startsWith('hardcoded_user='))
      if (hardcodedCookie) {
        try {
          const cookieValue = hardcodedCookie.split('=').slice(1).join('=')
          const userData = JSON.parse(decodeURIComponent(cookieValue))
          isHardcodedUser = true
          // If cookie has a real user ID (from Supabase), use it
          if (userData.id && !userData.id.startsWith('hardcoded-')) {
            userId = userData.id
            console.log('[BlogPostForm] User from hardcoded cookie:', userId)
          }
        } catch (e) {
          console.error('Error parsing hardcoded cookie:', e)
        }
      }
      
      // If still no user, try refreshing session
      if (!userId && session) {
        console.log('[BlogPostForm] Session exists but no user, refreshing...')
        await supabase.auth.refreshSession()
        const { data: { user: refreshedUser } } = await supabase.auth.getUser()
        if (refreshedUser) {
          userId = refreshedUser.id
          console.log('[BlogPostForm] User after refresh:', userId)
        }
      }
    }

    if (!userId) {
      console.error('[BlogPostForm] No user ID found. Session:', session?.user?.id, 'User:', user?.id)
      setError('You must be logged in. Please refresh the page or log out and log back in.')
      setLoading(false)
      return
    }

    const slug = post?.slug || slugify(formData.title)

    try {
      if (post) {
        // Update existing post
        const updateData: BlogPostUpdate = {
          title: formData.title,
          content: formData.content,
          project_id: formData.project_id || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
          published_at: formData.status === 'published' && post.status === 'draft'
            ? new Date().toISOString()
            : post.published_at,
        }
        
        const { error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', post.id)

        if (error) {
          console.error('Update error:', error)
          throw new Error(`Failed to update post: ${error.message}`)
        }

      } else {
        // Create new post
        console.log('[BlogPostForm] Creating post with author_id:', userId)
        console.log('[BlogPostForm] User from auth:', user?.id)
        console.log('[BlogPostForm] Hardcoded user data:', isHardcodedUser)
        
        const { data: createdPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: formData.title,
            content: formData.content,
            project_id: formData.project_id || null,
            status: formData.status,
            slug,
            author_id: userId,
            published_at: formData.status === 'published' ? new Date().toISOString() : null,
          })
          .select()
          .single()

        if (error) {
          console.error('Create error:', error)
          throw new Error(`Failed to create post: ${error.message}`)
        }
        
        console.log('[BlogPostForm] Post created successfully:', createdPost?.id)
        console.log('[BlogPostForm] Created post author_id:', createdPost?.author_id)
      }

      // Wait a moment to ensure the database write is fully committed
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setLoading(false)
      
      // Determine redirect path
      let redirectPath: string
      if (returnTo === '/admin/moderation') {
        // If editing from admin moderation, show the post as it would be viewed
        const finalSlug = post?.slug || slug
        redirectPath = `/blogs/${finalSlug}`
      } else if (returnTo) {
        // Use returnTo if provided (e.g., from blog post page)
        redirectPath = returnTo
      } else if (post) {
        // If editing existing post, redirect to the post view page
        redirectPath = `/blogs/${post.slug}`
      } else {
        // New post: go to dashboard
        redirectPath = '/student/dashboard'
      }
      
      router.push(redirectPath)
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const textBefore = formData.content.substring(0, start)
    const textAfter = formData.content.substring(end)

    const newContent = textBefore + before + selectedText + after + textAfter
    setFormData({
      ...formData,
      content: newContent,
    })

    // Reset cursor position after state update
    setTimeout(() => {
      const newPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    }, 0)
  }

  const handleBold = () => {
    insertText('<strong>', '</strong>')
  }

  const handleItalic = () => {
    insertText('<em>', '</em>')
  }

  const handleImageUrlInsert = () => {
    if (!imageUrlInput.trim()) {
      setError('Please enter an image URL')
      return
    }

    if (!isImageUrl(imageUrlInput.trim())) {
      setError('Please enter a valid image URL (must end with .jpg, .png, .gif, .webp, etc.)')
      return
    }

    const imageUrl = imageUrlInput.trim()
    const caption = imageCaptionInput.trim()
    
    // Use alt attribute for caption if provided, otherwise use generic "Image"
    const altText = caption || 'Image'
    const imageHtml = `\n<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />\n`

    // Insert image HTML into content at cursor position
    const textarea = textareaRef.current
    if (textarea) {
      // Use stored cursor position, or current selection, or end of content
      let cursorPos: number
      if (cursorPosition !== null) {
        cursorPos = cursorPosition
      } else {
        cursorPos = textarea.selectionStart || formData.content.length
      }
      
      const textBefore = formData.content.substring(0, cursorPos)
      const textAfter = formData.content.substring(cursorPos)
      
      const newContent = textBefore + imageHtml + textAfter
      setFormData({
        ...formData,
        content: newContent,
      })

      // Reset cursor position after state update
      setTimeout(() => {
        const newPos = cursorPos + imageHtml.length
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
        // Reset stored cursor position
        setCursorPosition(null)
      }, 0)
    } else {
      // Fallback: append to end
      setFormData({
        ...formData,
        content: formData.content + imageHtml,
      })
      setCursorPosition(null)
    }

    // Clear inputs and hide
    setImageUrlInput('')
    setImageCaptionInput('')
    setShowImageInput(false)
    setError('')
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text').trim()
    
    // Check if pasted text is an image URL
    if (pastedText && isImageUrl(pastedText)) {
      e.preventDefault()
      const imageHtml = `\n<img src="${pastedText}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />\n`
      
      const textarea = e.currentTarget
      const cursorPos = textarea.selectionStart || formData.content.length
      const textBefore = formData.content.substring(0, cursorPos)
      const textAfter = formData.content.substring(cursorPos)
      
      const newContent = textBefore + imageHtml + textAfter
      setFormData({
        ...formData,
        content: newContent,
      })

      setTimeout(() => {
        const newPos = cursorPos + imageHtml.length
        textarea.setSelectionRange(newPos, newPos)
      }, 0)
    }
  }

  const contentLength = formData.content.length
  const titleLength = formData.title.length

  // Auto-grow title textarea
  useEffect(() => {
    const textarea = titleTextareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [formData.title])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Social Media Style Post Composer */}
      <Card className="border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Header - Tight and grouped */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-cornell-red flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  {post ? 'Edit Post' : 'Create Post'}
                </h2>
                <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">@{authorName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 active:text-gray-900 rounded-full p-2 hover:bg-gray-100 active:bg-gray-200 transition-all flex-shrink-0 touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title Input - Contained and structured */}
          <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-gray-400 font-medium">{titleLength}</span>
            </div>
            <textarea
              id="title"
              ref={titleTextareaRef}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Add title"
              rows={1}
              className="w-full text-lg sm:text-xl font-semibold border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all placeholder:text-gray-300 resize-none overflow-hidden"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Formatting Toolbar - Attached to content */}
          <div className="px-4 sm:px-6 py-2 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBold}
                disabled={loading}
                className="px-2.5 py-1 text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded transition-colors disabled:opacity-50 border border-transparent hover:border-gray-300"
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                onClick={handleItalic}
                disabled={loading}
                className="px-2.5 py-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded transition-colors disabled:opacity-50 border border-transparent hover:border-gray-300"
                title="Italic (Ctrl+I)"
                style={{ fontStyle: 'italic', fontFamily: 'serif' }}
              >
                I
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => {
                  // Store cursor position before opening image input
                  const textarea = textareaRef.current
                  if (textarea) {
                    setCursorPosition(textarea.selectionStart)
                  }
                  setShowImageInput(!showImageInput)
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-sm text-gray-600 hover:text-cornell-red hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Add Image</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-4 sm:px-6 py-3">

            <textarea
              id="content"
              ref={textareaRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                // Keyboard shortcuts for formatting
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') {
                    e.preventDefault()
                    handleBold()
                  } else if (e.key === 'i') {
                    e.preventDefault()
                    handleItalic()
                  }
                }
              }}
              required
              className="w-full text-sm sm:text-base border-0 focus:outline-none resize-none placeholder-gray-400 min-h-[200px] sm:min-h-[300px] text-gray-900 leading-relaxed"
              placeholder="Write something... Select text and use the formatting buttons above, or use HTML tags like &lt;strong&gt;bold&lt;/strong&gt; and &lt;em&gt;italic&lt;/em&gt;"
            />
            <div className="flex items-center justify-end mt-2">
              <span className="text-xs text-gray-400 opacity-60">{contentLength} characters</span>
            </div>
            
            {/* Image URL Input - Improved layout for big screens */}
            {showImageInput && (
              <div className="mt-4 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL <span className="text-cornell-red">*</span>
                      </label>
                      <input
                        id="image-url"
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault()
                            handleImageUrlInsert()
                          }
                        if (e.key === 'Escape') {
                          setShowImageInput(false)
                          setImageUrlInput('')
                          setImageCaptionInput('')
                          setCursorPosition(null)
                        }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red"
                        autoFocus
                      />
                    </div>
                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={handleImageUrlInsert}
                        className="w-full px-4 py-2 bg-cornell-red text-white rounded-md text-sm font-medium hover:bg-cornell-red/90 transition-colors"
                      >
                        Insert Image
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="image-caption" className="block text-sm font-medium text-gray-700 mb-2">
                      Caption <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="image-caption"
                      type="text"
                      value={imageCaptionInput}
                      onChange={(e) => setImageCaptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault()
                          handleImageUrlInsert()
                        }
                      }}
                      placeholder="Enter image caption"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Tip: Press Ctrl+Enter to insert, or paste URLs directly into the text area
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false)
                        setImageUrlInput('')
                        setImageCaptionInput('')
                        setCursorPosition(null)
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options Bar - Subtle and secondary */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Project Selector */}
              <div className="w-full sm:w-auto min-w-0 sm:min-w-[200px]">
                <label htmlFor="project_id" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Project
                </label>
                <div className="relative">
                  <select
                    id="project_id"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    required
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 pr-8 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-colors appearance-none cursor-pointer hover:border-gray-400"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.year})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Toggle - Toggle Switch Style */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs text-gray-600 font-medium">Status:</label>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      status: e.target.checked ? 'published' : 'draft' 
                    })}
                    className="sr-only"
                    id="status-toggle"
                  />
                  <label
                    htmlFor="status-toggle"
                    className={`relative inline-flex h-7 w-14 cursor-pointer items-center rounded-full transition-colors ${
                      formData.status === 'published' ? 'bg-cornell-red' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formData.status === 'published' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </label>
                  <span className={`ml-2 text-xs font-medium ${
                    formData.status === 'published' ? 'text-cornell-red' : 'text-gray-600'
                  }`}>
                    {formData.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Calm and inviting */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.project_id}
              className="w-full sm:w-auto sm:min-w-[100px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                formData.status === 'published' ? 'Publish' : 'Save Draft'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
