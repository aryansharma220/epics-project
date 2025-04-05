import React, { useState, useEffect } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import { Product, MarketStats } from '../types/marketplace';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  MapPin,
  Package,
  TrendingUp,
  Grid,
  List
} from 'lucide-react';
import { FilterPanel } from '../components/marketplace/FilterPanel';
import ProductCard from '../components/marketplace/ProductCard';
import ProductDetailModal from '../components/marketplace/ProductDetailModal';
import CartDrawer from '../components/marketplace/CartDrawer';

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    quality: ''
  });
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, [filters, sortBy, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let productsData = await marketplaceService.getProducts(filters);
      
      if (searchQuery) {
        productsData = await marketplaceService.searchProducts(searchQuery);
      }
      
      if (sortBy) {
        productsData = marketplaceService.sortProducts(productsData, sortBy);
      }

      setProducts(productsData);
      const statsData = await marketplaceService.getMarketStats();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: Math.max(0, quantity) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...');
    setIsCartOpen(false);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add search and sort controls */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="p-2 border rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-64">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ category: '', minPrice: '', maxPrice: '', quality: '' })}
          />
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          } gap-6`}>
            {paginatedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onAddToCart={addToCart}
                onViewDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Add cart toggle button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {cart.length}
          </span>
        )}
      </button>
    </div>
  );
}