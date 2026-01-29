'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog'
import { StudentPostRow } from '@/components/admin/StudentPostRow'
import { BlogPost } from '@/types'

export function StudentPostsList() {
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        setError(null)

        // Get user ID from Supabase auth or hardcoded user cookie
        const { data: { user } } = await supabase.auth.getUser()
        let userId: string | null = null

        if (user) {
          userId = user.id
        } else {
          // Check for hardcoded user cookie
          const cookies = document.cookie.split(';')
          const hardcodedCookie = cookies.find(c => c.trim().startsWith('hardcoded_user='))
          if (hardcodedCookie) {
            try {
              const cookieValue = hardcodedCookie.split('=').slice(1).join('=')
              const userData = JSON.parse(decodeURIComponent(cookieValue))
              if (userData.id && !userData.id.startsWith('hardcoded-')) {
                userId = userData.id
              }
            } catch (e) {
              // Invalid cookie
            }
          }
        }

        if (!userId) {
          setError('You must be logged in')
          setLoading(false)
          return
        }

        // Fetch posts using browser client (has session, so RLS allows drafts)
        const { data: fetchedPosts, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*, project:projects(*)')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (fetchError) {
          console.error('Error fetching posts:', fetchError)
          setError(fetchError.message)
        } else {
          setPosts(fetchedPosts || [])
        }
      } catch (err: any) {
        console.error('Error in fetchPosts:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [supabase])

  const handleDeleteClick = (postId: string, postTitle: string) => {
    setDeleteConfirm({ id: postId, title: postTitle })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    const { id: postId, title: postTitle } = deleteConfirm
    setDeletingId(postId)
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete post: ${error.message}`)
        setDeletingId(null)
        setDeleteConfirm(null)
      } else {
        // Remove the post from the list
        setPosts(posts.filter(p => p.id !== postId))
        setDeletingId(null)
        setDeleteConfirm(null)
      }
    } catch (err: any) {
      console.error('Delete exception:', err)
      alert(`Failed to delete post: ${err.message || 'Unknown error'}`)
      setDeletingId(null)
      setDeleteConfirm(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Header row - Hidden on mobile */}
        <div className="hidden md:block px-4 md:px-6 py-2.5 bg-gray-50/50 border-b border-gray-200">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
            </div>
            <div className="flex-shrink-0 w-32 md:w-40">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project</span>
            </div>
            <div className="flex-shrink-0 w-24 md:w-28 text-right">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
            </div>
            <div className="flex-shrink-0 w-20 md:w-24 text-right">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
            </div>
            <div className="flex-shrink-0 w-24 md:w-32"></div>
          </div>
        </div>
        {/* Loading skeleton rows */}
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 last:border-b-0 bg-white even:bg-gray-50/30 animate-pulse">
              {/* Mobile layout */}
              <div className="md:hidden space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden md:flex items-center gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                </div>
                <div className="flex-shrink-0 w-32 md:w-40">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex-shrink-0 w-24 md:w-28 text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                </div>
                <div className="flex-shrink-0 w-20 md:w-24 text-right">
                  <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                </div>
                <div className="flex-shrink-0 w-24 md:w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-600 mb-2">No posts yet.</p>
        <Link href="/student/posts/new" className="text-cornell-red hover:underline font-medium">
          Create your first post
        </Link>
      </Card>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header row - Hidden on mobile, shown on md+ */}
      <div className="hidden md:block px-4 md:px-6 py-2.5 bg-gray-50/50 border-b border-gray-200">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
          </div>
          <div className="flex-shrink-0 w-32 md:w-40">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project</span>
          </div>
          <div className="flex-shrink-0 w-24 md:w-28 text-right">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
          </div>
          <div className="flex-shrink-0 w-20 md:w-24 text-right">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
          </div>
          <div className="flex-shrink-0 w-24 md:w-32"></div>
        </div>
      </div>
      {/* Post rows */}
      <div>
        {posts.map((post: any) => (
          <StudentPostRow 
            key={post.id} 
            post={post} 
            onDelete={handleDeleteClick}
            isDeleting={deletingId === post.id}
          />
        ))}
      </div>
      
      {deleteConfirm && (
        <DeleteConfirmDialog
          title={`Delete "${deleteConfirm.title}"?`}
          message="This will permanently remove the post. This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deletingId === deleteConfirm.id}
        />
      )}
    </div>
  )
}
