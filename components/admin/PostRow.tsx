'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface PostRowProps {
  post: {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    status: 'draft' | 'published'
    created_at: string
    author?: {
      username?: string | null
    } | null
  }
}

export function PostRow({ post }: PostRowProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const statusConfig = {
    published: {
      label: 'Published',
      dotColor: 'bg-green-500'
    },
    draft: {
      label: 'Draft',
      dotColor: 'bg-amber-500'
    }
  }

  const status = statusConfig[post.status] || statusConfig.draft

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
        .eq('id', post.id)

      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete post: ${error.message}`)
        setIsDeleting(false)
      } else {
        // Refresh the page to update the list
        router.refresh()
      }
    } catch (err: any) {
      console.error('Delete exception:', err)
      alert(`Failed to delete post: ${err.message || 'Unknown error'}`)
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="group px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 last:border-b-0 bg-white even:bg-gray-50/30 hover:bg-gray-100/50 transition-colors">
        {/* Mobile Layout - Card style */}
        <div className="md:hidden space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/blogs/${post.slug}`} className="flex-1 min-w-0 group-hover:text-cornell-red transition-colors">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-snug mb-1">
                {post.title}
              </h3>
            </Link>
            {/* Status badge - Mobile */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
              <span className="text-xs text-gray-500">{status.label}</span>
            </div>
          </div>
          
          {post.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>{post.author?.username || 'Anonymous'}</span>
            <span className="flex-shrink-0 ml-2">{formatDate(post.created_at)}</span>
          </div>

          {/* Actions - Always visible on mobile for touch */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Link href={`/student/posts/edit/${post.id}?returnTo=/admin/moderation`} className="flex-1">
              <button className="w-full text-sm text-gray-600 hover:text-cornell-red transition-colors py-1.5 px-3 rounded-md hover:bg-gray-50">
                Edit
              </button>
            </Link>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 py-1.5 px-3 rounded-md hover:bg-red-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Desktop Layout - Table row style */}
        <div className="hidden md:flex items-center gap-4 md:gap-6 min-w-0">
          {/* Left: Title and excerpt */}
          <div className="flex-1 min-w-0">
            <Link href={`/blogs/${post.slug}`} className="block group-hover:text-cornell-red transition-colors">
              <h3 className="text-base font-medium text-gray-900 mb-0.5 truncate">
                {post.title}
              </h3>
            </Link>
            {post.excerpt && (
              <p className="text-sm text-gray-500 truncate">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Center: Author */}
          <div className="flex-shrink-0 w-28 md:w-32">
            <span className="text-sm text-gray-500 truncate block">
              {post.author?.username || 'Anonymous'}
            </span>
          </div>

          {/* Center-right: Date */}
          <div className="flex-shrink-0 w-20 md:w-24 text-right">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatDate(post.created_at)}
            </span>
          </div>

          {/* Right: Status */}
          <div className="flex-shrink-0 w-16 md:w-20 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
              <span className="text-sm text-gray-500 whitespace-nowrap">{status.label}</span>
            </div>
          </div>

          {/* Actions - always visible */}
          <div className="flex items-center gap-2 flex-shrink-0 w-20 md:w-24">
            <Link href={`/student/posts/edit/${post.id}?returnTo=/admin/moderation`}>
              <button className="text-sm text-gray-600 hover:text-cornell-red transition-colors whitespace-nowrap">
                Edit
              </button>
            </Link>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Post</h3>
            <p className="text-sm text-gray-600 mb-4 break-words">
              Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
