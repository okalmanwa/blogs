import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { processImageUrls } from '@/lib/image-utils'
import { Card } from '@/components/ui/Card'
import { CommentsSection } from '@/components/blog/CommentsSection'
import { PostActions } from '@/components/blog/PostActions'
import { cookies } from 'next/headers'

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, author:profiles(*), project:projects(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  // Get current user to check if they can edit/delete
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for hardcoded user
  const cookieStore = cookies()
  const hardcodedUserCookie = cookieStore.get('hardcoded_user')
  let hardcodedUser = null
  if (hardcodedUserCookie) {
    try {
      hardcodedUser = JSON.parse(decodeURIComponent(hardcodedUserCookie.value))
    } catch (e) {
      // Invalid cookie
    }
  }

  // Determine current user ID and check if admin
  let currentUserId: string | null = null
  let isAdmin = false
  
  if (user) {
    currentUserId = user.id
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  } else if (hardcodedUser) {
    currentUserId = hardcodedUser.id
    isAdmin = hardcodedUser.role === 'admin'
  }
  
  // Pass admin status to PostActions - admins can edit/delete any post
  const canEdit = currentUserId && (currentUserId === post.author_id || isAdmin)

  // Estimate reading time
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]*>/g, '')
    const wordCount = textContent.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const readTime = estimateReadTime(post.content || '')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
      <div className="flex gap-8">
        {/* Main Article Column - Constrained width */}
        <article className="flex-1 max-w-[720px] mx-auto">
          {/* Article Header Zone */}
          <header className="mb-8">
            {/* Back Link - Pulled closer to title */}
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm mb-3 inline-block transition-colors">
              ← Back to Blog
            </Link>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-cornell-dark-gray leading-tight mb-4">
              {post.title}
            </h1>
            
            {/* Metadata - Compressed, single line */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-3 flex-wrap">
              <span>By {post.author?.username || 'Anonymous'}</span>
              {post.published_at && (
                <>
                  <span>·</span>
                  <span>{formatDate(post.published_at)}</span>
                </>
              )}
              <span>·</span>
              <span>{readTime} min read</span>
              {post.project && (
                <>
                  <span>·</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {post.project.name}
                  </span>
                </>
              )}
            </div>

            {/* Actions - Subtle, secondary */}
            {canEdit && (
              <div className="mb-6">
                <PostActions 
                  postId={post.id} 
                  postSlug={post.slug}
                  authorId={post.author_id}
                  currentUserId={currentUserId}
                />
              </div>
            )}

            {/* Thin Divider - After metadata and actions */}
            <div className="border-t border-gray-200 pt-4"></div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-reading mx-auto
            prose-headings:text-gray-900 prose-headings:font-serif prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-headings:text-2xl
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-[1.7] prose-p:mb-6 prose-p:text-[18px] prose-p:font-serif
            prose-a:text-gray-700 prose-a:no-underline prose-a:border-b prose-a:border-gray-300 hover:prose-a:border-gray-500
            prose-strong:text-gray-900 prose-strong:font-semibold prose-strong:font-serif
            prose-em:italic prose-em:font-serif
            prose-ul:my-6 prose-ol:my-6 prose-li:my-3 prose-li:leading-[1.7] prose-li:font-serif
            prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-6 prose-blockquote:font-serif
            prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-code:font-sans
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:my-6 prose-pre:font-sans
            [&_figure]:my-10 [&_figure_img]:max-w-full [&_figure_figcaption]:text-center [&_figure_figcaption]:text-sm [&_figure_figcaption]:text-gray-600 [&_figure_figcaption]:mt-3 [&_figure_figcaption]:italic [&_figure_figcaption]:font-serif"
          >
            <div dangerouslySetInnerHTML={{ __html: processImageUrls(post.content) }} />
          </article>

          {/* Comments Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <CommentsSection postId={post.id} />
          </div>
        </article>

        {/* Reading Aid Sidebar (Desktop only) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 pt-24">
          <div className="sticky top-8 space-y-6">
            {/* Reading Time */}
            <div className="text-sm">
              <div className="text-gray-500 mb-1">Reading time</div>
              <div className="text-gray-900 font-medium">{readTime} min</div>
            </div>

            {/* Project Link */}
            {post.project && (
              <div className="text-sm">
                <div className="text-gray-500 mb-1">Project</div>
                <Link
                  href={`/?project=${post.project.id}`}
                  className="text-gray-700 hover:text-gray-900 font-medium hover:underline"
                >
                  {post.project.name}
                </Link>
              </div>
            )}

            {/* Author */}
            <div className="text-sm">
              <div className="text-gray-500 mb-1">Author</div>
              <div className="text-gray-900 font-medium">{post.author?.username || 'Anonymous'}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
