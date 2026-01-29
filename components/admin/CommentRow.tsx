'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface CommentRowProps {
  comment: {
    id: string
    content: string
    created_at: string
    author?: {
      username?: string | null
    } | null
    blog_post?: {
      title: string
      slug: string
    } | null
  }
}

export function CommentRow({ comment }: CommentRowProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const handleEditClick = () => {
    setIsEditing(true)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', comment.id)

      if (error) {
        console.error('Update error:', error)
        alert(`Failed to update comment: ${error.message}`)
        setIsDeleting(false)
      } else {
        setIsEditing(false)
        setIsDeleting(false)
        router.refresh()
      }
    } catch (err: any) {
      console.error('Update exception:', err)
      alert(`Failed to update comment: ${err.message || 'Unknown error'}`)
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setShowDeleteConfirm(false)

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id)

      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete comment: ${error.message}`)
        setIsDeleting(false)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      console.error('Delete exception:', err)
      alert(`Failed to delete comment: ${err.message || 'Unknown error'}`)
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
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red"
                rows={3}
                disabled={isDeleting}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isDeleting || !editContent.trim()}
                  className="flex-1 text-xs px-3 py-2 bg-cornell-red text-white rounded-md hover:bg-cornell-red/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isDeleting}
                  className="flex-1 text-xs px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-1.5 break-words">
                {comment.content}
              </p>
              {comment.blog_post && (
                <Link href={`/blogs/${comment.blog_post.slug}`}>
                  <span className="text-xs text-gray-500 hover:text-cornell-red transition-colors">
                    Post: {comment.blog_post.title}
                  </span>
                </Link>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>{comment.author?.username || 'Anonymous'}</span>
                <span className="flex-shrink-0 ml-2">{formatDate(comment.created_at)}</span>
              </div>
              {/* Actions - Always visible on mobile */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleEditClick}
                  disabled={isDeleting}
                  className="flex-1 text-sm text-gray-600 hover:text-cornell-red transition-colors disabled:opacity-50 py-1.5 px-3 rounded-md hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 py-1.5 px-3 rounded-md hover:bg-red-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Desktop Layout - Table row style */}
        <div className="hidden md:flex items-start gap-4 md:gap-6 min-w-0">
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-cornell-red"
                  rows={3}
                  disabled={isDeleting}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isDeleting || !editContent.trim()}
                    className="text-xs px-3 py-1 bg-cornell-red text-white rounded-md hover:bg-cornell-red/90 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isDeleting}
                    className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-1.5 break-words">
                  {comment.content}
                </p>
                {comment.blog_post && (
                  <Link href={`/blogs/${comment.blog_post.slug}`}>
                    <span className="text-xs text-gray-500 hover:text-cornell-red transition-colors truncate block">
                      Post: {comment.blog_post.title}
                    </span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Center: Author */}
          <div className="flex-shrink-0 w-28 md:w-32">
            <span className="text-sm text-gray-500 truncate block">
              {comment.author?.username || 'Anonymous'}
            </span>
          </div>

          {/* Right: Date */}
          <div className="flex-shrink-0 w-20 md:w-24 text-right">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Actions - always visible */}
          {!isEditing && (
            <div className="flex items-center gap-2 flex-shrink-0 w-20 md:w-24 opacity-100">
              <button
                onClick={handleEditClick}
                disabled={isDeleting}
                className="text-sm text-gray-600 hover:text-cornell-red transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Comment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this comment? This action cannot be undone.
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
