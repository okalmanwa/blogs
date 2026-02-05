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

        // Get user ID from Supabase auth
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('You must be logged in')
          setLoading(false)
          return
        }

        const userId = user.id

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
      <div className="text-center py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-cornell-red/10 to-cornell-red/5 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-cornell-red" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Start sharing your academic projects and experiences. Create your first post to begin documenting your journey.
          </p>
          <Link href="/student/posts/new">
            <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Create your first post
            </Button>
          </Link>
        </div>
      </div>
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
