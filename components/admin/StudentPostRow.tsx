'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface StudentPostRowProps {
  post: {
    id: string
    title: string
    slug: string
    status: 'draft' | 'published'
    created_at: string
    project?: {
      name: string
    } | null
  }
  onDelete?: (postId: string, postTitle: string) => void
  isDeleting?: boolean
}

export function StudentPostRow({ post, onDelete, isDeleting }: StudentPostRowProps) {
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

  return (
    <div className="group px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 last:border-b-0 bg-white even:bg-gray-50/30 hover:bg-gray-100/50 transition-colors">
      {/* Mobile Layout - Card style */}
      <div className="md:hidden space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/blogs/${post.slug}`} className="flex-1 min-w-0 group-hover:text-cornell-red transition-colors">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-snug">
              {post.title}
            </h3>
          </Link>
          {/* Status badge - Mobile */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${status.dotColor}`} />
            <span className="text-xs text-gray-500">{status.label}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <span className="truncate">{post.project?.name || 'No project'}</span>
          <span className="flex-shrink-0 ml-2">{formatDate(post.created_at)}</span>
        </div>

        {/* Actions - Always visible on mobile for touch */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <Link href={`/student/posts/edit/${post.id}`} className="flex-1">
            <button className="w-full text-sm text-gray-600 hover:text-cornell-red transition-colors py-1.5 px-3 rounded-md hover:bg-gray-50">
              Edit
            </button>
          </Link>
          {onDelete && (
            <button 
              onClick={() => onDelete(post.id, post.title)}
              disabled={isDeleting}
              className="flex-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 py-1.5 px-3 rounded-md hover:bg-red-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* Desktop Layout - Table row style */}
      <div className="hidden md:flex items-center gap-4 md:gap-6">
        {/* Left: Title */}
        <div className="flex-1 min-w-0">
          <Link href={`/blogs/${post.slug}`} className="block group-hover:text-cornell-red transition-colors">
            <h3 className="text-base font-medium text-gray-900 mb-0.5">
              {post.title}
            </h3>
          </Link>
        </div>

        {/* Center: Project */}
        <div className="flex-shrink-0 w-32 md:w-40">
          <span className="text-sm text-gray-500 truncate block">
            {post.project?.name || '—'}
          </span>
        </div>

        {/* Center-right: Date */}
        <div className="flex-shrink-0 w-24 md:w-28 text-right">
          <span className="text-sm text-gray-500">
            {formatDate(post.created_at)}
          </span>
        </div>

        {/* Right: Status */}
        <div className="flex-shrink-0 w-20 md:w-24 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
            <span className="text-sm text-gray-500">{status.label}</span>
          </div>
        </div>

        {/* Actions - hidden until hover on desktop */}
        <div className="flex items-center gap-2 flex-shrink-0 w-24 md:w-32 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/student/posts/edit/${post.id}`}>
            <button className="text-sm text-gray-600 hover:text-cornell-red transition-colors">
              Edit
            </button>
          </Link>
          {onDelete && (
            <button 
              onClick={() => onDelete(post.id, post.title)}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
