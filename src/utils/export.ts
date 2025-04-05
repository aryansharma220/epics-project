import { CropData, AnalysisResult } from '../types/dashboard';

export function exportToCSV(data: CropData[]): void {
  const headers = ['Month', 'Yield (tons)', 'Target (tons)', 'Rainfall (mm)', 'Temperature (°C)'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      [row.month, row.yield, row.target, row.rainfall, row.temperature].join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `crop_data_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportAnalysisReport(analysis: AnalysisResult): void {
  const report = {
    summary: {
      totalYield: analysis.totalYield,
      yieldTrend: analysis.yieldTrend,
      predictedYield: analysis.predictedYield
    },
    recommendations: analysis.recommendedActions,
    efficiency: analysis.cropAnalysis.efficiencyMetrics,
    risks: analysis.cropAnalysis.riskFactors,
    forecast: analysis.forecastData
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `analysis_report_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}
