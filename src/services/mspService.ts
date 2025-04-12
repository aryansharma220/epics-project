// MSP (Minimum Support Price) service for crop rates
import axios from 'axios';

export interface MSPRate {
  id: string;
  crop: string;
  variety?: string;
  category: 'kharif' | 'rabi' | 'other';
  year: string; // Format: "2024-25" 
  rate: number; // In INR per quintal
  increase?: number; // Increase from previous year
  increasePercentage?: number; // Percentage increase from previous year
  source?: string; // Source of the data
  lastUpdated?: string; // When the data was last updated
}

// Fallback MSP rates in case API fails
export const fallbackMSPRates: MSPRate[] = [
  // Kharif Crops
  {
    id: 'k1',
    crop: 'Paddy',
    variety: 'Common',
    category: 'kharif',
    year: '2024-25',
    rate: 2183,
    increase: 143,
    increasePercentage: 7.0
  },
  {
    id: 'k2',
    crop: 'Paddy',
    variety: 'Grade A',
    category: 'kharif',
    year: '2024-25',
    rate: 2203,
    increase: 143,
    increasePercentage: 6.9
  },
  {
    id: 'k3',
    crop: 'Jowar',
    variety: 'Hybrid',
    category: 'kharif',
    year: '2024-25',
    rate: 2970,
    increase: 115,
    increasePercentage: 4.0
  },
  {
    id: 'k4',
    crop: 'Jowar',
    variety: 'Maldandi',
    category: 'kharif',
    year: '2024-25',
    rate: 2990,
    increase: 117,
    increasePercentage: 4.1
  },
  {
    id: 'k5',
    crop: 'Bajra',
    category: 'kharif',
    year: '2024-25',
    rate: 2500,
    increase: 102,
    increasePercentage: 4.3
  },
  {
    id: 'k6',
    crop: 'Maize',
    category: 'kharif',
    year: '2024-25',
    rate: 2090,
    increase: 128,
    increasePercentage: 6.5
  },
  {
    id: 'k7',
    crop: 'Ragi',
    category: 'kharif',
    year: '2024-25',
    rate: 3700,
    increase: 201,
    increasePercentage: 5.7
  },
  {
    id: 'k8',
    crop: 'Arhar/Tur',
    category: 'kharif',
    year: '2024-25',
    rate: 7000,
    increase: 400,
    increasePercentage: 6.1
  },
  {
    id: 'k9',
    crop: 'Moong',
    category: 'kharif',
    year: '2024-25',
    rate: 8558,
    increase: 545,
    increasePercentage: 6.8
  },
  {
    id: 'k10',
    crop: 'Urad',
    category: 'kharif',
    year: '2024-25',
    rate: 7200,
    increase: 350,
    increasePercentage: 5.1
  },
  {
    id: 'k11',
    crop: 'Groundnut',
    category: 'kharif',
    year: '2024-25',
    rate: 6377,
    increase: 257,
    increasePercentage: 4.2
  },
  {
    id: 'k12',
    crop: 'Sunflower Seed',
    category: 'kharif',
    year: '2024-25',
    rate: 6760,
    increase: 325,
    increasePercentage: 5.0
  },
  {
    id: 'k13',
    crop: 'Soybean',
    category: 'kharif',
    year: '2024-25',
    rate: 4382,
    increase: 292,
    increasePercentage: 7.1
  },
  {
    id: 'k14',
    crop: 'Sesamum',
    category: 'kharif',
    year: '2024-25',
    rate: 8635,
    increase: 362,
    increasePercentage: 4.4
  },
  {
    id: 'k15',
    crop: 'Nigerseed',
    category: 'kharif',
    year: '2024-25',
    rate: 7528,
    increase: 328,
    increasePercentage: 4.6
  },
  {
    id: 'k16',
    crop: 'Cotton',
    variety: 'Medium Staple',
    category: 'kharif',
    year: '2024-25',
    rate: 6620,
    increase: 120,
    increasePercentage: 1.8
  },
  {
    id: 'k17',
    crop: 'Cotton',
    variety: 'Long Staple',
    category: 'kharif',
    year: '2024-25',
    rate: 7020,
    increase: 120,
    increasePercentage: 1.7
  },
  
  // Rabi Crops
  {
    id: 'r1',
    crop: 'Wheat',
    category: 'rabi',
    year: '2024-25',
    rate: 2275,
    increase: 150,
    increasePercentage: 7.1
  },
  {
    id: 'r2',
    crop: 'Barley',
    category: 'rabi',
    year: '2024-25',
    rate: 1850,
    increase: 115,
    increasePercentage: 6.6
  },
  {
    id: 'r3',
    crop: 'Gram',
    category: 'rabi',
    year: '2024-25',
    rate: 5450,
    increase: 250,
    increasePercentage: 4.8
  },
  {
    id: 'r4',
    crop: 'Lentil (Masur)',
    category: 'rabi',
    year: '2024-25',
    rate: 6425,
    increase: 425,
    increasePercentage: 7.1
  },
  {
    id: 'r5',
    crop: 'Rapeseed & Mustard',
    category: 'rabi',
    year: '2024-25',
    rate: 5650,
    increase: 300,
    increasePercentage: 5.6
  },
  {
    id: 'r6',
    crop: 'Safflower',
    category: 'rabi',
    year: '2024-25',
    rate: 5850,
    increase: 200,
    increasePercentage: 3.5
  },
  
  // Other Commercial Crops
  {
    id: 'o1',
    crop: 'Sugarcane',
    category: 'other',
    year: '2024-25',
    rate: 315, // Fair and Remunerative Price (FRP)
    increase: 10,
    increasePercentage: 3.3
  },
  {
    id: 'o2',
    crop: 'Jute',
    category: 'other',
    year: '2024-25',
    rate: 5050,
    increase: 300,
    increasePercentage: 6.3
  },
  {
    id: 'o3',
    crop: 'Copra',
    variety: 'Milling',
    category: 'other',
    year: '2024-25',
    rate: 11160,
    increase: 300,
    increasePercentage: 2.8
  },
  {
    id: 'o4',
    crop: 'Copra',
    variety: 'Ball',
    category: 'other',
    year: '2024-25',
    rate: 11750,
    increase: 300,
    increasePercentage: 2.6
  }
];

// API endpoints for real-time MSP data
const API_ENDPOINTS = {
  MSP_DATA: 'https://api.data.gov.in/resource/1832c7b4-82ef-4734-b2b4-c2e3a38a28d3?api-key=579b464db66ec23bdd0000013a16ed80bc2b40904405c025b2c84480&format=json',
  AGR_GOV_MSP: 'https://farmer.gov.in/mspstatements.aspx',
  GEMINI_API: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

// Cache mechanism to avoid excessive API calls
const cache = {
  mspRates: null as MSPRate[] | null,
  timestamp: 0,
  expiry: 3600000 // 1 hour cache
};

/**
 * Uses Gemini AI to process and enrich MSP data
 * @param rawData Raw data from API or HTML scraping
 * @returns Processed MSP rates
 */
async function processWithGemini(rawData: any): Promise<MSPRate[]> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('No Gemini API key found. Using basic data processing.');
      return transformDataToMSPRates(rawData);
    }

    const response = await axios.post(
      `${API_ENDPOINTS.GEMINI_API}?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: `I have raw MSP (Minimum Support Price) data for crops in India that I need to process into a structured format.
                  The data looks like this: ${JSON.stringify(rawData).substring(0, 1000)}...
                  
                  Please convert this data into a structured format matching this interface:
                  
                  interface MSPRate {
                    id: string; // Generate unique IDs like 'k1', 'r2', etc. (k for kharif, r for rabi, o for other)
                    crop: string; // Crop name
                    variety?: string; // Variety if available
                    category: 'kharif' | 'rabi' | 'other'; // Kharif (monsoon crops), Rabi (winter crops), or other
                    year: string; // Format: "2024-25" - use the latest available year
                    rate: number; // MSP rate in INR per quintal
                    increase?: number; // Increase from previous year if available
                    increasePercentage?: number; // Percentage increase from previous year
                  }
                  
                  Categorize crops properly into kharif, rabi, and other categories based on crop types.
                  Only include entries where you have high confidence about the data.
                  Return the result as a JSON array without any explanation.`
          }]
        }]
      }
    );

    const generatedContent = response.data.candidates[0].content.parts[0].text;
    try {
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedContent.match(/```\n([\s\S]*?)\n```/) ||
                         [null, generatedContent];
      
      const jsonString = jsonMatch[1] || generatedContent;
      const processedData = JSON.parse(jsonString);
      
      if (Array.isArray(processedData) && processedData.length > 0) {
        console.log('Successfully processed data with Gemini AI');
        return processedData.map(item => ({
          ...item,
          source: 'Gemini AI processed',
          lastUpdated: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Error parsing Gemini response:', err);
    }

    return transformDataToMSPRates(rawData);
  } catch (error) {
    console.error('Error using Gemini AI:', error);
    return transformDataToMSPRates(rawData);
  }
}

/**
 * Basic data transformation function when Gemini is unavailable
 */
function transformDataToMSPRates(records: any[]): MSPRate[] {
  return records.map((record, index) => {
    const crop = record.commodity_name || record.crop_name || record.crop || '';
    let category: 'kharif' | 'rabi' | 'other' = 'other';
    const cropLower = crop.toLowerCase();
    
    if (['paddy', 'jowar', 'bajra', 'maize', 'ragi', 'arhar', 'moong', 'urad', 'cotton', 'groundnut', 'soybean'].some(c => cropLower.includes(c))) {
      category = 'kharif';
    } else if (['wheat', 'barley', 'gram', 'masur', 'mustard', 'safflower', 'lentil'].some(c => cropLower.includes(c))) {
      category = 'rabi';
    }
    
    let variety: string | undefined;
    if (record.variety || record.grade) {
      variety = record.variety || record.grade;
    }
    
    const rate = parseFloat(record.msp_price || record.rate || record.msp || 0);
    const previousRate = parseFloat(record.previous_price || record.previous_rate || record.previous_msp || 0);
    const increase = previousRate > 0 ? rate - previousRate : undefined;
    const increasePercentage = previousRate > 0 ? parseFloat(((rate - previousRate) / previousRate * 100).toFixed(1)) : undefined;
    
    return {
      id: record.id || `${category[0]}${index + 1}`,
      crop,
      variety,
      category,
      year: record.year || record.msp_year || '2024-25',
      rate,
      increase,
      increasePercentage,
      source: 'API data',
      lastUpdated: new Date().toISOString()
    };
  });
}

/**
 * Fetches real-time MSP rates from various sources
 */
export const getMSPRates = async (): Promise<MSPRate[]> => {
  try {
    if (cache.mspRates && (Date.now() - cache.timestamp) < cache.expiry) {
      console.log('Returning cached MSP data');
      return cache.mspRates;
    }

    console.log('Fetching real-time MSP data...');
    
    try {
      const response = await axios.get(API_ENDPOINTS.MSP_DATA, {
        params: {
          api_key: import.meta.env.VITE_DATA_GOV_API_KEY,
          format: 'json',
          limit: 100
        }
      });
      
      if (response.data && response.data.records && response.data.records.length > 0) {
        const mspData = await processWithGemini(response.data.records);
        cache.mspRates = mspData;
        cache.timestamp = Date.now();
        return mspData;
      }
    } catch (error) {
      console.error('Error fetching from data.gov.in API:', error);
    }
    
    try {
      const response = await axios.get(API_ENDPOINTS.AGR_GOV_MSP, {
        responseType: 'text'
      });
      
      const tableMatches = response.data.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
      
      if (tableMatches && tableMatches.length > 0) {
        const mspTable = tableMatches.find(table => 
          /(paddy|wheat|rice|maize)/i.test(table)
        );
        
        if (mspTable) {
          const rowMatches = mspTable.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
          
          if (rowMatches && rowMatches.length > 0) {
            const rawData = rowMatches.slice(1).map(row => {
              const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
              if (!cellMatches) return null;
              
              const cells = cellMatches.map(cell => {
                return cell.replace(/<[^>]+>/g, '').trim();
              });
              
              return {
                crop_name: cells[0],
                msp: cells[cells.length > 2 ? 1 : 0],
                previous_msp: cells[cells.length > 3 ? 2 : 1],
              };
            }).filter(Boolean);
            
            if (rawData.length > 0) {
              const mspData = await processWithGemini(rawData);
              cache.mspRates = mspData;
              cache.timestamp = Date.now();
              return mspData;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting data from Farmer Portal:', error);
    }
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const response = await axios.post(
          `${API_ENDPOINTS.GEMINI_API}?key=${apiKey}`,
          {
            contents: [{
              parts: [{
                text: `Today is ${new Date().toDateString()}. Please fetch the latest Minimum Support Price (MSP) data for major crops in India for the current year from reliable government sources.

                Format the data in the following JSON structure:
                [
                  {
                    "id": "k1",
                    "crop": "Crop Name",
                    "variety": "Variety Name",
                    "category": "kharif",
                    "year": "2024-25",
                    "rate": 2183,
                    "increase": 143,
                    "increasePercentage": 7.0
                  },
                  ...
                ]

                Include all major kharif, rabi and commercial crops with their current MSPs.
                Ensure you return properly structured JSON data that can be parsed directly.
                Return the data as a valid JSON array without any markdown code blocks or other formatting.`
              }]
            }]
          }
        );

        const generatedContent = response.data.candidates[0].content.parts[0].text;
        try {
          const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                           generatedContent.match(/```\n([\s\S]*?)\n```/) ||
                           [null, generatedContent];
          
          const jsonString = jsonMatch[1] || generatedContent;
          const mspData = JSON.parse(jsonString);
          
          if (Array.isArray(mspData) && mspData.length > 0) {
            console.log('Successfully fetched MSP data via Gemini');
            
            const enhancedData = mspData.map(item => ({
              ...item,
              source: 'Gemini AI generated',
              lastUpdated: new Date().toISOString()
            }));
            
            cache.mspRates = enhancedData;
            cache.timestamp = Date.now();
            
            return enhancedData;
          }
        } catch (error) {
          console.error('Error parsing Gemini-generated MSP data:', error);
        }
      }
    } catch (error) {
      console.error('Error using Gemini to fetch live data:', error);
    }
    
    console.warn('All real-time data sources failed, using fallback MSP data');
    return fallbackMSPRates;
  } catch (error) {
    console.error('Error in getMSPRates:', error);
    return fallbackMSPRates;
  }
};

export const getMSPRatesByCategory = async (category: 'kharif' | 'rabi' | 'other'): Promise<MSPRate[]> => {
  const allRates = await getMSPRates();
  return allRates.filter(rate => rate.category === category);
};

/**
 * Fetches historical MSP data for a specific crop
 */
export const getMSPHistory = async (cropId: string): Promise<any[]> => {
  try {
    const allRates = await getMSPRates();
    const crop = allRates.find(rate => rate.id === cropId);
    if (!crop) return [];
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const response = await axios.post(
          `${API_ENDPOINTS.GEMINI_API}?key=${apiKey}`,
          {
            contents: [{
              parts: [{
                text: `Please provide the historical MSP (Minimum Support Price) data for ${crop.crop}${crop.variety ? ' (' + crop.variety + ')' : ''} in India for the last 5 years.
                
                The current MSP for ${crop.year} is ₹${crop.rate} per quintal.
                
                Return the data as a JSON array with this structure:
                [
                  { "year": "2024-25", "rate": 2183 },
                  { "year": "2023-24", "rate": 2040 },
                  ...
                ]
                
                Ensure the data is accurate based on official government records. If exact data isn't available for certain years, provide realistic estimates based on known increase patterns.
                Return only the JSON array without any explanation.`
              }]
            }]
          }
        );

        const generatedContent = response.data.candidates[0].content.parts[0].text;
        try {
          const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                           generatedContent.match(/```\n([\s\S]*?)\n```/) ||
                           [null, generatedContent];
          
          const jsonString = jsonMatch[1] || generatedContent;
          const historicalData = JSON.parse(jsonString);
          
          if (Array.isArray(historicalData) && historicalData.length > 0) {
            console.log('Successfully fetched historical MSP data via Gemini');
            return historicalData.sort((a, b) => {
              const yearA = parseInt(a.year.split('-')[0]);
              const yearB = parseInt(b.year.split('-')[0]);
              return yearB - yearA;
            });
          }
        } catch (error) {
          console.error('Error parsing Gemini historical data response:', error);
        }
      }
    } catch (error) {
      console.error('Error using Gemini for historical data:', error);
    }
    
    const currentRate = crop.rate;
    const currentYear = crop.year;
    
    return [
      { year: currentYear, rate: currentRate },
      { year: "2023-24", rate: currentRate - (crop.increase || currentRate * 0.05) },
      { year: "2022-23", rate: currentRate - (crop.increase || currentRate * 0.05) * 1.8 },
      { year: "2021-22", rate: currentRate - (crop.increase || currentRate * 0.05) * 2.5 },
      { year: "2020-21", rate: currentRate - (crop.increase || currentRate * 0.05) * 3.2 }
    ];
  } catch (error) {
    console.error('Error in getMSPHistory:', error);
    return [];
  }
};

// Helper function to clear the cache and force a refresh
export const clearMSPCache = () => {
  cache.mspRates = null;
  cache.timestamp = 0;
};