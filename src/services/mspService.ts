// MSP (Minimum Support Price) service for crop rates

export interface MSPRate {
  id: string;
  crop: string;
  variety?: string;
  category: 'kharif' | 'rabi' | 'other';
  year: string; // Format: "2024-25"
  rate: number; // In INR per quintal
  increase?: number; // Increase from previous year
  increasePercentage?: number; // Percentage increase from previous year
}

// MSP rates for various crops as per Government of India
// Latest data based on available government announcements
export const mspRates: MSPRate[] = [
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

export const getMSPRates = () => {
  // In a real application, this could fetch from an API
  return Promise.resolve(mspRates);
};

export const getMSPRatesByCategory = (category: 'kharif' | 'rabi' | 'other') => {
  return Promise.resolve(mspRates.filter(rate => rate.category === category));
};

export const getMSPHistory = (cropId: string) => {
  // In a real app, this would return historical MSP data for a specific crop
  // For now returning a mock response
  const crop = mspRates.find(rate => rate.id === cropId);
  if (!crop) return Promise.resolve([]);
  
  const currentRate = crop.rate;
  const currentYear = crop.year;
  
  // Generate mock historical data
  return Promise.resolve([
    { year: currentYear, rate: currentRate },
    { year: "2023-24", rate: currentRate - crop.increase! },
    { year: "2022-23", rate: currentRate - crop.increase! * 1.8 },
    { year: "2021-22", rate: currentRate - crop.increase! * 2.5 },
    { year: "2020-21", rate: currentRate - crop.increase! * 3.2 }
  ]);
};