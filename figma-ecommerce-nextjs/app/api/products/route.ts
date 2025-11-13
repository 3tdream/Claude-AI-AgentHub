import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  const style = searchParams.get('style');
  const sort = searchParams.get('sort');

  const db = await getDB();
  let products = [...db.data.products];

  // Apply filters
  if (category) {
    products = products.filter(p => p.category === category);
  }

  if (minPrice) {
    products = products.filter(p => p.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= parseInt(maxPrice));
  }

  if (color) {
    products = products.filter(p => p.colors.includes(color));
  }

  if (size) {
    products = products.filter(p => p.sizes.includes(size));
  }

  if (style) {
    products = products.filter(p => p.style === style);
  }

  // Apply sorting
  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    products.reverse();
  }

  return NextResponse.json({ products, total: products.length });
}
