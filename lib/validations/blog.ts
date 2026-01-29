import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  project_id: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'published']),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>
