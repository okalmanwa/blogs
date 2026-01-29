'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog'

interface PostActionsProps {
  postId: string
  postSlug: string
  authorId: string
  currentUserId: string | null
}

export function PostActions({ postId, postSlug, authorId, currentUserId }: PostActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [canEdit, setCanEdit] = useState(() => {
    // Initial check: if server provided user ID matches author, show immediately
    return !!(currentUserId && currentUserId === authorId)
  })

  // Check on client side as well to ensure we have the correct user
  useEffect(() => {
    async function checkUser() {
      // First check server-provided user ID
      if (currentUserId && currentUserId === authorId) {
        setCanEdit(true)
        return
      }

      // Fallback: check client-side
      const { data: { user } } = await supabase.auth.getUser()
      let userId: string | null = null
      let isAdmin = false

      if (user) {
        userId = user.id
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        isAdmin = profile?.role === 'admin'
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
            isAdmin = userData.role === 'admin'
          } catch (e) {
            // Invalid cookie
          }
        }
      }

      // Check if user is the author OR admin
      if (userId && (userId === authorId || isAdmin)) {
        setCanEdit(true)
      } else if (currentUserId || userId) {
        // Only set to false if we actually checked and user doesn't match
        // Don't set false if we haven't checked yet (to avoid flicker)
        setCanEdit(false)
      }
    }

    // Always run the check
    checkUser()
  }, [currentUserId, authorId, supabase])

  // Don't render if user can't edit
  if (!canEdit) {
    return null
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setShowDeleteConfirm(false)

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
        setIsDeleting(false)
        return
      }

      // Redirect to home page after successful deletion
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href={`/student/posts/edit/${postId}?returnTo=/blogs/${postSlug}`}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          title="Edit post"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </Link>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete post"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
