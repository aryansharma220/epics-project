import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  ShoppingBag,
  Star,
  ChevronDown,
  Plus,
  X,
  Heart,
  Share2,
  MessageCircle,
  ShoppingCart
} from 'lucide-react';
import type { MarketItem } from '../types';

const categories = [
  { id: 'seeds', name: 'Seeds & Plants' },
  { id: 'fertilizers', name: 'Fertilizers' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'pesticides', name: 'Pesticides' },
  { id: 'tools', name: 'Tools & Accessories' }
];

const marketItems: MarketItem[] = [
  {
    id: '1',
    name: 'Premium Wheat Seeds',
    category: 'seeds',
    price: 1200,
    seller: 'AgriTech Seeds',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviews: 156,
    description: 'High-yield wheat seeds suitable for various soil types. Disease-resistant variety.',
    inStock: 500,
    specifications: {
      'Germination Rate': '95%',
      'Growth Period': '120-130 days',
      'Seed Type': 'Hybrid',
      'Package Size': '10 kg'
    }
  },
  {
    id: '2',
    name: 'Organic NPK Fertilizer',
    category: 'fertilizers',
    price: 850,
    seller: 'Green Earth Nutrients',
    image: 'https://images.unsplash.com/photo-1592978392767-56fe0296c565?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    reviews: 89,
    description: 'Balanced NPK fertilizer for optimal crop growth. 100% organic and eco-friendly.',
    inStock: 1000,
    specifications: {
      'N-P-K Ratio': '14-14-14',
      'Weight': '25 kg',
      'Type': 'Granular',
      'Organic': 'Yes'
    }
  },
  {
    id: '3',
    name: 'Modern Tractor Equipment',
    category: 'equipment',
    price: 25000,
    seller: 'FarmTech Solutions',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviews: 42,
    description: 'Advanced tractor with modern features for efficient farming operations.',
    inStock: 5,
    specifications: {
      'Power': '75 HP',
      'Fuel Type': 'Diesel',
      'Transmission': 'Automatic',
      'Warranty': '2 years'
    }
  }
];

export default function Marketplace() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const [showAddListing, setShowAddListing] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredItems = marketItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.rating - a.rating;
  });

  const toggleWishlist = (itemId: string) => {
    setWishlist(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleCart = (itemId: string) => {
    setCartItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Agricultural Marketplace</h1>
        <button
          onClick={() => setShowAddListing(true)}
          className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Listing
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => toggleWishlist(item.id)}
                className={`absolute top-2 right-2 p-2 rounded-full ${
                  wishlist.includes(item.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className="w-5 h-5" fill={wishlist.includes(item.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.seller}</p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium dark:text-white">{item.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold dark:text-white">₹{item.price}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.inStock} available</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCart(item.id)}
                    className={`p-2 rounded-lg ${
                      cartItems.includes(item.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    } hover:opacity-90 transition-colors`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:opacity-90 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:opacity-90 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {showAddListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Add New Listing</h2>
                <button
                  onClick={() => setShowAddListing(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder="Enter product description"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter available quantity"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddListing(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}