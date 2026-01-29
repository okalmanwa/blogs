'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BlogPostWithAuthor } from '@/types'

interface BlogPostCardProps {
  post: BlogPostWithAuthor
  readTime: number
  plainTextContent: string
  isLead?: boolean
}

export function BlogPostCard({ post, readTime, plainTextContent, isLead = false }: BlogPostCardProps) {

  // Extract preview - much longer for lead post, shorter for others
  const getPreview = () => {
    const maxLength = isLead ? 120 : 45
    const sentenceEndMax = isLead ? 120 : 50
    
    // Find first sentence (period, exclamation, question mark)
    const sentenceEnd = plainTextContent.search(/[.!?]\s/)
    if (sentenceEnd > 0 && sentenceEnd <= sentenceEndMax) {
      return plainTextContent.substring(0, sentenceEnd + 1)
    }
    // Otherwise, take first ~maxLength characters and cut mid-thought if necessary
    if (plainTextContent.length <= maxLength) return plainTextContent
    const truncated = plainTextContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    const minLength = isLead ? 80 : 30
    return lastSpace > minLength ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }

  const preview = getPreview()

  return (
    <>
      <div className="relative group">
        <Link href={`/blogs/${post.slug}`} className="block cursor-pointer">
          <article 
            className={`relative transition-colors duration-150 border-l-2 ${
              isLead 
                ? 'px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50/60 via-gray-50/40 to-transparent border-cornell-red/30 hover:from-gray-50/80 hover:via-gray-50/60' 
                : 'px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-50/20 border-transparent hover:bg-gray-50/40 hover:border-gray-300/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                {/* Latest label - above title */}
                {isLead && (
                  <div className="mb-1 sm:mb-1.5">
                    <span className="inline-block text-[10px] sm:text-xs font-semibold text-cornell-red uppercase tracking-wider">
                      Latest
                    </span>
                  </div>
                )}
                
                {/* Title */}
                <h2 className={`font-serif font-semibold text-gray-900 leading-tight line-clamp-2 ${
                  isLead ? 'text-lg sm:text-2xl mb-1 sm:mb-1.5' : 'text-base sm:text-lg mb-1'
                }`}>
                  {post.title || 'Untitled Post'}
                </h2>

                {/* Preview - Limited to 2 lines max on mobile */}
                <p className={`text-gray-500 leading-snug sm:leading-relaxed ${
                  isLead ? 'text-sm sm:text-base mb-1.5 sm:mb-2.5 line-clamp-2 sm:line-clamp-3' : 'text-xs sm:text-sm mb-1 line-clamp-2 sm:line-clamp-1'
                }`}>
                  {preview}
                </p>

                {/* Metadata - Smaller, lower contrast */}
                <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                  isLead 
                    ? 'text-gray-400 sm:text-gray-500 opacity-100' 
                    : 'text-gray-400 opacity-60 sm:opacity-0 sm:group-hover:opacity-100'
                } transition-opacity`}>
                  <span>{post.author?.username || 'Anonymous'}</span>
                  <span>·</span>
                  <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
                  <span>·</span>
                  <span>{readTime} min</span>
                </div>
              </div>
              
              {/* Arrow indicator - Aligned with title, smaller on mobile */}
              <div className="flex-shrink-0 pt-0.5 sm:pt-0">
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-cornell-red transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </article>
        </Link>
      </div>
    </>
  )
}
