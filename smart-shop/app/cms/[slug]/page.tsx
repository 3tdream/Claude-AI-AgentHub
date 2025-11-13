'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

interface PageData {
  slug: string
  title: string
  description?: string
  content?: string
  layout: string
}

export default function CMSPage() {
  const params = useParams()
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/pages/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setPage(data)
        }
      } catch (error) {
        console.error('Failed to load page:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xl font-bold">Smart Shop</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The page you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold">Smart Shop</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <Link href="/category/all" className="hover:underline">Shop</Link>
              <Link href="/cms/featured" className="hover:underline">Featured</Link>
              <Link href="/cms/about" className="hover:underline">About</Link>
            </nav>
            <Button asChild>
              <Link href="/cart">Cart</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-5xl font-bold mb-4">{page.title}</h1>

          {page.description && (
            <p className="text-xl text-muted-foreground mb-8">{page.description}</p>
          )}

          <div className="prose prose-lg max-w-none">
            {page.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4">Welcome to {page.title}</h2>
                <p className="text-muted-foreground mb-4">
                  This is a content page that can be customized through the CMS.
                </p>
                <p className="text-sm text-muted-foreground">
                  Edit the content in <code className="bg-muted px-2 py-1 rounded">content/pages.json</code> to customize this page.
                </p>
              </Card>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/category/all">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>

      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Smart Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
