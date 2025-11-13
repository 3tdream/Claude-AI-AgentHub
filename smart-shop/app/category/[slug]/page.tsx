'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AISearch } from '@/components/ai-search'
import { ShoppingBag, Search, SlidersHorizontal, Sparkles } from 'lucide-react'

interface Product {
  id: string
  slug: string
  title: string
  description: string
  shortDescription?: string
  price: { amount: number; currency: string }
  compareAtPrice?: number
  media: Array<{ url: string; alt: string; type: string }>
  category: string
  tags: string[]
  stock: number
  featured: boolean
}

interface Category {
  slug: string
  name: string
  description: string
}

export default function CategoryPage() {
  const params = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, categoryRes] = await Promise.all([
          fetch(`/api/categories/${params.slug}/products`),
          fetch(`/api/categories/${params.slug}`)
        ])

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json()
          setCategory(categoryData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.slug])

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const calculateDiscount = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0
    return Math.round(((compareAt - price) / compareAt) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold">Smart Shop</span>
          </Link>
          <Button asChild>
            <Link href="/cart">Cart</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {category?.name || (params.slug === 'all' ? 'All Products' : 'Products')}
          </h1>
          {category?.description && (
            <p className="text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>

        {/* AI Search Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">AI-Powered Search</h2>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Use natural language to find exactly what you need. Try "best headphones for gaming" or "affordable laptop for students"
          </p>
          <AISearch />
        </div>

        {/* Basic Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quick search by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Check back soon for new products'}
            </p>
            <Button asChild>
              <Link href="/category/all">Browse All Products</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const discount = calculateDiscount(product.price.amount, product.compareAtPrice)

                return (
                  <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square">
                        <Image
                          src={product.media[0]?.url || ''}
                          alt={product.media[0]?.alt || product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                        {discount > 0 && (
                          <Badge className="absolute top-2 right-2" variant="destructive">
                            -{discount}%
                          </Badge>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="secondary">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                          {product.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.shortDescription || product.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold">
                          {formatCurrency(product.price.amount, product.price.currency)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.compareAtPrice, product.price.currency)}
                          </span>
                        )}
                      </div>
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full" asChild disabled={product.stock === 0}>
                        <Link href={`/products/${product.slug}`}>
                          {product.stock > 0 ? 'View Details' : 'Out of Stock'}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
