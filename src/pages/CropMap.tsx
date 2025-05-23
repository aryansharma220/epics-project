import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { Plane as Plant, Thermometer, Loader2, MapPin, RefreshCw } from 'lucide-react';
import type { CropData, SoilData } from '../types';
import 'leaflet/dist/leaflet.css';
import { getSoilData, getCropRecommendations, getWeatherData, clearLocationCache } from '../services/api';

// Fix for default marker icons in Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function CropMap() {
  const { t } = useTranslation();
  const { preferences } = useStore();
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [cropRecommendations, setCropRecommendations] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherRecommendations, setWeatherRecommendations] = useState<string[]>([]);
  const [locationChanged, setLocationChanged] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  // LocationMarker component moved inside CropMap to access setLocationChanged
  function LocationMarker() {
    const { preferences, setLocation } = useStore();
    const map = useMap();
    const [initialLocationSet, setInitialLocationSet] = useState(false);

    // Only attempt to locate once on initial load
    useEffect(() => {
      if (!initialLocationSet && map) {
        // Only try to geolocate if no specific location has been selected
        if (preferences.location.lat === 20.5937 && preferences.location.lng === 78.9629) {
          map.locate().on("locationfound", function (e) {
            setLocation(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
            setInitialLocationSet(true);
            setLocationChanged(true);
          }).on("locationerror", function(e) {
            console.log("Location access denied or unavailable", e);
            setInitialLocationSet(true); // Mark as initialized even if location fails
          });
        } else {
          // If we already have a non-default location, just mark as initialized
          setInitialLocationSet(true);
        }
      }
    }, [map, setLocation, initialLocationSet, preferences.location.lat, preferences.location.lng]);

    // Create a separate component for the click handler to prevent re-renders
    const MapClickHandler = () => {
      // Use useMapEvents outside of render cycle to prevent issues
      useMapEvents({
        click: (e) => {
          // Update store with clicked location
          setLocation(e.latlng.lat, e.latlng.lng);
          setLocationChanged(true);
        }
      });
      return null;
    };

    return (
      <>
        <MapClickHandler />
        {preferences.location && (
          <>
            <Marker 
              position={[preferences.location.lat, preferences.location.lng]}
              eventHandlers={{
                click: () => {
                  map.openPopup();
                }
              }}
            >
              <Popup closeButton={false}>
                <div className="text-center">
                  <p className="font-medium">Selected Location</p>
                  <p className="text-xs text-gray-500">Lat: {preferences.location.lat.toFixed(4)}, Lng: {preferences.location.lng.toFixed(4)}</p>
                  <p className="text-xs text-blue-500 mt-1">Click anywhere on the map to select a new location</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[preferences.location.lat, preferences.location.lng]}
              radius={2000}
              pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
            />
          </>
        )}
      </>
    );
  }

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const { lat, lng } = preferences.location;
      
      // Get selected location name from Mapbox geocoding API
      try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setLocationName(data.features[0].place_name);
        }
      } catch (err) {
        console.log("Could not fetch location name", err);
        setLocationName(null);
      }

      const soil = await getSoilData(lat, lng);
      setSoilData(soil);

      const crops = await getCropRecommendations(lat, lng, soil);
      setCropRecommendations(crops);

      const weather = await getWeatherData(lat, lng);
      setWeatherData(weather);

      if (weather && crops.length > 0) {
        const weatherBasedRecommendations = generateWeatherRecommendations(weather, crops[0]);
        setWeatherRecommendations(weatherBasedRecommendations);
      }

      setLoading(false);
      setLocationChanged(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [preferences.location]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLocationChanged(true);
  }, []);

  // Listen for location changes and fetch data
  useEffect(() => {
    if (locationChanged || (!soilData && preferences.location.lat && preferences.location.lng)) {
      clearLocationCache();
      fetchData();
    }
  }, [preferences.location, locationChanged, fetchData, soilData]);

  // Generate weather-specific recommendations based on current conditions
  const generateWeatherRecommendations = (weather: any, crop: CropData): string[] => {
    const recommendations: string[] = [];
    
    // Temperature based recommendations
    if (weather.current && weather.current.temperature > 30) {
      recommendations.push(`High temperatures detected. Increase irrigation frequency for ${crop.name}.`);
    } else if (weather.current && weather.current.temperature < 15) {
      recommendations.push(`Cool temperatures detected. Consider protective measures for ${crop.name}.`);
    }
    
    // Rain forecast recommendations
    const rainPredicted = weather.forecast && weather.forecast.some((day: any) => 
      day.precipitation > 50 || day.condition.toLowerCase().includes('rain')
    );
    
    if (rainPredicted) {
      recommendations.push(`Rain expected in the coming days. Delay fertilizer application.`);
    } else if (weather.current && weather.current.humidity < 40) {
      recommendations.push(`Low humidity detected. Consider increasing irrigation.`);
    }
    
    // Wind based recommendations
    const highWind = weather.forecast && weather.forecast.some((day: any) => day.windSpeed > 25);
    if (highWind) {
      recommendations.push(`Strong winds expected. Secure young plants and delay pesticide spraying.`);
    }
    
    // If no specific recommendations, add a generic one
    if (recommendations.length === 0) {
      recommendations.push(`Current weather conditions are favorable for ${crop.name} growth.`);
    }
    
    return recommendations;
  };

  const getAirQualityColor = (airQuality: number): string => {
    if (airQuality <= 50) return 'text-green-500';
    if (airQuality <= 100) return 'text-yellow-500';
    if (airQuality <= 150) return 'text-orange-500';
    if (airQuality <= 200) return 'text-red-500';
    return 'text-purple-500';
  };

  const getAirQualityText = (airQuality: number): string => {
    if (airQuality <= 50) return 'Good';
    if (airQuality <= 100) return 'Moderate';
    if (airQuality <= 150) return 'Unhealthy for Sensitive Groups';
    if (airQuality <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-300">Loading crop data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-700 dark:text-red-200">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-2 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <Plant className="w-6 h-6" />
              {t('nav.map')}
            </h2>
            <button
              onClick={handleRefresh}
              title="Refresh data for current location"
              className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {locationName && (
            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{locationName}</span>
            </div>
          )}
          
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              key={`map-${preferences.location.lat.toFixed(4)}-${preferences.location.lng.toFixed(4)}`}
              center={[preferences.location.lat, preferences.location.lng]}
              zoom={13}
              className="h-full w-full"
              doubleClickZoom={false}
              whenCreated={(mapInstance) => {
                mapInstance.options.flyTo = false; // Prevent automatic flying
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            Click anywhere on the map to select a location and get real-time crop recommendations
          </p>
        </div>

        {selectedCrop && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              Detailed Analysis: {selectedCrop.name}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium dark:text-white mb-2">Growth Information</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Growth Period: {selectedCrop.growthPeriod} days</li>
                  <li>Water Requirement: {selectedCrop.waterRequirement}</li>
                  <li>Expected Yield: {selectedCrop.expectedYield}</li>
                  <li>Suitable Soil Types: {selectedCrop.soilType.join(", ")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium dark:text-white mb-2">Risk Factors</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium dark:text-white mb-1">Common Pests:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                      {selectedCrop.pestRisks.map((pest, index) => (
                        <li key={index}>{pest}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white mb-1">Common Diseases:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                      {selectedCrop.diseases.map((disease, index) => (
                        <li key={index}>{disease}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {weatherData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Weather Conditions
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Temperature</span>
                <span className="font-medium dark:text-white">{weatherData.current.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Feels Like</span>
                <span className="font-medium dark:text-white">{weatherData.current.feelsLike}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Humidity</span>
                <span className="font-medium dark:text-white">{weatherData.current.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Wind Speed</span>
                <span className="font-medium dark:text-white">{weatherData.current.windSpeed} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Condition</span>
                <span className="font-medium dark:text-white">{weatherData.current.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Pressure</span>
                <span className="font-medium dark:text-white">{weatherData.current.pressure} hPa</span>
              </div>
              {weatherData.current.airQuality !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Air Quality</span>
                  <span className={`font-medium ${getAirQualityColor(weatherData.current.airQuality)}`}>
                    {getAirQualityText(weatherData.current.airQuality)}
                  </span>
                </div>
              )}
              
              {weatherRecommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium dark:text-white mb-2">Weather Recommendations</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {weatherRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            <Plant className="w-5 h-5" />
            Crop Recommendations
          </h3>
          <div className="space-y-4">
            {cropRecommendations.map((crop, index) => (
              <div 
                key={index} 
                className="border-b dark:border-gray-700 pb-4 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                onClick={() => setSelectedCrop(crop)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium dark:text-white">{crop.name}</h4>
                  <span className="text-sm px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full">
                    {crop.suitability}% Suitable
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {crop.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Soil Analysis
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Organic Matter</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.organicMatter}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Moisture</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.moisture}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Texture</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.texture}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Nitrogen</span>
                <span className="font-medium dark:text-white">{soilData?.nitrogen}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Phosphorus</span>
                <span className="font-medium dark:text-white">{soilData?.phosphorus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Potassium</span>
                <span className="font-medium dark:text-white">{soilData?.potassium}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium dark:text-white mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {soilData?.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}