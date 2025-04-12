import React, { useState } from 'react';
import { Product } from '../../types/marketplace';
import { X, ShoppingCart, Trash, ChevronDown, ChevronUp, Percent, Calculator } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Array<{ product: Product; quantity: number }>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? subtotal * 0.1 : 0; // 10% discount for any applied coupon
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping for orders over ₹1000
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'AGRI10' || couponCode.toUpperCase() === 'FARM10') {
      setAppliedCoupon(couponCode);
      setCouponCode('');
    } else {
      alert('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-green-500 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Shopping Cart ({cart.length} items)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-green-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">Start adding products to your cart</p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 border-b pb-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                        <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium line-clamp-2">{product.name}</h3>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                        title="Remove item"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">₹{product.price}/{product.unit}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          disabled={quantity <= 1}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-medium">₹{(product.price * quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t px-4 py-3 bg-gray-50">
              <div 
                className="flex items-center justify-between cursor-pointer mb-2" 
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">Order Summary</span>
                </div>
                <button className="p-1">
                  {showOrderSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showOrderSummary && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon})</span>
                      <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="px-4 py-3 border-t">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">
                      Coupon <strong>{appliedCoupon}</strong> applied (10% off)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    className="flex-1 p-2 border rounded"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Apply
                  </button>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Try AGRI10 or FARM10 for 10% off
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t mt-auto">
              <button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={onClose}
                className="w-full mt-2 py-2 text-gray-600 hover:text-gray-800"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
