'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  slug: string
  title: string
  description: string
  shortDescription?: string
  price: { amount: number; currency: string }
  compareAtPrice?: number
  media: Array<{ url: string; alt: string }>
  category: string
  tags: string[]
}

interface SearchResult {
  results: Product[]
  aiPowered: boolean
  query: string
}

export function AISearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast({
        title: 'Enter a search query',
        description: 'Try: "wireless headphones" or "comfortable chair for work"',
      })
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Search failed')

      const data: SearchResult = await response.json()
      setResults(data)

      if (data.results.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different search term or browse all products',
        })
      } else if (data.aiPowered) {
        toast({
          title: '✨ AI-Powered Results',
          description: `Found ${data.results.length} products using intelligent search`,
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Search failed',
        description: 'Please try again or browse products manually',
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

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

  return (
    <div className="w-full">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Try: 'wireless headphones' or 'gaming laptop'..."
            className="pl-10 pr-32 h-14 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <Button
            type="submit"
            size="lg"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Search
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {showResults && results && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {results.aiPowered && <Sparkles className="h-5 w-5 text-primary" />}
                  Search Results
                  {results.aiPowered && (
                    <Badge variant="secondary" className="ml-2">
                      AI-Powered
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Found {results.results.length} products for "{results.query}"
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowResults(false)}>
                Close
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {results.results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No products found. Try a different search term.
                </p>
                <Button asChild>
                  <Link href="/category/all">Browse All Products</Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.results.map((product) => {
                  const discount = calculateDiscount(
                    product.price.amount,
                    product.compareAtPrice
                  )

                  return (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition group"
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="relative aspect-square">
                          <Image
                            src={product.media[0]?.url || ''}
                            alt={product.media[0]?.alt || product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition"
                          />
                          {discount > 0 && (
                            <Badge
                              className="absolute top-2 right-2"
                              variant="destructive"
                            >
                              -{discount}%
                            </Badge>
                          )}
                        </div>
                      </Link>

                      <CardHeader className="pb-3">
                        <CardTitle className="line-clamp-2 text-base">
                          <Link
                            href={`/products/${product.slug}`}
                            className="hover:underline"
                          >
                            {product.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {product.shortDescription || product.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold">
                            {formatCurrency(
                              product.price.amount,
                              product.price.currency
                            )}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(
                                product.compareAtPrice,
                                product.price.currency
                              )}
                            </span>
                          )}
                        </div>

                        <Button className="w-full" size="sm" asChild>
                          <Link href={`/products/${product.slug}`}>
                            View Details
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {!showResults && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {[
            'wireless headphones',
            'gaming laptop',
            'ergonomic chair',
            'best camera under $500',
            'products for working from home',
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery(suggestion)
                handleSearch({ preventDefault: () => {} } as React.FormEvent)
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
