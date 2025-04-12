import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CropData, SoilData } from '../types';
import axios from 'axios';
import { CropData as DashboardCropData, AnalysisResult, DashboardStats } from '../types/dashboard';
import { mockApi } from './mockApi';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);

// Cache storage
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Rate limiting
const rateLimiter = {
  lastCall: 0,
  minInterval: 1000, // 1 second between calls
};

function getCacheKey(type: string, lat: number, lng: number): string {
  return `${type}_${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastCall = now - rateLimiter.lastCall;
  
  if (timeSinceLastCall < rateLimiter.minInterval) {
    await new Promise(resolve => 
      setTimeout(resolve, rateLimiter.minInterval - timeSinceLastCall)
    );
  }
  
  rateLimiter.lastCall = Date.now();
  return fn();
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setInCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function cleanGeminiResponse(text: string): string {
  // Remove markdown code blocks and any other non-JSON content
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : text;
}

export async function getSoilData(lat: number, lng: number): Promise<SoilData> {
  const cacheKey = getCacheKey('soil', lat, lng);
  const cached = getFromCache<SoilData>(cacheKey);
  if (cached) return cached;

  try {
    const soilData = await withRateLimit(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `You are a soil analysis API. Respond only with pure JSON data (no markdown, no code blocks) in this format for location (${lat}, ${lng}): ${JSON.stringify({
        ph: 6.5,
        nitrogen: "Medium (250-350 kg/ha)",
        phosphorus: "High (40-50 kg/ha)",
        potassium: "Medium (170-190 kg/ha)",
        organicMatter: 2.5,
        moisture: 35,
        temperature: 25,
        texture: "Clay Loam",
        recommendations: [
          "Add organic matter to improve soil structure",
          "Monitor pH levels",
          "Consider nitrogen-fixing cover crops"
        ]
      })}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanedResponse = cleanGeminiResponse(response.text());
      return JSON.parse(cleanedResponse);
    });

    setInCache(cacheKey, soilData);
    return soilData;
  } catch (error) {
    console.error('Error generating soil data:', error);
    // Return default soil data if AI generation fails
    return {
      ph: 6.5,
      nitrogen: "Medium (250-350 kg/ha)",
      phosphorus: "High (40-50 kg/ha)",
      potassium: "Medium (170-190 kg/ha)",
      organicMatter: 2.5,
      moisture: 35,
      temperature: 25,
      texture: "Clay Loam",
      recommendations: [
        "Add organic matter to improve soil structure",
        "Monitor pH levels",
        "Consider nitrogen-fixing cover crops"
      ]
    };
  }
}

export async function getCropRecommendations(lat: number, lng: number, soilData: SoilData): Promise<CropData[]> {
  const cacheKey = getCacheKey('crops', lat, lng);
  const cached = getFromCache<CropData[]>(cacheKey);
  if (cached) return cached;

  try {
    const cropData = await withRateLimit(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `You are a crop recommendation API. Respond only with pure JSON data (no markdown, no code blocks) in this array format for location (${lat}, ${lng}): ${JSON.stringify([{
        name: "Example Crop",
        suitability: 85,
        recommendations: ["Example recommendation"],
        growthPeriod: 120,
        waterRequirement: "Medium",
        soilType: ["Clay Loam"],
        expectedYield: "4-5 tons/ha",
        pestRisks: ["Example pest"],
        diseases: ["Example disease"],
        nutrients: {
          nitrogen: "High",
          phosphorus: "Medium",
          potassium: "Low"
        }
      }])}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanedResponse = cleanGeminiResponse(response.text());
      return JSON.parse(cleanedResponse);
    });

    setInCache(cacheKey, cropData);
    return cropData;
  } catch (error) {
    console.error('Error generating crop recommendations:', error);
    return [{
      name: "Rice",
      suitability: 85,
      recommendations: [
        "Plant during monsoon season",
        "Ensure proper irrigation",
        "Monitor for pests"
      ],
      growthPeriod: 120,
      waterRequirement: "High",
      soilType: ["Clay", "Clay Loam"],
      expectedYield: "4-5 tons/ha",
      pestRisks: ["Stem Borer", "Leaf Folder"],
      diseases: ["Blast", "Blight"],
      nutrients: {
        nitrogen: "High",
        phosphorus: "Medium",
        potassium: "High"
      }
    }];
  }
}

export async function getWeatherData(lat: number, lng: number) {
  try {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    
    // Get current weather data
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    const currentWeatherData = await currentWeatherResponse.json();

    // Get 5-day forecast data (3-hour intervals)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Process data into our format
    return processWeatherData(currentWeatherData, forecastData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

function processWeatherData(currentData: any, forecastData: any) {
  // Process current weather
  const current = {
    temperature: Math.round(currentData.main.temp),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
    condition: currentData.weather[0].main,
    feelsLike: Math.round(currentData.main.feels_like),
    pressure: currentData.main.pressure,
    visibility: Math.round(currentData.visibility / 1000), // Convert m to km
    uvIndex: getUVIndex(currentData.clouds.all, currentData.weather[0].id),
    precipitation: {
      probability: getPrecipitationProbability(currentData.weather[0].id),
      type: getPrecipitationType(currentData.weather[0].id),
      intensity: getPrecipitationIntensity(currentData.weather[0].id)
    }
  };

  // Process hourly forecast (next 24 hours)
  const hourly = forecastData.list
    .slice(0, 8) // Get next 24 hours (3-hour intervals)
    .map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main
    }));

  // Process daily forecast (5 days)
  const dailyForecast = processDailyForecast(forecastData.list);

  // Process alerts
  const alerts = processAlerts(currentData, forecastData.list);

  // Generate farming advisories
  const farming = generateFarmingAdvisories(currentData, forecastData.list);

  return {
    current,
    hourly,
    forecast: dailyForecast,
    alerts,
    farming
  };
}

function processDailyForecast(forecastList: any[]) {
  // Group forecast by day
  const days = ['Today', 'Tomorrow'];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyData: Record<string, any[]> = {};
  
  forecastList.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    if (!dailyData[day]) dailyData[day] = [];
    dailyData[day].push(item);
  });

  // Process each day
  return Object.entries(dailyData).slice(0, 5).map(([day, items], index) => {
    const dayName = index < 2 ? days[index] : daysOfWeek[new Date(day).getDay()];
    const temps = items.map(item => item.main.temp);
    const high = Math.round(Math.max(...temps));
    const low = Math.round(Math.min(...temps));
    
    // Find most common condition
    const conditions = items.map(item => item.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const condition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];
    
    // Average values
    const precipitation = Math.round(items.reduce((sum, item) => sum + (item.pop || 0), 0) / items.length * 100);
    const humidity = Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length);
    const windSpeed = Math.round(items.reduce((sum, item) => sum + (item.wind.speed || 0), 0) / items.length * 3.6);

    return {
      day: dayName,
      high,
      low, 
      condition,
      precipitation,
      humidity,
      windSpeed
    };
  });
}

function getUVIndex(cloudiness: number, weatherId: number) {
  // Approximate UV index based on cloudiness and weather conditions
  const baseUV = 10 - Math.round((cloudiness / 100) * 10);
  if (weatherId >= 200 && weatherId < 700) return Math.max(1, Math.min(baseUV - 3, 11)); // Clouds or precipitation
  return Math.max(1, Math.min(baseUV, 11)); // Clear or mostly clear
}

function getPrecipitationProbability(weatherId: number) {
  if (weatherId >= 200 && weatherId < 300) return 80; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return 60; // Drizzle
  if (weatherId >= 500 && weatherId < 600) return 100; // Rain
  if (weatherId >= 600 && weatherId < 700) return 90; // Snow
  return 20; // Default
}

function getPrecipitationType(weatherId: number) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  return 'none';
}

function getPrecipitationIntensity(weatherId: number) {
  if ([202, 212, 221, 504, 511, 522, 531].includes(weatherId)) return 'heavy';
  if ([200, 201, 210, 211, 500, 501, 502, 520, 521].includes(weatherId)) return 'moderate';
  return 'light';
}

function processAlerts(currentData: any, forecastList: any[]) {
  const alerts: any[] = [];
  
  // Check for heavy rain
  const rainForecast = forecastList.filter(item => 
    item.weather[0].id >= 500 && item.weather[0].id < 600 && item.weather[0].id !== 500
  );
  if (rainForecast.length > 1) {
    alerts.push({
      type: 'Heavy Rain Warning',
      severity: 'moderate',
      description: 'Expected heavy rainfall in the next 48 hours. Protect your crops.',
      startTime: new Date(rainForecast[0].dt * 1000).toISOString(),
      endTime: new Date(rainForecast[rainForecast.length - 1].dt * 1000).toISOString(),
      recommendations: [
        'Cover sensitive crops',
        'Check drainage systems',
        'Postpone fertilizer application'
      ]
    });
  }

  // Check for high temperature
  const highTempForecast = forecastList.filter(item => item.main.temp > 32);
  if (highTempForecast.length > 0) {
    alerts.push({
      type: 'High Temperature Alert',
      severity: 'high',
      description: `Temperatures expected to reach ${Math.round(Math.max(...highTempForecast.map(item => item.main.temp)))}°C. Risk of heat stress to crops.`,
      startTime: new Date(highTempForecast[0].dt * 1000).toISOString(),
      endTime: new Date(highTempForecast[highTempForecast.length - 1].dt * 1000).toISOString(),
      recommendations: [
        'Increase irrigation frequency',
        'Apply mulch to retain moisture',
        'Monitor for signs of heat stress'
      ]
    });
  }

  // Check for strong winds
  const strongWindForecast = forecastList.filter(item => (item.wind.speed * 3.6) > 25);
  if (strongWindForecast.length > 0) {
    alerts.push({
      type: 'Strong Wind Alert',
      severity: 'moderate',
      description: `Strong winds expected with speeds up to ${Math.round(Math.max(...strongWindForecast.map(item => item.wind.speed * 3.6)))} km/h.`,
      startTime: new Date(strongWindForecast[0].dt * 1000).toISOString(),
      endTime: new Date(strongWindForecast[strongWindForecast.length - 1].dt * 1000).toISOString(),
      recommendations: [
        'Secure loose structures',
        'Protect young plants',
        'Delay spraying pesticides or fertilizers'
      ]
    });
  }

  return alerts;
}

function generateFarmingAdvisories(currentData: any, forecastList: any[]) {
  const advisories = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Irrigation advisory based on rainfall prediction
  const rainPrediction = forecastList.slice(0, 8).some(item => 
    item.weather[0].id >= 500 && item.weather[0].id < 600
  );
  
  if (rainPrediction) {
    advisories.push({
      title: 'Irrigation Advisory',
      description: 'Skip irrigation for the next 24 hours due to expected rainfall.',
      importance: 'high',
      validUntil: tomorrow.toISOString()
    });
  } else if (currentData.main.humidity < 50) {
    advisories.push({
      title: 'Irrigation Advisory',
      description: 'Low humidity detected. Increase irrigation frequency.',
      importance: 'medium',
      validUntil: tomorrow.toISOString()
    });
  }

  // Pest alert based on humidity and temperature
  if (currentData.main.humidity > 70 && currentData.main.temp > 25) {
    advisories.push({
      title: 'Pest Alert',
      description: 'High humidity and temperature increase risk of fungal diseases. Monitor crops closely.',
      importance: 'medium',
      validUntil: tomorrow.toISOString()
    });
  }

  // Harvest planning based on weather forecast
  const goodWeatherDays = forecastList.filter(item => 
    item.weather[0].id >= 800 && item.main.temp < 30 && item.main.temp > 15
  ).length;
  
  if (goodWeatherDays > 3) {
    advisories.push({
      title: 'Harvest Planning',
      description: 'Favorable conditions for harvest expected in the coming days.',
      importance: 'low',
      validUntil: nextWeek.toISOString()
    });
  }

  return advisories;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const cropDataApi = {
  async submitCropData(data: Omit<DashboardCropData, 'id'>): Promise<DashboardCropData> {
    try {
      // Use mock API instead of real endpoints for development
      return await mockApi.submitCropData(data);
    } catch (error) {
      throw new Error('Failed to submit crop data');
    }
  },

  async getAnalysis(): Promise<AnalysisResult> {
    try {
      return await mockApi.getAnalysis();
    } catch (error) {
      throw new Error('Failed to fetch analysis');
    }
  },

  async getRealtimeStats(): Promise<DashboardStats> {
    try {
      return await mockApi.getRealtimeStats();
    } catch (error) {
      throw new Error('Failed to fetch stats');
    }
  }
};
