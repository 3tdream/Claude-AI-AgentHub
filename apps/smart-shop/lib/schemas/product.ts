import { z } from 'zod'

export const MediaSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  type: z.enum(['image', 'video']),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const SpecSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export const PriceSchema = z.object({
  amount: z.number(),
  currency: z.string().default('USD'),
  compareAt: z.number().optional(),
})

export const VariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().optional(),
  price: PriceSchema,
  stock: z.number().default(0),
  options: z.record(z.string(), z.string()).optional(), // e.g., { color: 'Red', size: 'L' }
  media: z.array(MediaSchema).optional(),
  available: z.boolean().default(true),
})

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  price: PriceSchema,
  compareAtPrice: z.number().optional(),
  variants: z.array(VariantSchema).optional(),
  media: z.array(MediaSchema),
  specs: z.array(SpecSchema).optional(),
  tags: z.array(z.string()).default([]),
  category: z.string(),
  featured: z.boolean().default(false),
  stock: z.number().default(0),
  available: z.boolean().default(true),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type Media = z.infer<typeof MediaSchema>
export type Spec = z.infer<typeof SpecSchema>
export type Price = z.infer<typeof PriceSchema>
export type Variant = z.infer<typeof VariantSchema>
export type Product = z.infer<typeof ProductSchema>
