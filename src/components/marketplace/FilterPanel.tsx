import React from 'react';
import { Filter, Trash2 } from 'lucide-react';

interface FilterProps {
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    quality: string;
    inStock?: boolean;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onFilterChange, onReset }: FilterProps) {
  const handleFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={filters.category}
            onChange={(e) => handleFilter('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="seeds">Seeds</option>
            <option value="fertilizers">Fertilizers</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Availability</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilter('inStock', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">In Stock Only</span>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 p-2 border rounded"
              value={filters.minPrice}
              onChange={(e) => handleFilter('minPrice', e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 p-2 border rounded"
              value={filters.maxPrice}
              onChange={(e) => handleFilter('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Price Range (₹)</label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.maxPrice || 10000}
              onChange={(e) => handleFilter('maxPrice', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>₹0</span>
              <span>₹{filters.maxPrice || 10000}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Quality</label>
          <select
            className="w-full p-2 border rounded"
            value={filters.quality}
            onChange={(e) => handleFilter('quality', e.target.value)}
          >
            <option value="">All Qualities</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
            <option value="economy">Economy</option>
          </select>
        </div>
      </div>
    </div>
  );
}
