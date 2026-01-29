import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  year: z.number().int().min(2000).max(2100),
  status: z.enum(['open', 'closed']),
})

export type ProjectFormData = z.infer<typeof projectSchema>
