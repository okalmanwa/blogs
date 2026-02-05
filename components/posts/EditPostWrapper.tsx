'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BlogPostForm } from '@/components/forms/BlogPostForm'
import { Card } from '@/components/ui/Card'
import { Project } from '@/types'

interface EditPostWrapperProps {
  postId: string
  returnTo?: string
}

export function EditPostWrapper({ postId, returnTo }: EditPostWrapperProps) {
  const supabase = createClient()
  const [post, setPost] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Get user ID to verify ownership
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('You must be logged in')
          setLoading(false)
          return
        }

        const userId = user.id

        // Fetch post using browser client (has session, so RLS allows drafts)
        const { data: fetchedPost, error: postError } = await (supabase
          .from('blog_posts') as any)
          .select('*')
          .eq('id', postId)
          .single()

        if (postError) {
          console.error('Error fetching post:', postError)
          setError(postError.message)
          setLoading(false)
          return
        }

        if (!fetchedPost) {
          setError('Post not found')
          setLoading(false)
          return
        }

        // Check if user owns the post
        if (fetchedPost.author_id !== userId) {
          // Check if user is admin
          const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('role')
            .eq('id', userId)
            .single()

          if (profile?.role !== 'admin') {
            setError('You do not have permission to edit this post')
            setLoading(false)
            return
          }
        }

        // Fetch projects
        const { data: fetchedProjects } = await (supabase
          .from('projects') as any)
          .select('*')
          .order('year', { ascending: false })

        setPost(fetchedPost)
        setProjects(fetchedProjects || [])
      } catch (err: any) {
        console.error('Error in fetchData:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [postId, supabase])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          
          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-3 justify-end">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="text-center text-red-600 py-8">Error: {error}</p>
      </Card>
    )
  }

  if (!post) {
    return (
      <Card>
        <p className="text-center text-gray-600 py-8">Post not found</p>
      </Card>
    )
  }

  return <BlogPostForm post={post} projects={projects} returnTo={returnTo} />
}
