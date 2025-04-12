import React from 'react';
import { Product } from '../../types/marketplace';
import { Star, MapPin, ShoppingCart, Eye, Heart, Award } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, viewMode, onAddToCart, onViewDetails }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
      onAddToCart(product);
    }
  };

  const renderQualityBadge = (quality: string) => {
    let bgColor, textColor, icon;
    
    switch (quality) {
      case 'premium':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <Award className="w-3 h-3 mr-1" />;
        break;
      case 'standard':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = null;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = null;
    }
    
    return (
      <span className={`flex items-center px-2 py-1 rounded text-xs ${bgColor} ${textColor}`}>
        {icon}{quality.charAt(0).toUpperCase() + quality.slice(1)}
      </span>
    );
  };

  const renderBadges = () => (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
      {!product.inStock && (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
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

  return viewMode === 'grid' ? (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(product)}
    >
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 z-10">
          {renderQualityBadge(product.quality)}
        </div>
        {renderBadges()}
        
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="p-2 bg-white text-blue-500 rounded-full mr-2 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={product.inStock ? "Add to cart" : "Out of stock"}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-500'} hover:bg-red-50`}
            title="Add to favorites"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-1 text-sm">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{product.ratings.average}</span>
          <span className="text-gray-500">({product.ratings.count})</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mb-2 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{product.seller.location}</span>
        </div>
        <p className="text-lg font-bold">₹{product.price}/{product.unit}</p>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="mt-3 w-full px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  ) : (
    // List view mode
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex transition-all duration-200 hover:shadow-xl relative"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative w-48 min-w-[12rem]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          {renderQualityBadge(product.quality)}
        </div>
        {renderBadges()}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-lg mb-1">{product.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className={`p-1 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
              title="Add to favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{product.ratings.average}</span>
            <span className="text-gray-500">({product.ratings.count})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{product.seller.location}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xl font-bold">₹{product.price}/{product.unit}</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product);
              }}
              className="px-3 py-1.5 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-1"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
