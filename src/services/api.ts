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
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
  );
  return await response.json();
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
