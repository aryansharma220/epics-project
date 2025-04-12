import { CropData, AnalysisResult, DashboardStats, CropAnalysis } from '../types/dashboard';
import { validateCropData } from '../utils/validation';
import moment from 'moment';

let mockCropData: CropData[] = generateInitialMockData();

function generateInitialMockData(): CropData[] {
  const data: CropData[] = [];
  const now = moment();
  const startDate = moment().subtract(12, 'months');

  while (startDate.isBefore(now)) {
    const month = startDate.format('YYYY-MM');
    const seasonalFactor = getSeasonalFactor(startDate.month());
    const rainfall = generateRealisticRainfall(startDate.month());
    
    data.push({
      month,
      yield: generateRealisticYield(seasonalFactor, rainfall),
      target: generateRealisticTarget(startDate.month()),
      rainfall,
      temperature: generateRealisticTemperature(startDate.month())
    });
    
    startDate.add(1, 'month');
  }
  
  return data;
}

function getSeasonalFactor(month: number): number {
  if (month >= 2 && month <= 4) return 1.1; // Spring
  if (month >= 5 && month <= 7) return 1.2; // Summer
  if (month >= 8 && month <= 10) return 1.0; // Fall
  return 0.9; // Winter
}

function generateRealisticRainfall(month: number): number {
  const baseRainfall = {
    winter: { min: 20, max: 80 },
    spring: { min: 40, max: 120 },
    summer: { min: 60, max: 200 },
    fall: { min: 30, max: 150 }
  };

  let range;
  if (month >= 2 && month <= 4) range = baseRainfall.spring;
  else if (month >= 5 && month <= 7) range = baseRainfall.summer;
  else if (month >= 8 && month <= 10) range = baseRainfall.fall;
  else range = baseRainfall.winter;

  return Math.round(range.min + Math.random() * (range.max - range.min));
}

function generateRealisticTemperature(month: number): number {
  const baseTemp = {
    winter: { min: 5, max: 15 },
    spring: { min: 15, max: 25 },
    summer: { min: 25, max: 35 },
    fall: { min: 15, max: 25 }
  };

  let range;
  if (month >= 2 && month <= 4) range = baseTemp.spring;
  else if (month >= 5 && month <= 7) range = baseTemp.summer;
  else if (month >= 8 && month <= 10) range = baseTemp.fall;
  else range = baseTemp.winter;

  return Math.round((range.min + Math.random() * (range.max - range.min)) * 10) / 10;
}

function generateRealisticYield(seasonalFactor: number, rainfall: number): number {
  const baseYield = 4.5;
  const rainfallFactor = Math.min(Math.max(rainfall / 100, 0.7), 1.3);
  const randomVariation = 0.9 + Math.random() * 0.2;
  
  return Math.round(baseYield * seasonalFactor * rainfallFactor * randomVariation * 10) / 10;
}

function generateRealisticTarget(month: number): number {
  const baseTarget = 5.0;
  const seasonalFactor = getSeasonalFactor(month);
  return Math.round(baseTarget * seasonalFactor * 10) / 10;
}

function analyzeCropData(data: CropData[]): CropAnalysis {
  if (data.length === 0) return getDefaultAnalysis();

  const seasonalTrends = calculateSeasonalTrends(data);
  const efficiencyMetrics = calculateEfficiencyMetrics(data);
  const riskFactors = assessRiskFactors(data);
  const suggestions = generateSuggestions(efficiencyMetrics, riskFactors);

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
    risk: rainfallVariability > 20 ? 'high' as const : rainfallVariability > 10 ? 'medium' as const : 'low' as const,
    description: `Rainfall variation is ${rainfallVariability.toFixed(1)}%`
  });

  const yieldTrend = calculateTrend(recentData.map(d => d.yield));
  risks.push({
    type: 'Yield Stability',
    risk: yieldTrend < 0 ? 'high' as const : yieldTrend < 5 ? 'medium' as const : 'low' as const,
    description: `Yield trend is ${yieldTrend > 0 ? 'positive' : 'negative'} at ${Math.abs(yieldTrend).toFixed(1)}%`
  });

  return risks;
}

function generateSuggestions(metrics: CropAnalysis['efficiencyMetrics'], risks: CropAnalysis['riskFactors']): CropAnalysis['suggestions'] {
  const suggestions = [];

  if (metrics.yieldEfficiency < 90) {
    suggestions.push({
      category: 'Yield Improvement',
      action: 'Optimize fertilizer application based on soil tests',
      impact: 'Potential yield increase of 10-15%',
      priority: 'high' as const
    });
  }

  if (metrics.waterUsageEfficiency < 0.8) {
    suggestions.push({
      category: 'Water Management',
      action: 'Implement drip irrigation system',
      impact: 'Reduce water usage by 30-40%',
      priority: 'medium' as const
    });
  }

  // Add risk-based suggestions
  const highRisks = risks.filter(r => r.risk === 'high');
  highRisks.forEach(risk => {
    suggestions.push({
      category: 'Risk Management',
      action: `Address ${risk.type.toLowerCase()}: ${risk.description}`,
      impact: 'Reduce risk exposure',
      priority: 'high' as const
    });
  });

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
    const { isValid, errors } = validateCropData(data);
    if (!isValid) {
      throw new Error(JSON.stringify(errors));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.yield > data.target * 2) {
      throw new Error('Suspicious yield value detected');
    }

    const newData = { ...data };
    
    // Update or add new data
    const existingIndex = mockCropData.findIndex(d => d.month === data.month);
    if (existingIndex >= 0) {
      mockCropData[existingIndex] = newData;
    } else {
      mockCropData.push(newData);
    }
    
    // Sort data by month
    mockCropData.sort((a, b) => moment(a.month).diff(moment(b.month)));
    
    return newData;
  },

  async getAnalysis(): Promise<AnalysisResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (mockCropData.length === 0) {
      throw new Error('No crop data available for analysis');
    }

    const recentData = mockCropData.slice(-3);
    const yieldTrend = calculateYieldTrend(recentData);
    const cropAnalysis = analyzeCropData(mockCropData);
    
    const baseAnalysis: AnalysisResult = {
      totalYield: mockCropData.reduce((sum, d) => sum + d.yield, 0),
      yieldTrend,
      averageRainfall: mockCropData.reduce((sum, d) => sum + d.rainfall, 0) / mockCropData.length,
      recommendedActions: generateRecommendedActions(cropAnalysis, yieldTrend),
      predictedYield: predictNextMonthYield(recentData),
      cropAnalysis,
      forecastData: generateForecastData(recentData)
    };

    return baseAnalysis;
  },

  async getRealtimeStats(): Promise<DashboardStats> {
    // Simulate network delay for real-time data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockCropData.length === 0) {
      return {
        totalYield: 0,
        rainfall: 0,
        revenue: 0,
        pendingTasks: 0
      };
    }

    const recentData = mockCropData.slice(-3);
    const latestData = mockCropData[mockCropData.length - 1];
    const avgPrice = 1500; // Price per ton

    return {
      totalYield: mockCropData.reduce((sum, d) => sum + d.yield, 0),
      rainfall: latestData.rainfall,
      revenue: calculateRevenue(recentData, avgPrice),
      pendingTasks: Math.floor(Math.random() * 5) + 1 // Random number of tasks (1-5)
    };
  }
};

function calculateYieldTrend(recentData: CropData[]): number {
  if (recentData.length < 2) return 0;
  const first = recentData[0].yield;
  const last = recentData[recentData.length - 1].yield;
  return ((last - first) / first) * 100;
}

function predictNextMonthYield(recentData: CropData[]): number {
  if (recentData.length === 0) return 0;
  
  const avgYield = recentData.reduce((sum, d) => sum + d.yield, 0) / recentData.length;
  const trend = calculateYieldTrend(recentData);
  const nextMonth = moment(recentData[recentData.length - 1].month).add(1, 'month');
  const seasonalFactor = getSeasonalFactor(nextMonth.month());
  
  return Math.round((avgYield * (1 + trend/100) * seasonalFactor) * 10) / 10;
}

function generateRecommendedActions(analysis: CropAnalysis, yieldTrend: number): string[] {
  const actions = [];
  
  if (yieldTrend < 0) {
    actions.push("Review and optimize farming practices to address declining yields");
  } else if (yieldTrend < 5) {
    actions.push("Consider implementing new techniques to improve yield growth");
  }
  
  if (analysis.efficiencyMetrics.waterUsageEfficiency < 0.8) {
    actions.push("Optimize irrigation systems to improve water usage efficiency");
  }
  
  const highRisks = analysis.riskFactors.filter(r => r.risk === 'high');
  highRisks.forEach(risk => {
    actions.push(`Address ${risk.type.toLowerCase()} risk: ${risk.description}`);
  });
  
  actions.push("Monitor crop growth regularly");
  actions.push("Plan harvest timing based on weather forecasts");
  
  return actions;
}

function calculateRevenue(recentData: CropData[], pricePerTon: number): number {
  return Math.round(recentData.reduce((sum, d) => sum + d.yield * pricePerTon, 0));
}

function generateForecastData(recentData: CropData[]) {
  const nextMonthYield = predictNextMonthYield(recentData);
  const nextMonth = moment(recentData[recentData.length - 1].month).add(1, 'month');
  
  return {
    nextMonth: {
      expectedYield: nextMonthYield,
      requiredRainfall: generateRealisticRainfall(nextMonth.month()),
      potentialRisks: generatePotentialRisks(nextMonth.month())
    }
  };
}

function generatePotentialRisks(month: number): string[] {
  const risks = [];
  
  if (month >= 5 && month <= 7) {
    risks.push("Heat stress risk");
    risks.push("Increased water demand");
  } else if (month >= 11 || month <= 1) {
    risks.push("Frost damage risk");
    risks.push("Reduced growth rate");
  } else if (month >= 2 && month <= 4) {
    risks.push("Variable temperature patterns");
    risks.push("Early season pests");
  } else {
    risks.push("Harvest timing sensitivity");
    risks.push("End-of-season diseases");
  }
  
  risks.push("Weather pattern variations");
  
  return risks;
}
