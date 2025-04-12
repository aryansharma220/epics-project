import React from 'react';
import { Filter, Trash2, RefreshCw, ChevronDown } from 'lucide-react';

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
  const [expanded, setExpanded] = React.useState(true);
  
  const handleFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 p-1 rounded hover:bg-gray-100"
            title={expanded ? "Collapse filters" : "Expand filters"}
          >
            <ChevronDown className={`w-4 h-4 transform ${expanded ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-1 font-medium">Category</label>
            <select
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              value={filters.category}
              onChange={(e) => handleFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="seeds">Seeds & Plants</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="equipment">Equipment</option>
              <option value="crops">Crops</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Availability</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={!!filters.inStock}
                onChange={(e) => handleFilter('inStock', e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="inStock" className="text-sm">In Stock Only</label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">Price Range (₹)</label>
            <div className="flex gap-3 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full p-2 pl-6 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={filters.minPrice}
                  onChange={(e) => handleFilter('minPrice', e.target.value)}
                />
              </div>
              <span className="text-gray-400 self-center">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full p-2 pl-6 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.maxPrice || 50000}
                onChange={(e) => handleFilter('maxPrice', e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹{filters.maxPrice || 50000}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Quality</label>
            <select
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filters.quality}
              onChange={(e) => handleFilter('quality', e.target.value)}
            >
              <option value="">All Qualities</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="economy">Economy</option>
            </select>
          </div>

          <div className="pt-3 border-t">
            <button
              onClick={onReset}
              className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
