import { CropData, AnalysisResult } from '../types/dashboard';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportToCSV(data: CropData[]): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Create CSV content
  const headers = ['Month', 'Yield (tons)', 'Target (tons)', 'Rainfall (mm)', 'Temperature (°C)'];
  const rows = data.map(item => [
    item.month,
    item.yield.toString(),
    item.target.toString(),
    item.rainfall.toString(),
    item.temperature.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `crop_data_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnalysisReport(analysis: AnalysisResult): void {
  const report = {
    summary: {
      totalYield: analysis.totalYield,
      yieldTrend: analysis.yieldTrend,
      predictedYield: analysis.predictedYield,
      averageRainfall: analysis.averageRainfall
    },
    recommendations: analysis.recommendedActions,
    efficiency: analysis.cropAnalysis.efficiencyMetrics,
    risks: analysis.cropAnalysis.riskFactors,
    forecast: analysis.forecastData
  };

  // Create and download JSON file
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `analysis_report_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

export function generatePDFReport(cropData: CropData[], analysis: AnalysisResult): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 102, 51);
  pdf.text('Farm Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  // Summary Section
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Summary', 14, 40);
  
  pdf.setFontSize(12);
  pdf.text(`Total Yield: ${analysis.totalYield.toFixed(2)} tons`, 20, 50);
  pdf.text(`Yield Trend: ${analysis.yieldTrend.toFixed(2)}%`, 20, 58);
  pdf.text(`Predicted Yield: ${analysis.predictedYield.toFixed(2)} tons`, 20, 66);
  pdf.text(`Average Rainfall: ${analysis.averageRainfall.toFixed(2)} mm`, 20, 74);
  
  // Recommendations Section
  pdf.setFontSize(16);
  pdf.text('Recommendations', 14, 90);
  
  pdf.setFontSize(12);
  analysis.recommendedActions.forEach((recommendation, index) => {
    pdf.text(`${index + 1}. ${recommendation}`, 20, 100 + (index * 8));
  });
  
  // Crop Data Table
  pdf.setFontSize(16);
  pdf.text('Crop Data', 14, 140);
  
  const tableColumns = [
    { header: 'Month', dataKey: 'month' },
    { header: 'Yield (tons)', dataKey: 'yield' },
    { header: 'Target (tons)', dataKey: 'target' },
    { header: 'Rainfall (mm)', dataKey: 'rainfall' },
    { header: 'Temperature (°C)', dataKey: 'temperature' }
  ];
  
  const tableData = cropData.map(item => ({
    month: item.month,
    yield: item.yield.toFixed(2),
    target: item.target.toFixed(2),
    rainfall: item.rainfall.toFixed(1),
    temperature: item.temperature.toFixed(1)
  }));
  
  pdf.autoTable({
    startY: 150,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(item => tableColumns.map(col => item[col.dataKey as keyof typeof item]))
  });
  
  // Risk Assessment
  const currentY = (pdf as any).lastAutoTable.finalY + 20;
  
  if (currentY > 250) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Risk Assessment', 14, 20);
    
    pdf.setFontSize(12);
    analysis.cropAnalysis.riskFactors.forEach((risk, index) => {
      const yPos = 30 + (index * 20);
      pdf.setTextColor(
        risk.risk === 'high' ? 200 : risk.risk === 'medium' ? 200 : 0,
        risk.risk === 'high' ? 0 : risk.risk === 'medium' ? 150 : 150,
        0
      );
      pdf.text(`${risk.type} (${risk.risk.toUpperCase()})`, 20, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.text(risk.description, 20, yPos + 8);
    });
  } else {
    pdf.setFontSize(16);
    pdf.text('Risk Assessment', 14, currentY);
    
    pdf.setFontSize(12);
    analysis.cropAnalysis.riskFactors.forEach((risk, index) => {
      const yPos = currentY + 10 + (index * 20);
      pdf.setTextColor(
        risk.risk === 'high' ? 200 : risk.risk === 'medium' ? 200 : 0,
        risk.risk === 'high' ? 0 : risk.risk === 'medium' ? 150 : 150,
        0
      );
      pdf.text(`${risk.type} (${risk.risk.toUpperCase()})`, 20, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.text(risk.description, 20, yPos + 8);
    });
  }
  
  // Save the PDF
  pdf.save(`farm_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportWeatherReport(weatherData: any, recommendations: string[]): void {
  if (!weatherData) {
    throw new Error('No weather data to export');
  }
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 71, 171);
  pdf.text('Weather Impact Report', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  // Current Weather
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Current Weather Conditions', 14, 40);
  
  pdf.setFontSize(12);
  pdf.text(`Temperature: ${weatherData.current.temperature}°C`, 20, 50);
  pdf.text(`Humidity: ${weatherData.current.humidity}%`, 20, 58);
  pdf.text(`Wind Speed: ${weatherData.current.windSpeed} km/h`, 20, 66);
  pdf.text(`Condition: ${weatherData.current.condition}`, 20, 74);
  
  // Forecast
  pdf.setFontSize(16);
  pdf.text('Forecast', 14, 90);
  
  if (weatherData.forecast && weatherData.forecast.length > 0) {
    const forecastData = weatherData.forecast.slice(0, 5).map((day: any, index: number) => [
      day.day,
      `${day.low}°C / ${day.high}°C`,
      day.condition,
      `${day.precipitation}%`
    ]);
    
    pdf.autoTable({
      startY: 100,
      head: [['Day', 'Temperature', 'Condition', 'Precipitation']],
      body: forecastData
    });
  }
  
  // Recommendations
  pdf.setFontSize(16);
  pdf.text('Weather-Adapted Recommendations', 14, 160);
  
  pdf.setFontSize(12);
  recommendations.forEach((recommendation, index) => {
    pdf.text(`${index + 1}. ${recommendation}`, 20, 170 + (index * 10));
  });
  
  // Save the PDF
  pdf.save(`weather_report_${new Date().toISOString().split('T')[0]}.pdf`);
}
