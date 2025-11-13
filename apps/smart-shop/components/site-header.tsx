'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/store/cart'
import { ShoppingBag, ShoppingCart } from 'lucide-react'

export function SiteHeader() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-bold">Smart Shop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/category/all" className="hover:underline transition">
            Shop
          </Link>
          <Link href="/cms/featured" className="hover:underline transition">
            Featured
          </Link>
          <Link href="/cms/about" className="hover:underline transition">
            About
          </Link>
        </nav>

        <Button asChild className="relative">
          <Link href="/cart">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Link>
        </Button>
      </div>
    </header>
  )
}
