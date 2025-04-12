import React, { useState } from 'react';
import { Product } from '../../types/marketplace';
import { X, Star, MapPin, ShoppingCart, ChevronLeft, ChevronRight, Heart, Tag, Store, Award, Share2, Truck } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const renderDeliveryEstimate = () => {
    const days = Math.floor(Math.random() * 5) + 2;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderThumbnails = () => {
    return (
      <div className="flex mt-4 space-x-2">
        {product.images.map((img, index) => (
          <div
            key={index}
            className={`w-16 h-16 border-2 rounded cursor-pointer ${
              index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          >
            <img
              src={img}
              alt={`${product.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderQualityBadge = (quality: string) => {
    let bgColor, textColor;
    
    switch (quality) {
      case 'premium':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'standard':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor} flex items-center`}>
        {quality === 'premium' && <Award className="w-3 h-3 mr-1" />}
        {quality.charAt(0).toUpperCase() + quality.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-2 bg-white/90 rounded-full hover:bg-gray-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row">
          {/* Product Images */}
          <div className="w-full md:w-1/2 p-6">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center h-80">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              
              {product.images.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
                  <button
                    onClick={() => setCurrentImageIndex(i => (i - 1 + product.images.length) % product.images.length)}
                    className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i + 1) % product.images.length)}
                    className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex gap-2">
                {renderQualityBadge(product.quality)}
              </div>
              
              <div className="absolute top-2 left-2">
                {!product.inStock && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
            
            {product.images.length > 1 && renderThumbnails()}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{product.ratings.average}</span>
                  <span className="text-gray-500">({product.ratings.count} reviews)</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-600">
                  <Store className="w-4 h-4" />
                  <span>{product.seller.name}</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{product.seller.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">₹{product.price}</p>
                <span className="text-gray-600">/ {product.unit}</span>
                
                {product.inStock ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    In Stock
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Tabs for product info */}
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-2 px-4 border-b-2 text-sm ${
                      activeTab === 'description' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`py-2 px-4 border-b-2 text-sm ${
                      activeTab === 'specifications' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`py-2 px-4 border-b-2 text-sm ${
                      activeTab === 'shipping' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Shipping
                  </button>
                </div>
              </div>
              
              <div className="py-2 min-h-[120px]">
                {activeTab === 'description' && (
                  <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
                )}
                
                {activeTab === 'specifications' && (
                  <div className="space-y-2">
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex gap-2 border-b pb-1">
                          <span className="text-gray-500 min-w-[140px]">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No specifications available</p>
                    )}
                    
                    {product.certification && (
                      <div className="mt-3">
                        <p className="text-gray-500 mb-1">Certifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.certification.map((cert, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center">
                              <Tag className="w-3 h-3 mr-1" /> {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-gray-500 text-sm">By {renderDeliveryEstimate()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Shipping calculated at checkout based on delivery location
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="w-1/3">
                  <label className="text-sm block mb-1 text-gray-500">Quantity:</label>
                  <div className="flex border rounded">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="py-1 w-12 text-center border-x"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="w-2/3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
              
              <div className="flex border-t pt-4">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 text-sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
