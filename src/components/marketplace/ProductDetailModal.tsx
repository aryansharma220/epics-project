import React, { useState } from 'react';
import { Product } from '../../types/marketplace';
import { X, Star, MapPin, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex">
          {/* Product Images */}
          <div className="w-1/2 p-6 border-r relative">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-96 object-contain"
            />
            {product.images.length > 1 && (
              <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
                <button
                  onClick={() => setCurrentImageIndex(i => (i - 1 + product.images.length) % product.images.length)}
                  className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(i => (i + 1) % product.images.length)}
                  className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <button onClick={onClose} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">{product.ratings.average}</span>
                <span className="text-gray-500">({product.ratings.count} reviews)</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{product.seller.location}</span>
              </div>

              <p className="text-3xl font-bold">₹{product.price}/{product.unit}</p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
