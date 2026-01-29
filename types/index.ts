import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type UserRole = 'student' | 'admin' | 'viewer'
export type ProjectStatus = 'open' | 'closed'
export type PostStatus = 'draft' | 'published'

export interface BlogPostWithAuthor extends BlogPost {
  author: Profile
  project?: Project | null
}

export interface GalleryImageWithAuthor extends GalleryImage {
  author: Profile
  project: Project
}

export interface CommentWithAuthor extends Comment {
  author: Profile
  replies?: CommentWithAuthor[]
}
