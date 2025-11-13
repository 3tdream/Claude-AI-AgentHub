import { z } from 'zod'

// Base block schema
const BaseBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
})

// Hero block
export const HeroBlockSchema = BaseBlockSchema.extend({
  type: z.literal('hero'),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  cta: z
    .object({
      text: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    })
    .optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
})

// Feature Grid block
export const FeatureGridBlockSchema = BaseBlockSchema.extend({
  type: z.literal('feature-grid'),
  title: z.string().optional(),
  features: z.array(
    z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string(),
      href: z.string().optional(),
    })
  ),
  columns: z.enum(['2', '3', '4']).default('3'),
})

// Product Carousel block
export const ProductCarouselBlockSchema = BaseBlockSchema.extend({
  type: z.literal('product-carousel'),
  title: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  category: z.string().optional(),
  limit: z.number().default(8),
  featured: z.boolean().optional(),
})

// Rich Text block
export const RichTextBlockSchema = BaseBlockSchema.extend({
  type: z.literal('rich-text'),
  content: z.string(),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg'),
})

// CTA block
export const CTABlockSchema = BaseBlockSchema.extend({
  type: z.literal('cta'),
  title: z.string(),
  description: z.string().optional(),
  primaryCta: z.object({
    text: z.string(),
    href: z.string(),
  }),
  secondaryCta: z
    .object({
      text: z.string(),
      href: z.string(),
    })
    .optional(),
  background: z.enum(['primary', 'secondary', 'gradient']).default('primary'),
})

// Testimonial block
export const TestimonialBlockSchema = BaseBlockSchema.extend({
  type: z.literal('testimonial'),
  testimonials: z.array(
    z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      avatar: z.string().url().optional(),
      rating: z.number().min(1).max(5).optional(),
    })
  ),
  layout: z.enum(['grid', 'carousel']).default('grid'),
})

// Chart block
export const ChartBlockSchema = BaseBlockSchema.extend({
  type: z.literal('chart'),
  title: z.string().optional(),
  chartType: z.enum(['line', 'bar', 'pie', 'area']),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
})

// Image block
export const ImageBlockSchema = BaseBlockSchema.extend({
  type: z.literal('image'),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:2']).default('16:9'),
})

// Union of all block types
export const BlockSchema = z.discriminatedUnion('type', [
  HeroBlockSchema,
  FeatureGridBlockSchema,
  ProductCarouselBlockSchema,
  RichTextBlockSchema,
  CTABlockSchema,
  TestimonialBlockSchema,
  ChartBlockSchema,
  ImageBlockSchema,
])

// Page schema
export const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  layout: z.enum(['grid', 'masonry', 'spotlight', 'magazine', 'story', 'landing']),
  blocks: z.array(BlockSchema),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  published: z.boolean().default(true),
})

export type HeroBlock = z.infer<typeof HeroBlockSchema>
export type FeatureGridBlock = z.infer<typeof FeatureGridBlockSchema>
export type ProductCarouselBlock = z.infer<typeof ProductCarouselBlockSchema>
export type RichTextBlock = z.infer<typeof RichTextBlockSchema>
export type CTABlock = z.infer<typeof CTABlockSchema>
export type TestimonialBlock = z.infer<typeof TestimonialBlockSchema>
export type ChartBlock = z.infer<typeof ChartBlockSchema>
export type ImageBlock = z.infer<typeof ImageBlockSchema>
export type Block = z.infer<typeof BlockSchema>
export type Page = z.infer<typeof PageSchema>
