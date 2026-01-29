'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { CommentWithAuthor } from '@/types'

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
    }
    setUser(user)
    
    // Verify user has a profile (required for comments)
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (!profile) {
        console.warn('User does not have a profile. Comments may not work.')
      }
    }
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('blog_post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (data) {
      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select('*, author:profiles(*)')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || [],
          }
        })
      )
      setComments(commentsWithReplies as CommentWithAuthor[])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !newComment.trim()) {
      if (!user) {
        alert('Please log in to comment')
      }
      return
    }

    // Verify user has a profile before attempting to comment
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      alert('Your account does not have a profile. Please contact an administrator.')
      console.error('User does not have a profile:', user.id)
      return
    }

    setSubmitting(true)
    
    // Debug: Log user info
    console.log('Attempting to post comment:', {
      userId: user.id,
      postId: postId,
      hasProfile: !!profile,
      commentLength: newComment.trim().length
    })

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        blog_post_id: postId,
        author_id: user.id,
      })
      .select()

    if (error) {
      console.error('Error posting comment:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // More helpful error message
      if (error.code === '42501' || error.message.includes('row-level security')) {
        alert(`RLS Policy Error: Your account may not have permission to comment. Please ensure:\n1. You are logged in\n2. Your account has a profile\n3. The RLS policy has been updated (run fix-comments-rls-final.sql)`)
      } else {
        alert(`Failed to post comment: ${error.message}`)
      }
    } else {
      console.log('Comment posted successfully:', data)
      setNewComment('')
      loadComments()
    }
    setSubmitting(false)
  }

  const handleEdit = (comment: CommentWithAuthor) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId)

    if (error) {
      console.error('Error updating comment:', error)
      alert(`Failed to update comment: ${error.message}`)
    } else {
      setEditingId(null)
      setEditContent('')
      loadComments()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setDeletingId(commentId)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      alert(`Failed to delete comment: ${error.message}`)
    } else {
      loadComments()
    }
    setDeletingId(null)
  }

  const handleReplyClick = (commentId: string) => {
    if (!user) {
      alert('Please log in to reply')
      return
    }
    setReplyingToId(commentId)
    setReplyContent('')
  }

  const handleCancelReply = () => {
    setReplyingToId(null)
    setReplyContent('')
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) {
      return
    }

    // Verify user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      alert('Your account does not have a profile. Please contact an administrator.')
      return
    }

    setSubmittingReply(true)

    const { error } = await supabase
      .from('comments')
      .insert({
        content: replyContent.trim(),
        blog_post_id: postId,
        author_id: user.id,
        parent_id: parentId,
      })

    if (error) {
      console.error('Error posting reply:', error)
      if (error.code === '42501' || error.message.includes('row-level security')) {
        alert(`RLS Policy Error: Your account may not have permission to comment. Please ensure:\n1. You are logged in\n2. Your account has a profile\n3. The RLS policy has been updated`)
      } else {
        alert(`Failed to post reply: ${error.message}`)
      }
    } else {
      setReplyingToId(null)
      setReplyContent('')
      loadComments()
    }
    setSubmittingReply(false)
  }

  const isOwner = (comment: CommentWithAuthor) => {
    return user && comment.author_id === user.id
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-4">Loading comments...</p>
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-5 text-gray-900">Comments</h2>

      {/* Comment Form - Instagram-style */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-3">
            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-cornell-red/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cornell-red font-medium text-xs">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => {
                  if (e.target.value.length <= 280) {
                    setNewComment(e.target.value)
                  }
                }}
                placeholder="Add a comment..."
                className="w-full px-0 pt-0 pb-1 border-0 border-b border-gray-300 focus:border-cornell-red focus:outline-none focus:ring-0 bg-transparent resize-none text-sm leading-relaxed placeholder:text-gray-400"
                rows={1}
                maxLength={280}
                required
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">
                  {newComment.length}/280
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim() || newComment.length > 280}
                  className="text-xs font-semibold text-cornell-red disabled:text-gray-400 disabled:cursor-not-allowed hover:text-cornell-red/80"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">
            <a href="/login" className="text-cornell-red hover:text-cornell-red/80 underline font-medium">Log in</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments List - Instagram-style */}
      <div>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className={`px-3 py-3 group/comment hover:bg-gray-50/50 transition-colors rounded-lg ${index > 0 ? 'border-t border-gray-200' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Profile Picture */}
                <div className="w-8 h-8 rounded-full bg-cornell-red/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cornell-red font-medium text-xs">
                    {comment.author?.username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => {
                          if (e.target.value.length <= 280) {
                            setEditContent(e.target.value)
                          }
                        }}
                        className="w-full px-0 pt-0 pb-1 border-0 border-b border-gray-300 focus:border-cornell-red focus:outline-none focus:ring-0 bg-transparent resize-none text-sm leading-relaxed"
                        rows={2}
                        maxLength={280}
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {editContent.length}/280
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editContent.trim() || editContent.length > 280}
                            className="text-xs font-semibold text-cornell-red disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Username and Time */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {comment.author?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      {/* Comment Text */}
                      <p className="text-sm text-gray-800 leading-relaxed mb-1">{comment.content}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                        {isOwner(comment) ? (
                          <>
                            <button
                              onClick={() => handleEdit(comment)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              disabled={deletingId === comment.id}
                              className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        ) : null}
                        {user && (
                          <button
                            onClick={() => handleReplyClick(comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Reply Form - Show when replying to this comment */}
              {replyingToId === comment.id && (
                <div className="mt-3 ml-11">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmitReply(comment.id)
                    }}
                    className="mb-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-medium text-[10px]">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => {
                            if (e.target.value.length <= 280) {
                              setReplyContent(e.target.value)
                            }
                          }}
                          placeholder="Add a reply..."
                          className="w-full px-0 pt-0 pb-1 border-0 border-b border-gray-300 focus:border-cornell-red focus:outline-none focus:ring-0 bg-transparent resize-none text-xs leading-relaxed placeholder:text-gray-400"
                          rows={1}
                          maxLength={280}
                          required
                          autoFocus
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-400">
                            {replyContent.length}/280
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelReply}
                              className="text-[10px] text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingReply || !replyContent.trim() || replyContent.length > 280}
                              className="text-[10px] font-semibold text-cornell-red disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {submittingReply ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies - Nested, Instagram-style */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-11">
                  {comment.replies.map((reply, replyIndex) => (
                    <div 
                      key={reply.id}
                      className={`px-2 py-2 group/reply-item hover:bg-gray-50/50 transition-colors rounded ${replyIndex > 0 ? 'border-t border-gray-200' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Reply Profile Picture */}
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-medium text-[10px]">
                            {reply.author?.username?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        
                        {/* Reply Content */}
                        <div className="flex-1 min-w-0">
                          {editingId === reply.id ? (
                            <div>
                              <textarea
                                value={editContent}
                                onChange={(e) => {
                                  if (e.target.value.length <= 280) {
                                    setEditContent(e.target.value)
                                  }
                                }}
                                className="w-full px-0 pt-0 pb-1 border-0 border-b border-gray-300 focus:border-cornell-red focus:outline-none focus:ring-0 bg-transparent resize-none text-sm leading-relaxed"
                                rows={2}
                                maxLength={280}
                                autoFocus
                              />
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-400">
                                  {editContent.length}/280
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-[10px] text-gray-500 hover:text-gray-700"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(reply.id)}
                                    disabled={!editContent.trim() || editContent.length > 280}
                                    className="text-[10px] font-semibold text-cornell-red disabled:text-gray-400 disabled:cursor-not-allowed"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Reply Username and Time */}
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-gray-900">
                                  {reply.author?.username || 'Anonymous'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              
                              {/* Reply Text */}
                              <p className="text-xs text-gray-800 leading-relaxed mb-1">{reply.content}</p>
                              
                              {/* Reply Actions */}
                              <div className="flex items-center gap-3 opacity-0 group-hover/reply-item:opacity-100 transition-opacity">
                                {isOwner(reply) ? (
                                  <>
                                    <button
                                      onClick={() => handleEdit(reply)}
                                      className="text-[10px] text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      disabled={deletingId === reply.id}
                                      className="text-[10px] text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                    >
                                      {deletingId === reply.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </>
                                ) : null}
                                {user && (
                                  <button
                                    onClick={() => handleReplyClick(comment.id)}
                                    className="text-[10px] text-gray-500 hover:text-gray-700 font-medium"
                                  >
                                    Reply
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
