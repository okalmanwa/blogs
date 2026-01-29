import { createClient } from '@/lib/supabase/server'
import { BlogPostWithAuthor } from '@/types'
import { SearchForm } from '@/components/blog/SearchForm'
import { FilterSidebar } from '@/components/blog/FilterSidebar'
import { SortMenu } from '@/components/blog/SortMenu'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { cookies } from 'next/headers'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { project?: string; search?: string; sort?: string; projectStatus?: string; page?: string }
}) {
  const supabase = createClient()
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = cookies()
  const hardcodedUserCookie = cookieStore.get('hardcoded_user')
  let isAdmin = false
  
  if (hardcodedUserCookie) {
    try {
      const hardcodedUser = JSON.parse(decodeURIComponent(hardcodedUserCookie.value))
      isAdmin = hardcodedUser.role === 'admin'
    } catch (e) {
      // Invalid cookie
    }
  } else if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }
    isAdmin = (profile as { role?: string } | null)?.role === 'admin'
  }

  // Pagination
  const postsPerPage = 5
  const currentPage = parseInt(searchParams.page || '1', 10)
  const offset = (currentPage - 1) * postsPerPage

  // If filtering by project status, get project IDs first
  let projectIds: string[] | null = null
  if (searchParams.projectStatus) {
    const result = await supabase
      .from('projects')
      .select('id')
      .eq('status', searchParams.projectStatus)
    const filteredProjects = (result.data || []) as { id: string }[]
    
    if (filteredProjects && filteredProjects.length > 0) {
      projectIds = filteredProjects.map(p => p.id)
    } else {
      // No projects with this status, return empty
      projectIds = []
    }
  }

  // Build query for counting total posts
  let countQuery = supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Build query for fetching posts
  let query = supabase
    .from('blog_posts')
    .select('*, author:profiles(*), project:projects(*)')
    .eq('status', 'published')

  // Apply sorting
  const sortOrder = searchParams.sort === 'oldest' ? 'asc' : 'desc'
  query = query.order('published_at', { ascending: sortOrder === 'asc' })

  if (searchParams.project) {
    query = query.eq('project_id', searchParams.project)
    countQuery = countQuery.eq('project_id', searchParams.project)
  }

  // Filter by project status (open/closed)
  if (projectIds !== null) {
    if (projectIds.length === 0) {
      // No projects with this status, return empty result
      query = query.eq('project_id', '00000000-0000-0000-0000-000000000000') // Non-existent ID
      countQuery = countQuery.eq('project_id', '00000000-0000-0000-0000-000000000000')
    } else {
      query = query.in('project_id', projectIds)
      countQuery = countQuery.in('project_id', projectIds)
    }
  }

  if (searchParams.search) {
    const searchFilter = `title.ilike.%${searchParams.search}%,content.ilike.%${searchParams.search}%,excerpt.ilike.%${searchParams.search}%`
    query = query.or(searchFilter)
    countQuery = countQuery.or(searchFilter)
  }

  // Get total count and posts
  const [{ count }, { data: posts }] = await Promise.all([
    countQuery,
    query.range(offset, offset + postsPerPage - 1)
  ])

  const totalPages = count ? Math.ceil(count / postsPerPage) : 0

  // Get only active projects for sidebar filter
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'open')
    .order('year', { ascending: false })

  // Get recent posts for sidebar
  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  // Helper function to estimate read time
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]*>/g, '') // Strip HTML tags
    const wordCount = textContent.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return minutes
  }

  // Helper function to strip HTML and get plain text
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 md:py-10">
        {/* Title at top - Mobile optimized */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-cornell-red tracking-tight mb-1 sm:mb-2">
            SMART Student Blog
          </h1>
          <p className="text-xs sm:text-base text-gray-500 sm:text-gray-600 leading-tight sm:leading-normal line-clamp-1 sm:line-clamp-none">Discover insights and stories from the SMART Program</p>
        </div>

        {/* Filters and Search - Mobile-first responsive, no wrapping */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - Flexible width, no wrapping */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <SearchForm currentSearch={searchParams.search} />
            </div>
            {/* Filter Sidebar Button - Mobile only, no wrapping */}
            <div className="flex-shrink-0 md:hidden">
              <FilterSidebar projects={projects || []} currentProject={searchParams.project} />
            </div>
            {/* Sort button - Desktop only */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <SortMenu />
            </div>
          </div>
        </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Posts Feed */}
        <div className="flex-1 min-w-0 w-full">
          {posts && posts.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/60 overflow-hidden">
              <div>
                {posts.map((post: BlogPostWithAuthor, index: number) => {
                  const readTime = estimateReadTime(post.content || '')
                  const plainTextContent = stripHtml(post.content || '')
                  const isNewestFirst = searchParams.sort !== 'oldest'
                  const isLead = index === 0 && isNewestFirst && currentPage === 1
                  // Add thicker divider every 4 posts for visual rhythm (skip first post)
                  const hasThickerDivider = index > 0 && index % 4 === 0
                  const dividerClass = index === 0 
                    ? 'pb-3 sm:pb-4' 
                    : hasThickerDivider 
                      ? 'border-t border-gray-300/70 pt-3 sm:pt-4' 
                      : 'border-t border-gray-300/50 pt-2 sm:pt-2.5'
                  return (
                    <div key={post.id} className={dividerClass}>
                      <BlogPostCard 
                        post={post} 
                        readTime={readTime} 
                        plainTextContent={plainTextContent}
                        isLead={isLead}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-5 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <a
                        href={`/?${new URLSearchParams({
                          ...searchParams,
                          page: String(currentPage - 1)
                        }).toString()}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-white hover:bg-cornell-red border border-gray-300 rounded-lg hover:border-cornell-red transition-all duration-200"
                      >
                        Previous
                      </a>
                    )}
                    {currentPage < totalPages && (
                      <a
                        href={`/?${new URLSearchParams({
                          ...searchParams,
                          page: String(currentPage + 1)
                        }).toString()}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-white hover:bg-cornell-red border border-gray-300 rounded-lg hover:border-cornell-red transition-all duration-200"
                      >
                        Next
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/60">
              <div className="text-center py-20 px-6">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-10 h-10 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    No posts found
                  </h3>
                  {(searchParams.search || searchParams.project) ? (
                    <>
                      <p className="text-gray-600 mb-6">
                        We couldn&apos;t find any posts matching your current filters.
                      </p>
                      <a
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-cornell-red hover:bg-cornell-red/90 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Clear filters
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </a>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      Check back soon for new posts from the SMART Program.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Enhanced styling */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8 space-y-5">
            {/* Recent Posts - Titles only */}
            {recentPosts && recentPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200/60 p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Recent Posts</h3>
                <div className="space-y-0">
                  {recentPosts.map((post: any, index: number) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className={`block py-2.5 group transition-colors duration-200 ${
                        index > 0 ? 'border-t border-gray-100' : ''
                      }`}
                    >
                      <p className="text-xs text-gray-600 group-hover:text-cornell-red leading-snug line-clamp-2 transition-colors duration-200">
                        {post.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Projects - Filter links (click = filter feed) */}
            {projects && projects.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200/60 p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">Projects</h3>
                <div className="space-y-0">
                  {projects.slice(0, 10).map((project: any, index: number) => {
                    const isActive = searchParams.project === project.id
                    return (
                      <Link
                        key={project.id}
                        href={isActive ? '/' : `/?project=${project.id}`}
                        className={`block py-2.5 transition-colors duration-200 ${
                          index > 0 ? 'border-t border-gray-100' : ''
                        } ${
                          isActive 
                            ? 'text-cornell-red font-semibold' 
                            : 'text-gray-600 hover:text-cornell-red'
                        }`}
                        title={project.name}
                      >
                        <span className="text-xs leading-snug line-clamp-1 block">
                          {project.name}
                        </span>
                      </Link>
                    )
                  })}
                  {projects.length > 10 && (
                    <Link
                      href="/projects"
                      className="block text-xs text-gray-500 hover:text-cornell-red transition-colors pt-3 mt-2 border-t border-gray-200 font-medium"
                    >
                      View all →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
      </div>
    </div>
  )
}
