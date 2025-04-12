import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';

export interface LocationResult {
  id?: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  currentLocation?: { lat: number; lng: number; name?: string };
  className?: string;
}

export default function LocationSearch({ onLocationSelect, currentLocation, className = '' }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      return;
    }

    // Debounce search to avoid too many API calls
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );
        const data = await response.json();
        
        // Format the results
        const formattedResults = data.map((item: any) => ({
          name: item.name,
          country: item.country,
          lat: item.lat,
          lon: item.lon
        }));
        
        setResults(formattedResults);
        setIsOpen(formattedResults.length > 0);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleLocationSelect = (location: LocationResult) => {
    onLocationSelect(location);
    setIsOpen(false);
    setQuery('');
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
              const location = {
                name: data[0].name,
                country: data[0].country,
                lat: position.coords.latitude,
                lon: position.coords.longitude
              };
              onLocationSelect(location);
            } else {
              onLocationSelect({
                name: "Current Location",
                country: "",
                lat: position.coords.latitude,
                lon: position.coords.longitude
              });
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            onLocationSelect({
              name: "Current Location",
              country: "",
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          className="block w-full p-2 pl-10 pr-10 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setQuery('')}
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10 p-4 flex justify-center">
          <div className="animate-pulse text-gray-400">Searching...</div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10 max-h-60 overflow-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="px-4 py-3">
              <button
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 w-full text-left"
              >
                <MapPin className="w-4 h-4" />
                Use my current location
              </button>
            </li>
            {results.map((result, index) => (
              <li key={index}>
                <button
                  onClick={() => handleLocationSelect(result)}
                  className="block w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{result.country}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentLocation && currentLocation.name && (
        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          Current: {currentLocation.name}
        </div>
      )}
    </div>
  );
}