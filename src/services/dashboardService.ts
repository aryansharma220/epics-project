import { CropData, AnalysisResult, DashboardStats, CropAnalysis } from '../types/dashboard';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);

export const dashboardService = {
  async uploadCropData(file: File): Promise<CropData[]> {
    const formData = new FormData();
    formData.append('file', file);
    // Implement API call to upload data
    // For now, return parsed CSV data
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(1);
        const data: CropData[] = rows.map(row => {
          const [month, yield_, target, rainfall, temperature] = row.split(',');
          return {
            month,
            yield: parseFloat(yield_),
            target: parseFloat(target),
            rainfall: parseFloat(rainfall),
            temperature: parseFloat(temperature)
          };
        });
        resolve(data);
      };
      reader.readAsText(file);
    });
  },

  analyzeCropData(data: CropData[]): AnalysisResult {
    const totalYield = data.reduce((sum, d) => sum + d.yield, 0);
    const yieldTrend = data.length > 1 ? ((data[data.length - 1].yield - data[0].yield) / data[0].yield) * 100 : 0;
    const avgRainfall = data.reduce((sum, d) => sum + d.rainfall, 0) / data.length;
    const avgTemperature = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;

    const recommendedActions = [];
    if (yieldTrend < 0) recommendedActions.push('Review farming practices');
    if (avgRainfall < 50) recommendedActions.push('Consider irrigation improvements');
    if (avgTemperature > 30) recommendedActions.push('Implement heat stress management');

    // Simple yield prediction using last 3 months trend
    const recentData = data.slice(-3);
    const avgGrowth = recentData.length > 1 ? 
      recentData.reduce((sum, d, i) => {
        if (i === 0) return 0;
        return sum + (d.yield - recentData[i-1].yield);
      }, 0) / (recentData.length - 1) : 0;
    
    const predictedYield = data.length > 0 ? data[data.length - 1].yield + avgGrowth : 0;
    const cropAnalysis = this.getDetailedCropAnalysis(data);

    return {
      totalYield,
      yieldTrend,
      averageRainfall: avgRainfall,
      recommendedActions,
      predictedYield,
      cropAnalysis,
      forecastData: {
        nextMonth: {
          expectedYield: predictedYield,
          requiredRainfall: avgRainfall * 1.1,
          potentialRisks: this.getPotentialRisks(data, avgTemperature, avgRainfall)
        }
      }
    };
  },

  getRealtimeStats(cropData: CropData[]): DashboardStats {
    if (cropData.length === 0) {
      return {
        totalYield: 0,
        rainfall: 0,
        revenue: 0,
        pendingTasks: 0
      };
    }
    const lastMonth = cropData[cropData.length - 1];
    return {
      totalYield: cropData.reduce((sum, d) => sum + d.yield, 0),
      rainfall: lastMonth.rainfall,
      revenue: lastMonth.yield * 1500, // Example price per unit
      pendingTasks: 0 // Will be updated from tasks data
    };
  },

  getDetailedCropAnalysis(data: CropData[]): CropAnalysis {
    if (data.length === 0) {
      return this.getDefaultAnalysis();
    }

    const seasonalTrends = this.calculateSeasonalTrends(data);
    const efficiencyMetrics = this.calculateEfficiencyMetrics(data);
    const riskFactors = this.assessRiskFactors(data);
    const suggestions = this.generateSuggestions(data, efficiencyMetrics, riskFactors);

    return {
      seasonalTrends,
      efficiencyMetrics,
      riskFactors,
      suggestions
    };
  },

  calculateSeasonalTrends(data: CropData[]) {
    const currentData = data.slice(-3);
    const avgYield = currentData.reduce((sum, d) => sum + d.yield, 0) / currentData.length;
    const avgRainfall = currentData.reduce((sum, d) => sum + d.rainfall, 0) / currentData.length;

    let performance: 'good' | 'average' | 'poor' = 'average';
    const yieldEfficiency = currentData.length > 0 ? 
      (avgYield / currentData.reduce((sum, d) => sum + d.target, 0) * currentData.length) * 100 : 0;
    
    if (yieldEfficiency >= 95) performance = 'good';
    else if (yieldEfficiency < 80) performance = 'poor';

    return [
      {
        season: 'Current',
        avgYield,
        avgRainfall,
        performance
      }
    ];
  },

  calculateEfficiencyMetrics(data: CropData[]) {
    if (data.length === 0) {
      return {
        yieldEfficiency: 0,
        waterUsageEfficiency: 0,
        targetAchievement: 0
      };
    }

    const avgYield = data.reduce((sum, d) => sum + d.yield, 0) / data.length;
    const avgTarget = data.reduce((sum, d) => sum + d.target, 0) / data.length;
    const avgRainfall = data.reduce((sum, d) => sum + d.rainfall, 0) / data.length;

    return {
      yieldEfficiency: (avgYield / avgTarget) * 100,
      waterUsageEfficiency: avgYield / (avgRainfall || 1),
      targetAchievement: (avgYield / avgTarget) * 100
    };
  },

  assessRiskFactors(data: CropData[]) {
    const risks = [];
    if (data.length < 2) {
      return [{
        type: 'Insufficient Data',
        risk: 'medium',
        description: 'Need more data points for accurate risk assessment'
      }];
    }

    const recentData = data.slice(-3);
    
    // Rainfall variability
    const rainfallValues = recentData.map(d => d.rainfall);
    const rainfallVariability = this.calculateVariability(rainfallValues);
    risks.push({
      type: 'Rainfall Variability',
      risk: rainfallVariability > 20 ? 'high' : rainfallVariability > 10 ? 'medium' : 'low',
      description: `Rainfall variation is ${rainfallVariability.toFixed(1)}%`
    });

    // Yield trend
    const yieldValues = recentData.map(d => d.yield);
    const yieldTrend = this.calculateTrend(yieldValues);
    risks.push({
      type: 'Yield Stability',
      risk: yieldTrend < 0 ? 'high' : yieldTrend < 5 ? 'medium' : 'low',
      description: `Yield trend is ${yieldTrend > 0 ? 'positive' : 'negative'} at ${Math.abs(yieldTrend).toFixed(1)}%`
    });

    // Temperature risk
    const tempValues = recentData.map(d => d.temperature);
    const avgTemp = tempValues.reduce((sum, v) => sum + v, 0) / tempValues.length;
    risks.push({
      type: 'Temperature Risk',
      risk: avgTemp > 32 ? 'high' : avgTemp > 28 ? 'medium' : 'low',
      description: `Average temperature is ${avgTemp.toFixed(1)}°C`
    });

    return risks;
  },

  generateSuggestions(data: CropData[], metrics: CropAnalysis['efficiencyMetrics'], risks: CropAnalysis['riskFactors']) {
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

    const highRisks = risks.filter(r => r.risk === 'high');
    if (highRisks.length > 0) {
      suggestions.push({
        category: 'Risk Management',
        action: `Address ${highRisks[0].type.toLowerCase()} issues`,
        impact: 'Mitigate crop failure risks',
        priority: 'high' as const
      });
    }

    return suggestions;
  },

  calculateVariability(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    if (avg === 0) return 0;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return (Math.sqrt(variance) / avg) * 100;
  },

  calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;
    return first === 0 ? 0 : ((last - first) / first) * 100;
  },

  getDefaultAnalysis(): CropAnalysis {
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
  },

  getPotentialRisks(data: CropData[], avgTemp: number, avgRainfall: number): string[] {
    const risks = [];
    
    if (avgTemp > 30) {
      risks.push('Heat stress affecting crop growth');
    }
    
    if (avgRainfall < 40) {
      risks.push('Drought conditions possible');
    } else if (avgRainfall > 100) {
      risks.push('Potential flooding or waterlogging');
    }
    
    if (data.length > 3) {
      const yieldTrend = this.calculateTrend(data.slice(-3).map(d => d.yield));
      if (yieldTrend < -5) {
        risks.push('Declining yield trend requires attention');
      }
    }
    
    if (risks.length === 0) {
      risks.push('No significant risks identified');
    }
    
    return risks;
  },

  async getAIInsights(cropData: CropData[]): Promise<string[]> {
    if (cropData.length === 0) {
      return ["Insufficient data to generate AI insights. Please add crop data."];
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        As an agricultural AI advisor, analyze this crop data and provide 3-5 insights and specific actionable recommendations. 
        Format your response as bullet points, keeping each point brief (max 2 sentences).
        
        Crop Data (most recent 3 months):
        ${JSON.stringify(cropData.slice(-3))}
        
        Current efficiency metrics:
        - Yield Efficiency: ${this.calculateEfficiencyMetrics(cropData).yieldEfficiency.toFixed(1)}%
        - Water Usage Efficiency: ${this.calculateEfficiencyMetrics(cropData).waterUsageEfficiency.toFixed(2)}
        
        Risk factors:
        ${JSON.stringify(this.assessRiskFactors(cropData))}
        
        Focus on practical insights about:
        1. Yield optimization
        2. Resource efficiency
        3. Risk mitigation strategies
        4. Weather adaptation
        5. Seasonal planning
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Process the response to get clean bullet points
      return text
        .split(/[•\-*]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return [
        "Based on your yield trend, consider adjusting fertilizer application timing for better nutrient absorption.",
        "Your water usage efficiency could be improved by 15-20% with optimized irrigation scheduling.",
        "Temperature variations suggest implementing shade structures during peak summer months.",
        "Consider crop rotation in the next season to improve soil health and reduce pest pressure."
      ];
    }
  },

  async getWeatherAdaptedRecommendations(cropData: CropData[], weatherData: any): Promise<string[]> {
    try {
      if (!weatherData || !cropData.length) {
        return ["Insufficient data for weather-adapted recommendations."];
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        As an agricultural AI advisor, provide 3-4 specific recommendations based on the current weather forecast
        and crop data. Format your response as concise bullet points.
        
        Current weather conditions:
        ${JSON.stringify(weatherData.current)}
        
        Weather forecast:
        ${JSON.stringify(weatherData.forecast ? weatherData.forecast.slice(0, 2) : [])}
        
        Recent crop data:
        ${JSON.stringify(cropData.slice(-1)[0])}
        
        Provide recommendations that:
        1. Address immediate actions based on forecast
        2. Optimize resource usage (water, fertilizer)
        3. Protect crops from potential weather risks
        4. Adjust planting or harvesting schedules if needed
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text
        .split(/[•\-*]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 4);
    } catch (error) {
      console.error("Error generating weather recommendations:", error);
      return [
        "Adjust irrigation schedule based on the upcoming weather forecast.",
        "Consider protective measures for crops due to expected weather conditions.",
        "Optimize fertilizer application timing for better nutrient absorption under current weather patterns."
      ];
    }
  }
};
