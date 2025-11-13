'use client'

import { useCart } from '@/lib/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const { toast } = useToast()

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeItem(productId, variantId)
    toast({
      title: 'Removed from cart',
      description: 'Item has been removed from your cart',
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    })
  }

  const handleCheckout = () => {
    toast({
      title: 'Checkout',
      description: 'Checkout functionality would be implemented here',
    })
  }

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 10
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xl font-bold">Smart Shop</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl mb-2">Your Cart is Empty</CardTitle>
            <CardDescription className="mb-6">
              Add some products to get started!
            </CardDescription>
            <Button asChild size="lg">
              <Link href="/category/all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
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
          <Button variant="ghost" asChild>
            <Link href="/category/all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.variant?.price.amount || item.product.price.amount
              const currency = item.variant?.price.currency || item.product.price.currency

              return (
                <Card key={`${item.product.id}-${item.variant?.id || 'default'}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={item.product.media[0]?.url || ''}
                          alt={item.product.media[0]?.alt || item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold hover:underline line-clamp-2"
                        >
                          {item.product.title}
                        </Link>
                        {item.variant && (
                          <Badge variant="secondary" className="mt-1">
                            {item.variant.name}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(price, currency)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant?.id,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant?.id,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="font-semibold">
                          {formatCurrency(price * item.quantity, currency)}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.product.id, item.variant?.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                {subtotal < 50 && (
                  <p className="text-sm text-muted-foreground">
                    Add {formatCurrency(50 - subtotal)} more for free shipping!
                  </p>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Secure payment processing
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    30-day money-back guarantee
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Free returns on all orders
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
