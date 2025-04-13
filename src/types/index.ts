export interface WeatherData {
  temperature: number;
  rainfall: number;
  forecast: string;
  alerts: string[];
}

export interface CropData {
  name: string;
  suitability: number;
  recommendations: string[];
  growthPeriod: number;
  waterRequirement: string;
  soilType: string[];
  expectedYield: string;
  pestRisks: string[];
  diseases: string[];
  nutrients: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}

export interface MarketItem {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'equipment' | 'pesticides' | 'tools';
  price: number;
  seller: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: number;
  specifications?: {
    [key: string]: string;
  };
}

export interface UserPreferences {
  isDarkMode: boolean;
  language: string;
  location: {
    lat: number;
    lng: number;
  };
  measurementUnit: 'metric' | 'imperial';
  currency: 'INR' | 'USD';
  notifications: {
    weather: boolean;
    market: boolean;
    tasks: boolean;
  };
}

export interface SoilData {
  ph: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicMatter: number;
  moisture: number;
  temperature: number;
  texture: string;
  recommendations: string[];
}

export interface WeatherAlert {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  description: string;
  startTime: string;
  endTime: string;
  recommendations: string[];
}

export interface FarmingTask {
  id: string;
  title: string;
  description: string;
  due: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: 'planting' | 'irrigation' | 'fertilization' | 'harvesting' | 'maintenance';
  assignedTo?: string;
  notes?: string[];
  attachments?: string[];
}

export interface CropYield {
  month: string;
  yield: number;
  target: number;
  rainfall: number;
  temperature: number;
  notes?: string;
}

export interface Scheme {
  id: string;
  name: string;
  category: 'agriculture' | 'financial' | 'insurance' | 'other';
  ministry: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string;
  budget?: number;
  website?: string;
  lastUpdated?: string;
  eligibilityFields: EligibilityField[];
  metrics?: {
    beneficiaries?: number;
    successRate?: number;
    popularityScore?: number;
    statesCovered?: number;
    avgPayout?: number;
  };
  documents?: string[];
  timeline?: {
    applicationStart?: string;
    applicationEnd?: string;
    implementationStart?: string;
    completionDate?: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface EligibilityField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { label: string; value: string }[];
  required: boolean;
}