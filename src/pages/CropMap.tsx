import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { Plane as Plant, Thermometer, Droplets, Wind, AlertTriangle, Loader2 } from 'lucide-react';
import type { CropData, SoilData } from '../types';
import 'leaflet/dist/leaflet.css';
import { getSoilData, getCropRecommendations, getWeatherData } from '../services/api';

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

function LocationMarker() {
  const { preferences, setLocation } = useStore();
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", async function (e) {
      setLocation(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return preferences.location ? (
    <>
      <Marker position={[preferences.location.lat, preferences.location.lng]}>
        <Popup>Your Farm Location</Popup>
      </Marker>
      <Circle
        center={[preferences.location.lat, preferences.location.lng]}
        radius={2000}
        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
      />
    </>
  ) : null;
}

export default function CropMap() {
  const { t } = useTranslation();
  const { preferences } = useStore();
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [cropRecommendations, setCropRecommendations] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { lat, lng } = preferences.location;
        
        // Fetch soil data
        const soil = await getSoilData(lat, lng);
        setSoilData(soil);

        // Get crop recommendations based on soil data
        const crops = await getCropRecommendations(lat, lng, soil);
        setCropRecommendations(crops);

        // Get weather data to enhance recommendations
        const weather = await getWeatherData(lat, lng);
        // Use weather data to adjust recommendations if needed
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    if (preferences.location.lat && preferences.location.lng) {
      fetchData();
    }
  }, [preferences.location]);

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
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <Plant className="w-6 h-6" />
            {t('nav.map')}
          </h2>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={[preferences.location.lat, preferences.location.lng]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>
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
                <span className="text-sm text-gray-600 dark:text-gray-300">pH Level</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.ph}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Organic Matter</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.organicMatter}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Moisture</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.moisture}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Temperature</span>
                <p className="text-lg font-medium dark:text-white">{soilData?.temperature}°C</p>
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