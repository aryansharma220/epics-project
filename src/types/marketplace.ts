export interface Product {
  id: string;
  name: string;
  category: 'crops' | 'seeds' | 'fertilizers' | 'equipment';
  price: number;
  quantity: number;
  unit: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    location: string;
  };
  description: string;
  images: string[];
  quality: 'premium' | 'standard' | 'economy';
  inStock: boolean;
  ratings: {
    average: number;
    count: number;
  };
  specifications?: Record<string, string>;
  certification?: string[];
}

export interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  paymentMethod: string;
  shippingAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface MarketStats {
  totalProducts: number;
  activeListings: number;
  averagePrice: number;
  topCategories: Array<{ category: string; count: number }>;
}

export interface CropAnalysis {
  seasonalTrends: {
    season: string;
    avgYield: number;
    avgRainfall: number;
    performance: 'good' | 'average' | 'poor';
  }[];
  efficiencyMetrics: {
    yieldEfficiency: number;
    waterUsageEfficiency: number;
    targetAchievement: number;
  };
  riskFactors: {
    type: string;
    risk: 'high' | 'medium' | 'low';
    description: string;
  }[];
  suggestions: {
    category: string;
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}
