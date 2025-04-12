import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Wind, Sun, AlertTriangle, Thermometer, Umbrella, Clock, Loader2, MapPin } from 'lucide-react';
import type { WeatherAlert } from '../types';
import { useWeather } from '../hooks/useWeather';
import { useStore } from '../store';
import LocationSearch, { LocationResult } from '../components/LocationSearch';

// Weather condition icon mapping
const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      return <Sun className="w-8 h-8 text-yellow-500" />;
    case 'clouds':
    case 'partly cloudy':
    case 'scattered clouds':
    case 'broken clouds':
    case 'overcast clouds':
      return <Cloud className="w-8 h-8 text-gray-500" />;
    case 'rain':
    case 'shower rain':
    case 'light rain': 
    case 'scattered showers':
      return <Umbrella className="w-8 h-8 text-blue-500" />;
    default:
      return <Sun className="w-8 h-8 text-yellow-500" />;
  }
};

const severityColors = {
  low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200',
  moderate: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200',
  high: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200',
  severe: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-200'
};

export default function Weather() {
  const { t } = useTranslation();
  const [customLocation, setCustomLocation] = useState<LocationResult | null>(null);
  const { data: weatherData, loading, error, currentLocation, refetch } = useWeather({
    customLocation: customLocation || undefined
  });

  const handleLocationSelect = (location: LocationResult) => {
    setCustomLocation(location);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
          <Cloud className="w-8 h-8" />
          {t('nav.weather')}
        </h1>
        
        <div className="w-full md:w-72">
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            currentLocation={{
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              name: currentLocation.name ? `${currentLocation.name}${currentLocation.country ? `, ${currentLocation.country}` : ''}` : undefined
            }}
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">{t('common.error')}</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Make sure you've allowed location access and check your internet connection.
          </p>
        </div>
      ) : !weatherData ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">No weather data available.</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                {t('weather.current.title')}
              </h2>
              {currentLocation.name && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-lg">
                  <MapPin className="w-5 h-5 mr-1" /> 
                  {currentLocation.name}
                  {currentLocation.country && <span>, {currentLocation.country}</span>}
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">{t('weather.current.temperature')}</h3>
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold dark:text-white">{weatherData.current.temperature}°C</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {t('weather.current.feelsLike')} {weatherData.current.feelsLike}°C
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">{t('weather.current.humidity')}</h3>
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold dark:text-white">{weatherData.current.humidity}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {t('weather.current.visibility')} {weatherData.current.visibility}km
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">{t('weather.current.windSpeed')}</h3>
                  <Wind className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-3xl font-bold dark:text-white">{weatherData.current.windSpeed} km/h</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {t('weather.current.pressure')} {weatherData.current.pressure}hPa
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">{t('weather.current.uvIndex')}</h3>
                  <Sun className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold dark:text-white">{weatherData.current.uvIndex}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {weatherData.current.uvIndex > 7 ? 'High exposure risk' : 
                   weatherData.current.uvIndex > 4 ? 'Moderate exposure risk' : 'Low exposure risk'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6 dark:text-white">{t('weather.forecast.hourly')}</h3>
                <div className="grid grid-cols-5 gap-4">
                  {weatherData.hourly.map((hour: any, index: number) => (
                    <div key={index} className="text-center">
                      <p className="text-sm font-medium dark:text-white mb-2">{hour.time}</p>
                      {getWeatherIcon(hour.condition)}
                      <p className="text-lg font-bold dark:text-white">{hour.temp}°</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{hour.condition}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6 dark:text-white">{t('weather.forecast.daily')}</h3>
                <div className="space-y-4">
                  {weatherData.forecast.map((day: any, index: number) => (
                    <div key={index} className="grid grid-cols-4 items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div>
                        <p className="font-medium dark:text-white">{day.day}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.condition}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('weather.forecast.temp')}</p>
                        <p className="font-medium dark:text-white">{day.high}° / {day.low}°</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('weather.forecast.precip')}</p>
                        <p className="font-medium dark:text-white">{day.precipitation}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('weather.forecast.wind')}</p>
                        <p className="font-medium dark:text-white">{day.windSpeed} km/h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t('weather.alerts.title')}
                </h3>
                <div className="space-y-4">
                  {weatherData.alerts && weatherData.alerts.length > 0 ? (
                    weatherData.alerts.map((alert: any, index: number) => (
                      <div
                        key={index}
                        className={`border-l-4 p-4 rounded-lg ${severityColors[alert.severity]}`}
                      >
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <h4 className="font-semibold">{alert.type}</h4>
                        </div>
                        <p className="mb-2">{alert.description}</p>
                        <div className="text-sm space-y-1">
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {t('weather.alerts.valid')}: {new Date(alert.startTime).toLocaleDateString()} - {new Date(alert.endTime).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <p className="font-medium mb-1">{t('weather.alerts.recommendations')}:</p>
                            <ul className="list-disc list-inside">
                              {alert.recommendations.map((rec: string, idx: number) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        No active weather alerts at this time.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">{t('weather.farming.title')}</h3>
                <div className="space-y-4">
                  {weatherData.farming && weatherData.farming.length > 0 ? (
                    weatherData.farming.map((advice: any, index: number) => (
                      <div
                        key={index}
                        className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">{advice.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            advice.importance === 'high' ? 'bg-red-100 text-red-800' :
                            advice.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {advice.importance.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300">{advice.description}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                          {t('weather.farming.validUntil')}: {new Date(advice.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        No farming advisories available at this time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}