import { getFeaturedProducts, getSiteConfig } from '@/lib/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'
import { VoiceShoppingButton } from './page-client'
import { AISearch } from '@/components/ai-search'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, ShoppingBag, Mic } from 'lucide-react'

export default async function HomePage() {
  const featured = await getFeaturedProducts(6)
  const site = await getSiteConfig()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <SiteHeader />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4">AI-Powered Shopping</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {site.tagline || 'Shop Smarter with AI'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {site.description}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/category/all">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <VoiceShoppingButton />
          </div>
        </div>
      </section>

      {/* AI Search Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered
              </Badge>
              <h2 className="text-3xl font-bold mb-3">Find Anything with AI Search</h2>
              <p className="text-lg text-muted-foreground">
                Describe what you're looking for in your own words. Our AI understands and finds the perfect match.
              </p>
            </div>
            <AISearch />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>AI Product Discovery</CardTitle>
                <CardDescription>
                  Our AI helps you find exactly what you need
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Mic className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Voice Shopping</CardTitle>
                <CardDescription>
                  Shop hands-free with voice commands
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Curated Selection</CardTitle>
                <CardDescription>
                  Every product hand-picked for quality
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Hand-picked favorites</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/category/all">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featured.map((product) => {
              const discount = calculateDiscount(product.price.amount, product.compareAtPrice)

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={product.media[0]?.url || ''}
                      alt={product.media[0]?.alt || product.title}
                      fill
                      className="object-cover"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.shortDescription || product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatCurrency(product.price.amount)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/products/${product.slug}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{site.footer?.copyright}</p>
        </div>
      </footer>
    </div>
  )
}
