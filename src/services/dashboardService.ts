import { CropData, AnalysisResult, DashboardStats, CropAnalysis } from '../types/dashboard';
import moment from 'moment';
import i18next from 'i18next';

interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition?: string;
}

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
    const suggestions = this.generateSuggestions(efficiencyMetrics, riskFactors);

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
    const risks: CropAnalysis['riskFactors'] = [];
    if (data.length < 2) {
      return [{
        type: 'Insufficient Data',
        risk: 'medium' as const,
        description: 'Need more data points for accurate risk assessment'
      }];
    }

    const recentData = data.slice(-3);
    
    // Rainfall variability
    const rainfallValues = recentData.map(d => d.rainfall);
    const rainfallVariability = this.calculateVariability(rainfallValues);
    risks.push({
      type: 'Rainfall Variability',
      risk: rainfallVariability > 20 ? 'high' as const : rainfallVariability > 10 ? 'medium' as const : 'low' as const,
      description: `Rainfall variation is ${rainfallVariability.toFixed(1)}%`
    });

    // Yield trend
    const yieldValues = recentData.map(d => d.yield);
    const yieldTrend = this.calculateTrend(yieldValues);
    risks.push({
      type: 'Yield Stability',
      risk: yieldTrend < 0 ? 'high' as const : yieldTrend < 5 ? 'medium' as const : 'low' as const,
      description: `Yield trend is ${yieldTrend > 0 ? 'positive' : 'negative'} at ${Math.abs(yieldTrend).toFixed(1)}%`
    });

    // Temperature risk
    const tempValues = recentData.map(d => d.temperature);
    const avgTemp = tempValues.reduce((sum, v) => sum + v, 0) / tempValues.length;
    risks.push({
      type: 'Temperature Risk',
      risk: avgTemp > 32 ? 'high' as const : avgTemp > 28 ? 'medium' as const : 'low' as const,
      description: `Average temperature is ${avgTemp.toFixed(1)}°C`
    });

    return risks;
  },

  generateSuggestions(metrics: CropAnalysis['efficiencyMetrics'], risks: CropAnalysis['riskFactors']): CropAnalysis['suggestions'] {
    const suggestions: CropAnalysis['suggestions'] = [];

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
    highRisks.forEach(risk => {
      suggestions.push({
        category: 'Risk Management',
        action: `Address ${risk.type.toLowerCase()}: ${risk.description}`,
        impact: 'Reduce risk exposure',
        priority: 'high' as const
      });
    });

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
    if (cropData.length < 2) {
      return [i18next.t('dashboard.insights.insufficientData')];
    }

    const insights: string[] = [];
    const recentData = cropData.slice(-3);
    
    const yieldTrend = this.calculateTrend(recentData.map(d => d.yield));
    if (yieldTrend < 0) {
      insights.push(i18next.t('dashboard.insights.yieldTrends.declining', { value: Math.abs(yieldTrend).toFixed(1) }));
    } else if (yieldTrend > 10) {
      insights.push(i18next.t('dashboard.insights.yieldTrends.positive', { value: yieldTrend.toFixed(1) }));
    }

    insights.push(this.analyzeRainfallEfficiency(recentData));

    const seasonalInsight = this.analyzeSeasonalPerformance(cropData);
    if (seasonalInsight) insights.push(seasonalInsight);

    insights.push(this.analyzeTargetAchievement(recentData));

    const temperatureImpact = this.analyzeTemperatureImpact(recentData);
    if (temperatureImpact) insights.push(temperatureImpact);

    return insights;
  },

  async getWeatherAdaptedRecommendations(cropData: CropData[], weather: { current: WeatherCondition; alerts?: any[]; forecast?: any }): Promise<string[]> {
    if (!weather?.current) {
      return ["Unable to generate weather-specific recommendations. Weather data unavailable."];
    }

    const recommendations: string[] = [];
    const { temperature, humidity } = weather.current;
    const hasAlerts = weather.alerts && weather.alerts.length > 0;

    if (temperature > 30) {
      recommendations.push("High temperature alert: Consider increasing irrigation frequency");
      recommendations.push("Monitor for heat stress in crops");
    } else if (temperature < 10) {
      recommendations.push("Low temperature alert: Protect sensitive crops from frost damage");
      recommendations.push("Consider delaying new plantings until temperatures rise");
    }

    if (humidity > 80) {
      recommendations.push("High humidity detected: Monitor for fungal disease risk");
      recommendations.push("Consider applying preventive fungicides");
    } else if (humidity < 40) {
      recommendations.push("Low humidity alert: Increase irrigation to prevent water stress");
    }

    if (hasAlerts && weather.alerts) {
      weather.alerts.forEach(alert => {
        recommendations.push(`Weather alert adaptation: ${this.getAlertRecommendation(alert)}`);
      });
    }

    if (weather.forecast) {
      recommendations.push(...this.getForecastRecommendations(weather.forecast));
    }

    // Add crop-specific recommendations
    if (cropData.length > 0) {
      const lastCropData = cropData[cropData.length - 1];
      if (lastCropData.yield < lastCropData.target) {
        recommendations.push("Current yield is below target. Consider adjusting farming practices based on weather conditions.");
      }
    }

    return recommendations;
  },

  analyzeRainfallEfficiency(data: CropData[]): string {
    const rainfallYieldRatio = data.map(d => d.yield / (d.rainfall || 1));
    const avgRatio = rainfallYieldRatio.reduce((sum, r) => sum + r, 0) / rainfallYieldRatio.length;
    
    if (avgRatio < 0.05) {
      return "Low rainfall utilization efficiency detected. Consider improving drainage or water management systems.";
    } else if (avgRatio > 0.1) {
      return "Good rainfall utilization efficiency. Current water management practices are effective.";
    }
    return "Moderate rainfall utilization efficiency. Minor improvements to water management may be beneficial.";
  },

  analyzeSeasonalPerformance(data: CropData[]): string | null {
    const currentMonth = moment().month();
    const season = this.getCurrentSeason(currentMonth);
    const seasonalData = data.filter(d => {
      const month = moment(d.month).month();
      return this.getCurrentSeason(month) === season;
    });

    if (seasonalData.length < 2) return null;

    const avgYield = seasonalData.reduce((sum, d) => sum + d.yield, 0) / seasonalData.length;
    const previousSeasonAvg = this.getPreviousSeasonAverage(data, season);

    if (previousSeasonAvg === null) return null;

    const change = ((avgYield - previousSeasonAvg) / previousSeasonAvg) * 100;
    
    if (Math.abs(change) < 5) {
      return `Seasonal performance is stable compared to previous ${season} (±${Math.abs(change).toFixed(1)}%).`;
    }
    return `${season} performance is ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% compared to previous season.`;
  },

  getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  },

  getPreviousSeasonAverage(data: CropData[], currentSeason: string): number | null {
    const previousYear = moment().subtract(1, 'year');
    const previousSeasonData = data.filter(d => {
      const date = moment(d.month);
      const season = this.getCurrentSeason(date.month());
      return season === currentSeason && date.year() === previousYear.year();
    });

    if (previousSeasonData.length === 0) return null;
    return previousSeasonData.reduce((sum, d) => sum + d.yield, 0) / previousSeasonData.length;
  },

  analyzeTargetAchievement(data: CropData[]): string {
    const achievements = data.map(d => (d.yield / d.target) * 100);
    const avgAchievement = achievements.reduce((sum, a) => sum + a, 0) / achievements.length;
    
    if (avgAchievement >= 95) {
      return `Excellent target achievement rate of ${avgAchievement.toFixed(1)}%. Keep maintaining current practices.`;
    } else if (avgAchievement >= 80) {
      return `Good target achievement rate of ${avgAchievement.toFixed(1)}%. Minor optimizations could help reach targets.`;
    }
    return `Target achievement rate of ${avgAchievement.toFixed(1)}% indicates room for improvement. Consider reviewing production strategies.`;
  },

  analyzeTemperatureImpact(data: CropData[]): string | null {
    if (!data.some(d => d.temperature !== undefined)) return null;

    const correlation = this.calculateCorrelation(
      data.map(d => d.temperature || 0),
      data.map(d => d.yield)
    );

    if (Math.abs(correlation) < 0.3) {
      return "No significant impact of temperature on yield detected.";
    }
    
    return correlation > 0
      ? "Higher temperatures are correlating with better yields. Consider heat-tolerant crop varieties."
      : "Lower temperatures are correlating with better yields. Consider cold-weather crops or protection measures.";
  },

  calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  },

  getAlertRecommendation(alert: { description: string }): string {
    const description = alert.description.toLowerCase();
    
    if (description.includes('rain') || description.includes('storm')) {
      return i18next.t('dashboard.insights.weatherAlerts.rain');
    }
    if (description.includes('wind')) {
      return i18next.t('dashboard.insights.weatherAlerts.wind');
    }
    if (description.includes('heat')) {
      return i18next.t('dashboard.insights.weatherAlerts.heat');
    }
    if (description.includes('frost') || description.includes('freeze')) {
      return i18next.t('dashboard.insights.weatherAlerts.frost');
    }
    
    return i18next.t('dashboard.insights.weatherAlerts.default');
  },

  getForecastRecommendations(forecast: { hourly?: { temp: number; humidity: number; weather: { main: string }[] }[] }): string[] {
    const recommendations: string[] = [];
    const next24Hours = forecast.hourly?.slice(0, 24) || [];
    
    const willRain = next24Hours.some(hour => 
      hour.weather[0].main.toLowerCase().includes('rain')
    );
    
    const tempChange = next24Hours.length > 0
      ? Math.max(...next24Hours.map(h => h.temp)) - Math.min(...next24Hours.map(h => h.temp))
      : 0;

    if (willRain) {
      recommendations.push(i18next.t('dashboard.insights.forecast.rain'));
    }
    
    if (tempChange > 10) {
      recommendations.push(i18next.t('dashboard.insights.forecast.tempChange'));
    }

    return recommendations;
  }
};

