import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parent: z.string().optional(),
  order: z.number().default(0),
  featured: z.boolean().default(false),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
})

export type Category = z.infer<typeof CategorySchema>
