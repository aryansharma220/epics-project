import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Wind, Sun, AlertTriangle, Thermometer, Umbrella, Clock } from 'lucide-react';
import type { WeatherAlert } from '../types';

const weatherData = {
  current: {
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    feelsLike: 30,
    pressure: 1012,
    visibility: 10,
    uvIndex: 6,
    precipitation: {
      probability: 20,
      type: 'rain',
      intensity: 'light'
    }
  },
  forecast: [
    { 
      day: 'Today',
      high: 28,
      low: 22,
      condition: 'Partly Cloudy',
      precipitation: 20,
      humidity: 65,
      windSpeed: 12
    },
    { 
      day: 'Tomorrow',
      high: 27,
      low: 21,
      condition: 'Sunny',
      precipitation: 10,
      humidity: 60,
      windSpeed: 10
    },
    { 
      day: 'Wednesday',
      high: 29,
      low: 23,
      condition: 'Scattered Showers',
      precipitation: 60,
      humidity: 75,
      windSpeed: 15
    },
    { 
      day: 'Thursday',
      high: 26,
      low: 20,
      condition: 'Sunny',
      precipitation: 5,
      humidity: 55,
      windSpeed: 8
    },
    { 
      day: 'Friday',
      high: 25,
      low: 19,
      condition: 'Clear',
      precipitation: 0,
      humidity: 50,
      windSpeed: 6
    },
  ],
  alerts: [
    {
      type: 'Heavy Rain Warning',
      severity: 'moderate',
      description: 'Expected heavy rainfall in the next 48 hours. Protect your crops.',
      startTime: '2024-03-20T10:00:00',
      endTime: '2024-03-22T10:00:00',
      recommendations: [
        'Cover sensitive crops',
        'Check drainage systems',
        'Postpone fertilizer application'
      ]
    },
    {
      type: 'High Temperature Alert',
      severity: 'high',
      description: 'Temperatures expected to reach 35°C. Risk of heat stress to crops.',
      startTime: '2024-03-21T12:00:00',
      endTime: '2024-03-21T18:00:00',
      recommendations: [
        'Increase irrigation frequency',
        'Apply mulch to retain moisture',
        'Monitor for signs of heat stress'
      ]
    }
  ] as WeatherAlert[],
  farming: [
    {
      title: 'Irrigation Advisory',
      description: 'Skip irrigation for the next 2 days due to expected rainfall.',
      importance: 'high',
      validUntil: '2024-03-22T23:59:59'
    },
    {
      title: 'Pest Alert',
      description: 'High humidity levels increase risk of fungal diseases. Monitor crops closely.',
      importance: 'medium',
      validUntil: '2024-03-23T23:59:59'
    },
    {
      title: 'Harvest Planning',
      description: 'Favorable conditions for harvest expected by end of week.',
      importance: 'low',
      validUntil: '2024-03-24T23:59:59'
    }
  ],
  hourly: [
    { time: '09:00', temp: 24, condition: 'Sunny' },
    { time: '12:00', temp: 28, condition: 'Partly Cloudy' },
    { time: '15:00', temp: 30, condition: 'Scattered Clouds' },
    { time: '18:00', temp: 27, condition: 'Clear' },
    { time: '21:00', temp: 23, condition: 'Clear' }
  ]
};

const severityColors = {
  low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200',
  moderate: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200',
  high: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200',
  severe: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-200'
};

export default function Weather() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Current Weather</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Temperature</h3>
              <Thermometer className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold dark:text-white">{weatherData.current.temperature}°C</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Feels like {weatherData.current.feelsLike}°C
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Humidity</h3>
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold dark:text-white">{weatherData.current.humidity}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Visibility {weatherData.current.visibility}km
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Wind Speed</h3>
              <Wind className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-3xl font-bold dark:text-white">{weatherData.current.windSpeed} km/h</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Pressure {weatherData.current.pressure}hPa
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">UV Index</h3>
              <Sun className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold dark:text-white">{weatherData.current.uvIndex}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Moderate exposure risk
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 dark:text-white">Hourly Forecast</h3>
            <div className="grid grid-cols-5 gap-4">
              {weatherData.hourly.map((hour, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium dark:text-white mb-2">{hour.time}</p>
                  <Sun className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-lg font-bold dark:text-white">{hour.temp}°</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{hour.condition}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 dark:text-white">5-Day Forecast</h3>
            <div className="space-y-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="grid grid-cols-4 items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="font-medium dark:text-white">{day.day}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{day.condition}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Temp</p>
                    <p className="font-medium dark:text-white">{day.high}° / {day.low}°</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precip</p>
                    <p className="font-medium dark:text-white">{day.precipitation}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
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
              Weather Alerts
            </h3>
            <div className="space-y-4">
              {weatherData.alerts.map((alert, index) => (
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
                      Valid: {new Date(alert.startTime).toLocaleDateString()} - {new Date(alert.endTime).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <p className="font-medium mb-1">Recommendations:</p>
                      <ul className="list-disc list-inside">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Farming Advisories</h3>
            <div className="space-y-4">
              {weatherData.farming.map((advice, index) => (
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
                    Valid until: {new Date(advice.validUntil).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}