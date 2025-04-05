import React from 'react';
import { Product } from '../../types/marketplace';
import { Star, MapPin, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, viewMode, onAddToCart, onViewDetails }: ProductCardProps) {
  const renderBadges = () => (
    <div className="absolute top-2 left-2 flex flex-col gap-1">
      {!product.inStock && (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
          Out of Stock
        </span>
      )}
      {product.certification?.map((cert, index) => (
        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
          {cert}
        </span>
      ))}
    </div>
  );

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden
        ${viewMode === 'list' ? 'flex' : ''} transition-all duration-200 hover:shadow-xl`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs ${
            product.quality === 'premium' ? 'bg-yellow-100 text-yellow-800' :
            product.quality === 'standard' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {product.quality}
          </span>
        </div>
        {renderBadges()}
      </div>

      <div className="p-4 flex-1">
        <h3 className="font-medium text-lg mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{product.ratings.average}</span>
          <span className="text-gray-500">({product.ratings.count})</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{product.seller.location}</span>
        </div>
        <p className="text-lg font-bold mb-4">₹{product.price}/{product.unit}</p>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            View Details
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2">
        {!product.inStock && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs text-center">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
}
