import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getWeatherData } from '../services/api';

export interface WeatherState {
  data: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  currentLocation: {
    lat: number;
    lng: number;
    name?: string;
    country?: string;
  };
}

interface UseWeatherOptions {
  customLocation?: {
    lat: number;
    lon: number;
    name?: string;
    country?: string;
  };
}

export function useWeather(options?: UseWeatherOptions): WeatherState {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    name: '',
    country: ''
  });
  const { preferences } = useStore();

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let lat: number, lng: number;
      
      if (options?.customLocation) {
        lat = options.customLocation.lat;
        lng = options.customLocation.lon;
        
        setCurrentLocation({
          lat,
          lng,
          name: options.customLocation.name || '',
          country: options.customLocation.country || ''
        });
      } else if (preferences.location.lat && preferences.location.lng) {
        lat = preferences.location.lat;
        lng = preferences.location.lng;
        
        setCurrentLocation({
          lat,
          lng,
          name: 'Your Location'
        });
        
        // Try to get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            setCurrentLocation(prev => ({
              ...prev,
              name: data[0].name,
              country: data[0].country
            }));
          }
        } catch (geoError) {
          console.error('Error getting location name:', geoError);
        }
      } else {
        setError('Location not available. Please enable location services or search for a location.');
        setLoading(false);
        return;
      }

      const weatherData = await getWeatherData(lat, lng);
      setData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [
    options?.customLocation?.lat, 
    options?.customLocation?.lon, 
    preferences.location.lat, 
    preferences.location.lng
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchWeather,
    currentLocation
  };
}