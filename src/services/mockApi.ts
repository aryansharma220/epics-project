import { CropData, AnalysisResult, DashboardStats } from '../types/dashboard';
import { validateCropData } from '../utils/validation';

let mockCropData: CropData[] = [];

function analyzeCropData(data: CropData[]): CropAnalysis {
  if (data.length === 0) return getDefaultAnalysis();

  const seasonalTrends = calculateSeasonalTrends(data);
  const efficiencyMetrics = calculateEfficiencyMetrics(data);
  const riskFactors = assessRiskFactors(data);
  const suggestions = generateSuggestions(data, efficiencyMetrics, riskFactors);

  return {
    seasonalTrends,
    efficiencyMetrics,
    riskFactors,
    suggestions
  };
}

function calculateSeasonalTrends(data: CropData[]) {
  return [
    {
      season: 'Current',
      avgYield: data.slice(-3).reduce((sum, d) => sum + d.yield, 0) / 3,
      avgRainfall: data.slice(-3).reduce((sum, d) => sum + d.rainfall, 0) / 3,
      performance: 'good' as const
    }
  ];
}

function calculateEfficiencyMetrics(data: CropData[]) {
  const avgYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
  const avgTarget = data.reduce((sum, d) => sum + d.target, 0) / data.length;
  const avgRainfall = data.reduce((sum, d) => sum + d.rainfall, 0) / data.length;

  return {
    yieldEfficiency: (avgYield / avgTarget) * 100,
    waterUsageEfficiency: avgYield / avgRainfall,
    targetAchievement: (avgYield / avgTarget) * 100
  };
}

function assessRiskFactors(data: CropData[]): CropAnalysis['riskFactors'] {
  const risks = [];
  const recentData = data.slice(-3);

  const rainfallVariability = calculateVariability(recentData.map(d => d.rainfall));
  risks.push({
    type: 'Rainfall Variability',
    risk: rainfallVariability > 20 ? 'high' : rainfallVariability > 10 ? 'medium' : 'low',
    description: `Rainfall variation is ${rainfallVariability.toFixed(1)}%`
  });

  const yieldTrend = calculateTrend(recentData.map(d => d.yield));
  risks.push({
    type: 'Yield Stability',
    risk: yieldTrend < 0 ? 'high' : yieldTrend < 5 ? 'medium' : 'low',
    description: `Yield trend is ${yieldTrend > 0 ? 'positive' : 'negative'} at ${Math.abs(yieldTrend).toFixed(1)}%`
  });

  return risks;
}

function generateSuggestions(
  data: CropData[],
  metrics: CropAnalysis['efficiencyMetrics'],
  risks: CropAnalysis['riskFactors']
): CropAnalysis['suggestions'] {
  const suggestions = [];

  if (metrics.yieldEfficiency < 90) {
    suggestions.push({
      category: 'Yield Improvement',
      action: 'Optimize fertilizer application based on soil tests',
      impact: 'Potential yield increase of 10-15%',
      priority: 'high'
    });
  }

  if (metrics.waterUsageEfficiency < 0.8) {
    suggestions.push({
      category: 'Water Management',
      action: 'Implement drip irrigation system',
      impact: 'Reduce water usage by 30-40%',
      priority: 'medium'
    });
  }

  return suggestions;
}

function calculateVariability(values: number[]): number {
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return (Math.sqrt(variance) / avg) * 100;
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return ((last - first) / first) * 100;
}

function getDefaultAnalysis(): CropAnalysis {
  return {
    seasonalTrends: [],
    efficiencyMetrics: {
      yieldEfficiency: 0,
      waterUsageEfficiency: 0,
      targetAchievement: 0
    },
    riskFactors: [],
    suggestions: []
  };
}

export const mockApi = {
  async submitCropData(data: Omit<CropData, 'id'>): Promise<CropData> {
    // Add validation
    const { isValid, errors } = validateCropData(data);
    if (!isValid) {
      throw new Error(JSON.stringify(errors));
    }

    // Add artificial delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add error simulation for edge cases
    if (data.yield > data.target * 2) {
      throw new Error('Suspicious yield value detected');
    }

    const newData = { ...data };
    mockCropData.push(newData);
    return newData;
  },

  async getAnalysis(): Promise<AnalysisResult> {
    const baseAnalysis = {
      totalYield: mockCropData.reduce((sum, d) => sum + d.yield, 0),
      yieldTrend: mockCropData.length > 1 ? 
        ((mockCropData[mockCropData.length - 1].yield - mockCropData[0].yield) / mockCropData[0].yield) * 100 : 0,
      averageRainfall: mockCropData.reduce((sum, d) => sum + d.rainfall, 0) / (mockCropData.length || 1),
      recommendedActions: [
        "Optimize irrigation based on rainfall patterns",
        "Monitor crop growth regularly",
        "Plan harvest timing carefully"
      ],
      predictedYield: mockCropData.length > 0 ? mockCropData[mockCropData.length - 1].yield * 1.1 : 0,
      cropAnalysis: analyzeCropData(mockCropData),
      forecastData: {
        nextMonth: {
          expectedYield: mockCropData.length > 0 ? mockCropData[mockCropData.length - 1].yield * 1.1 : 0,
          requiredRainfall: 65,
          potentialRisks: [
            "Irregular rainfall patterns",
            "Temperature fluctuations"
          ]
        }
      }
    };

    return baseAnalysis;
  },

  async getRealtimeStats(): Promise<DashboardStats> {
    const totalYield = mockCropData.reduce((sum, d) => sum + d.yield, 0);
    const lastMonth = mockCropData[mockCropData.length - 1] || { rainfall: 0, yield: 0 };

    return {
      totalYield,
      rainfall: lastMonth.rainfall,
      revenue: totalYield * 1500,
      pendingTasks: 3
    };
  }
};
