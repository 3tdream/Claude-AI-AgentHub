import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getProductsByCategory } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    let products

    if (params.slug === 'all') {
      products = await getProducts()
    } else {
      products = await getProductsByCategory(params.slug)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
