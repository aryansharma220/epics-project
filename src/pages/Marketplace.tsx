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
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Agricultural Marketplace</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            <Package className="w-5 h-5" /> Add Listing
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Listings</p>
              <p className="text-2xl font-bold">{stats.activeListings}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Price</p>
              <p className="text-2xl font-bold">₹{stats.averagePrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search, Sort and View Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 pl-10 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="p-2 border rounded-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilters({...filters, category: ''})}
          className={`px-3 py-1 rounded-full text-sm ${filters.category === '' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          All Categories
        </button>
        <button 
          onClick={() => setFilters({...filters, category: 'seeds'})}
          className={`px-3 py-1 rounded-full text-sm ${filters.category === 'seeds' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Seeds & Plants
        </button>
        <button 
          onClick={() => setFilters({...filters, category: 'fertilizers'})}
          className={`px-3 py-1 rounded-full text-sm ${filters.category === 'fertilizers' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Fertilizers
        </button>
        <button 
          onClick={() => setFilters({...filters, category: 'equipment'})}
          className={`px-3 py-1 rounded-full text-sm ${filters.category === 'equipment' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Equipment
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <div className="w-full md:w-64">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ category: '', minPrice: '', maxPrice: '', quality: '' })}
          />
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-xl font-medium mb-4">No products found</p>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
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
          )}

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