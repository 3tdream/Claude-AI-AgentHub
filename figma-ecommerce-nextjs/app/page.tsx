'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default function Home() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="bg-white">
      <Header />

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          <Sidebar onFilterChange={handleFilterChange} />
          <ProductGrid />
        </div>
      </div>

      <Footer />
    </div>
  );
}
