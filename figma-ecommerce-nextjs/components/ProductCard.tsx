import { Product } from '@/lib/db';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-gray-300">⭐</span>);
    }

    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">⭐</span>);
    }

    return stars;
  };

  return (
    <div className="group">
      <div className="bg-gray-100 rounded-2xl overflow-hidden mb-3 aspect-square">
        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
          <div className="text-6xl">{product.image}</div>
        </div>
      </div>
      <h3 className="font-semibold mb-2">{product.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex text-yellow-400">
          {renderStars(product.rating)}
        </div>
        <span className="text-sm">{product.rating}/5</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl">${product.price}</span>
        {product.originalPrice && (
          <>
            <span className="text-gray-400 line-through">${product.originalPrice}</span>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
