'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/db';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchProducts();
  }, [sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sortBy !== 'popular') {
        params.append('sort', sortBy);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex-1">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Casual</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Showing 1-{products.length} of 100 Products</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-medium border-none outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <hr className="mb-6" />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200">1</button>
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100">2</button>
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100">3</button>
          <span className="px-2">...</span>
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100">8</button>
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100">9</button>
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100">10</button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </main>
  );
}
