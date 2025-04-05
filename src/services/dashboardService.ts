import { CropData, AnalysisResult, DashboardStats } from '../types/dashboard';

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
    const yieldTrend = ((data[data.length - 1].yield - data[0].yield) / data[0].yield) * 100;
    const avgRainfall = data.reduce((sum, d) => sum + d.rainfall, 0) / data.length;

    const recommendedActions = [];
    if (yieldTrend < 0) recommendedActions.push('Review farming practices');
    if (avgRainfall < 50) recommendedActions.push('Consider irrigation improvements');

    // Simple yield prediction using last 3 months trend
    const recentData = data.slice(-3);
    const avgGrowth = recentData.reduce((sum, d, i) => {
      if (i === 0) return 0;
      return sum + (d.yield - recentData[i-1].yield);
    }, 0) / 2;

    const predictedYield = data[data.length - 1].yield + avgGrowth;

    return {
      totalYield,
      yieldTrend,
      averageRainfall: avgRainfall,
      recommendedActions,
      predictedYield
    };
  },

  getRealtimeStats(cropData: CropData[]): DashboardStats {
    const lastMonth = cropData[cropData.length - 1];
    return {
      totalYield: cropData.reduce((sum, d) => sum + d.yield, 0),
      rainfall: lastMonth.rainfall,
      revenue: lastMonth.yield * 1500, // Example price per unit
      pendingTasks: 0 // Will be updated from tasks data
    };
  }
};
