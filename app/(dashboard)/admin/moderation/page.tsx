import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { RefreshButton } from '@/components/ui/RefreshButton'
import { PostRow } from '@/components/admin/PostRow'
import { CommentRow } from '@/components/admin/CommentRow'
import { FilterSidebar } from '@/components/blog/FilterSidebar'
import { SortMenu } from '@/components/blog/SortMenu'

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: { project?: string; sort?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') {
    redirect('/student/dashboard')
  }

  // Get all projects for filter
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('year', { ascending: false })

  // Build query for posts with filters and sorting
  let postsQuery = supabase
    .from('blog_posts')
    .select('*, author:profiles(*), project:projects(*)')

  // Apply project filter
  if (searchParams.project) {
    postsQuery = postsQuery.eq('project_id', searchParams.project)
  }

  // Apply sorting (default to latest/newest)
  const sortOrder = searchParams.sort === 'oldest' ? 'asc' : 'desc'
  postsQuery = postsQuery.order('created_at', { ascending: sortOrder === 'asc' })

  // Get all posts (including drafts) with filters and sorting
  const { data: posts, error: postsError } = await postsQuery.limit(100)

  // Get all comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*, author:profiles(*), blog_post:blog_posts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Log errors for debugging
  if (postsError) {
    console.error('[Admin Moderation] Error fetching posts:', postsError)
  }
  if (commentsError) {
    console.error('[Admin Moderation] Error fetching comments:', commentsError)
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 relative">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Content Moderation</h1>
        <div className="flex-shrink-0 ml-2">
          <RefreshButton />
        </div>
      </div>

      {/* Posts */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Posts</h2>
          <div className="flex items-center">
            {/* Filter Sidebar - Mobile only */}
            <div className="md:hidden">
              <FilterSidebar projects={projects || []} currentProject={searchParams.project} />
            </div>
            {/* Sort button - Desktop only */}
            <div className="hidden md:flex items-center gap-3">
              <SortMenu />
            </div>
          </div>
        </div>
        {postsError && (
          <Card className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800">
            <p className="font-semibold mb-2">Unable to load posts</p>
            <p className="text-sm">{postsError.message || 'An unexpected error occurred'}</p>
          </Card>
        )}
        {!postsError && posts && posts.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-full">
            {/* Header row - Hidden on mobile */}
            <div className="hidden md:block px-4 md:px-6 py-2.5 bg-gray-50/50 border-b border-gray-200 overflow-x-auto">
              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
                </div>
                <div className="flex-shrink-0 w-28 md:w-32">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Author</span>
                </div>
                <div className="flex-shrink-0 w-20 md:w-24 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                </div>
                <div className="flex-shrink-0 w-16 md:w-20 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                </div>
                <div className="flex-shrink-0 w-20 md:w-24">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</span>
                </div>
              </div>
            </div>
            {/* Post rows */}
            <div>
              {posts.map((post: any) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : !postsError ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No posts found.</p>
          </Card>
        ) : null}
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Comments</h2>
        {commentsError && (
          <Card className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800">
            <p className="font-semibold mb-2">Unable to load comments</p>
            <p className="text-sm">{commentsError.message || 'An unexpected error occurred'}</p>
          </Card>
        )}
        {!commentsError && comments && comments.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-full">
            {/* Header row - Hidden on mobile */}
            <div className="hidden md:block px-4 md:px-6 py-2.5 bg-gray-50/50 border-b border-gray-200 overflow-x-auto">
              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comment</span>
                </div>
                <div className="flex-shrink-0 w-28 md:w-32">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Author</span>
                </div>
                <div className="flex-shrink-0 w-20 md:w-24 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                </div>
                <div className="flex-shrink-0 w-20 md:w-24">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</span>
                </div>
              </div>
            </div>
            {/* Comment rows */}
            <div>
              {comments.map((comment: any) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        ) : !commentsError ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">No comments found.</p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
