export interface CropData {
  month: string;
  yield: number;
  target: number;
  rainfall: number;
  temperature: number;
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

export interface AnalysisResult {
  totalYield: number;
  yieldTrend: number;
  averageRainfall: number;
  recommendedActions: string[];
  predictedYield: number;
  cropAnalysis: CropAnalysis;
  forecastData: {
    nextMonth: {
      expectedYield: number;
      requiredRainfall: number;
      potentialRisks: string[];
    };
  };
}

export interface DashboardStats {
  totalYield: number;
  rainfall: number;
  revenue: number;
  pendingTasks: number;
}
