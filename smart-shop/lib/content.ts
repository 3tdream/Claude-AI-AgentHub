import * as fs from 'fs/promises'
import * as path from 'path'
import {
  ProductSchema,
  CategorySchema,
  PageSchema,
  SiteConfigSchema,
  DesignTokensSchema,
  type Product,
  type Category,
  type Page,
  type SiteConfig,
  type DesignTokens,
} from './schemas'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute in development

async function readJsonFile<T>(filePath: string, schema: any): Promise<T> {
  const cacheKey = filePath
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  const content = await fs.readFile(filePath, 'utf-8')
  const json = JSON.parse(content)
  const validated = schema.parse(json)

  cache.set(cacheKey, { data: validated, timestamp: Date.now() })
  return validated
}

export async function getProducts(): Promise<Product[]> {
  const filePath = path.join(process.cwd(), 'content', 'products.json')
  return readJsonFile<Product[]>(filePath, ProductSchema.array())
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((p) => p.slug === slug) || null
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((p) => p.id === id) || null
}

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const products = await getProducts()
  const featured = products.filter((p) => p.featured)
  return limit ? featured.slice(0, limit) : featured
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((p) => p.category === category)
}

export async function getCategories(): Promise<Category[]> {
  const filePath = path.join(process.cwd(), 'content', 'categories.json')
  return readJsonFile<Category[]>(filePath, CategorySchema.array())
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories()
  return categories.find((c) => c.slug === slug) || null
}

export async function getPages(): Promise<Page[]> {
  const filePath = path.join(process.cwd(), 'content', 'pages.json')
  return readJsonFile<Page[]>(filePath, PageSchema.array())
}

export async function getPage(slug: string): Promise<Page | null> {
  const pages = await getPages()
  return pages.find((p) => p.slug === slug) || null
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const filePath = path.join(process.cwd(), 'content', 'site.json')
  return readJsonFile<SiteConfig>(filePath, SiteConfigSchema)
}

export async function getDesignTokens(): Promise<DesignTokens> {
  const filePath = path.join(process.cwd(), 'content', 'design-tokens.json')
  return readJsonFile<DesignTokens>(filePath, DesignTokensSchema)
}

export function clearCache() {
  cache.clear()
}
