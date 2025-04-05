import { Product, Order, MarketStats } from '../types/marketplace';

const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Rice Seeds',
    category: 'seeds',
    price: 120,
    quantity: 50,
    unit: 'kg',
    seller: {
      id: 's1',
      name: 'FarmFresh Seeds',
      rating: 4.5,
      location: 'Punjab'
    },
    description: 'High-yield organic rice seeds with 95% germination rate',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c',
      'https://images.unsplash.com/photo-1591904340315-29dc64be0b8a'
    ],
    quality: 'premium',
    inStock: true,
    ratings: {
      average: 4.5,
      count: 128
    },
    specifications: {
      'Germination Rate': '95%',
      'Growth Period': '120-130 days',
      'Seed Treatment': 'Yes'
    },
    certification: ['Organic Certified', 'Non-GMO']
  },
  {
    id: '2',
    name: 'NPK Fertilizer',
    category: 'fertilizers',
    price: 850,
    quantity: 100,
    unit: 'kg',
    seller: {
      id: 's2',
      name: 'AgroChemicals Ltd',
      rating: 4.2,
      location: 'Gujarat'
    },
    description: 'Balanced NPK fertilizer for optimal crop growth',
    images: [
      'https://images.unsplash.com/photo-1628068010411-a1e6f8926c4e',
      'https://images.unsplash.com/photo-1628067630123-facc3ff2c23c'
    ],
    quality: 'standard',
    inStock: true,
    ratings: { average: 4.2, count: 89 },
    specifications: {
      'N:P:K Ratio': '14:14:14',
      'Application Rate': '100-150 kg/ha',
      'Packaging': '50 kg bags'
    }
  },
  {
    id: '3',
    name: 'Tractor Cultivator',
    category: 'equipment',
    price: 45000,
    quantity: 5,
    unit: 'piece',
    seller: {
      id: 's3',
      name: 'AgriMachines',
      rating: 4.7,
      location: 'Maharashtra'
    },
    description: 'Heavy-duty cultivator for efficient soil preparation',
    images: [
      'https://images.unsplash.com/photo-1592284441902-bd5fde3e6f87',
      'https://images.unsplash.com/photo-1590682680695-43b964a3ae17'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.7, count: 45 },
    specifications: {
      'Working Width': '1.8m',
      'Number of Tines': '9',
      'Power Required': '35-40 HP'
    }
  },
  {
    id: '4',
    name: 'Hybrid Wheat Seeds',
    category: 'seeds',
    price: 180,
    quantity: 75,
    unit: 'kg',
    seller: {
      id: 's4',
      name: 'SeedTech Solutions',
      rating: 4.6,
      location: 'Haryana'
    },
    description: 'High-yielding wheat variety with rust resistance',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      'https://images.unsplash.com/photo-1560806175-3b5e3b4b5be3'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.6, count: 92 },
    certification: ['Quality Certified', 'Research Backed']
  },
  {
    id: '5',
    name: 'Drip Irrigation Kit',
    category: 'equipment',
    price: 12500,
    quantity: 20,
    unit: 'set',
    seller: {
      id: 's5',
      name: 'IrriTech',
      rating: 4.4,
      location: 'Karnataka'
    },
    description: 'Complete drip irrigation system for 1 acre',
    images: [
      'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0',
      'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea'
    ],
    quality: 'standard',
    inStock: true,
    ratings: { average: 4.4, count: 67 },
    specifications: {
      'Coverage': '1 acre',
      'Pipe Type': 'HDPE',
      'Dripper Spacing': '30cm'
    }
  },
  {
    id: '6',
    name: 'Bio-Organic Fertilizer',
    category: 'fertilizers',
    price: 450,
    quantity: 200,
    unit: 'kg',
    seller: {
      id: 's6',
      name: 'OrganicLife',
      rating: 4.8,
      location: 'Kerala'
    },
    description: 'Natural fertilizer enriched with beneficial microorganisms',
    images: [
      'https://images.unsplash.com/photo-1589876876491-df43b4d68c1f',
      'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.8, count: 156 },
    certification: ['Organic Certified', 'Eco-Friendly']
  },
  {
    id: '7',
    name: 'Pesticide Sprayer',
    category: 'equipment',
    price: 2800,
    quantity: 30,
    unit: 'piece',
    seller: {
      id: 's7',
      name: 'FarmTools Pro',
      rating: 4.3,
      location: 'Tamil Nadu'
    },
    description: 'Battery-operated backpack sprayer with adjustable nozzle',
    images: [
      'https://images.unsplash.com/photo-1598512199776-e0aa240c8181',
      'https://images.unsplash.com/photo-1598512199776-e0aa240c8181'
    ],
    quality: 'standard',
    inStock: true,
    ratings: { average: 4.3, count: 89 }
  },
  {
    id: '8',
    name: 'Sugarcane Seeds',
    category: 'seeds',
    price: 220,
    quantity: 100,
    unit: 'bundle',
    seller: {
      id: 's8',
      name: 'CropMaster',
      rating: 4.5,
      location: 'Uttar Pradesh'
    },
    description: 'Disease-resistant sugarcane variety for high sugar content',
    images: [
      'https://images.unsplash.com/photo-1596873035758-0c05fde7f347',
      'https://images.unsplash.com/photo-1596873035767-3c648a78e845'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.5, count: 73 }
  },
  {
    id: '9',
    name: 'Soil Testing Kit',
    category: 'equipment',
    price: 1500,
    quantity: 15,
    unit: 'kit',
    seller: {
      id: 's9',
      name: 'AgriLab',
      rating: 4.6,
      location: 'Delhi'
    },
    description: 'Professional soil testing kit with digital pH meter',
    images: [
      'https://images.unsplash.com/photo-1584621781231-d5c13e144b54',
      'https://images.unsplash.com/photo-1584621781231-d5c13e144b54'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.6, count: 42 }
  },
  {
    id: '10',
    name: 'Potash Fertilizer',
    category: 'fertilizers',
    price: 750,
    quantity: 150,
    unit: 'kg',
    seller: {
      id: 's10',
      name: 'NutriSoil',
      rating: 4.4,
      location: 'Bihar'
    },
    description: 'High-grade potassium fertilizer for better crop quality',
    images: [
      'https://images.unsplash.com/photo-1566884292500-bf8c2bf51b28',
      'https://images.unsplash.com/photo-1566884292500-bf8c2bf51b28'
    ],
    quality: 'standard',
    inStock: true,
    ratings: { average: 4.4, count: 98 }
  },
  {
    id: '11',
    name: 'Mini Tiller',
    category: 'equipment',
    price: 35000,
    quantity: 8,
    unit: 'piece',
    seller: {
      id: 's11',
      name: 'PowerTools',
      rating: 4.7,
      location: 'Gujarat'
    },
    description: 'Compact tiller for small farms and gardens',
    images: [
      'https://images.unsplash.com/photo-1598458255717-406d3773be8f',
      'https://images.unsplash.com/photo-1598458255717-406d3773be8f'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.7, count: 34 }
  },
  {
    id: '12',
    name: 'Vermicompost',
    category: 'fertilizers',
    price: 320,
    quantity: 250,
    unit: 'kg',
    seller: {
      id: 's12',
      name: 'EcoFarm',
      rating: 4.9,
      location: 'Madhya Pradesh'
    },
    description: 'Pure organic vermicompost for healthy soil',
    images: [
      'https://images.unsplash.com/photo-1584621781231-d5c13e144b54',
      'https://images.unsplash.com/photo-1584621781231-d5c13e144b54'
    ],
    quality: 'premium',
    inStock: true,
    ratings: { average: 4.9, count: 187 },
    certification: ['Organic Certified', 'Chemical Free']
  }
];

export const marketplaceService = {
  getProducts: async (filters?: Record<string, any>): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    let filtered = [...dummyProducts];

    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.quality) {
        filtered = filtered.filter(p => p.quality === filters.quality);
      }
    }

    return filtered;
  },

  getMarketStats: async (): Promise<MarketStats> => {
    const stats: MarketStats = {
      totalProducts: dummyProducts.length,
      activeListings: dummyProducts.filter(p => p.inStock).length,
      averagePrice: dummyProducts.reduce((acc, p) => acc + p.price, 0) / dummyProducts.length,
      topCategories: [
        { category: 'seeds', count: 15 },
        { category: 'fertilizers', count: 12 },
        { category: 'equipment', count: 8 }
      ]
    };
    return stats;
  },

  placeOrder: async (order: Omit<Order, 'id' | 'status' | 'orderDate'>): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return {
      ...order,
      id: `ord_${Date.now()}`,
      status: 'pending',
      orderDate: new Date().toISOString()
    };
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const normalizedQuery = query.toLowerCase();
    return dummyProducts.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery)
    );
  },

  sortProducts: (products: Product[], sortBy: string): Product[] => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.ratings.average - a.ratings.average;
        default: return 0;
      }
    });
  }
};
