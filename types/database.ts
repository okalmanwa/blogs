export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'admin' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'viewer'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          year: number
          status: 'open' | 'closed'
          admin_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          year: number
          status?: 'open' | 'closed'
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          year?: number
          status?: 'open' | 'closed'
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          author_id: string
          project_id: string | null
          status: 'draft' | 'published'
          slug: string
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          author_id: string
          project_id?: string | null
          status?: 'draft' | 'published'
          slug: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          author_id?: string
          project_id?: string | null
          status?: 'draft' | 'published'
          slug?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      gallery_images: {
        Row: {
          id: string
          url: string
          title: string | null
          description: string | null
          author_id: string
          project_id: string
          blog_post_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          title?: string | null
          description?: string | null
          author_id: string
          project_id: string
          blog_post_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          title?: string | null
          description?: string | null
          author_id?: string
          project_id?: string
          blog_post_id?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          blog_post_id: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          blog_post_id: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          blog_post_id?: string
          parent_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
