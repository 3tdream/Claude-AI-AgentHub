import { z } from 'zod'

export const MenuItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  badge: z.string().optional(),
  children: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
})

export const MenuSchema = z.object({
  id: z.string(),
  items: z.array(MenuItemSchema),
})

export const SocialLinkSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok']),
  url: z.string().url(),
  label: z.string().optional(),
})

export const SiteConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  logo: z.string().url().optional(),
  logoText: z.string().optional(),
  tagline: z.string().optional(),
  url: z.string().url(),
  menus: z.object({
    header: MenuSchema,
    footer: z.array(MenuSchema),
  }),
  social: z.array(SocialLinkSchema).optional(),
  footer: z
    .object({
      copyright: z.string(),
      links: z.array(
        z.object({
          label: z.string(),
          href: z.string(),
        })
      ).optional(),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: z.string(),
      titleTemplate: z.string().optional(),
      description: z.string(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
})

export type MenuItem = z.infer<typeof MenuItemSchema>
export type Menu = z.infer<typeof MenuSchema>
export type SocialLink = z.infer<typeof SocialLinkSchema>
export type SiteConfig = z.infer<typeof SiteConfigSchema>
