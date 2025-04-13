import { CropData, AnalysisResult } from '../types/dashboard';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add the autotable plugin to jsPDF
(jsPDF as any).API.autoTable = autoTable;

export function exportToCSV(data: CropData[]): void {
  const headers = ['Month', 'Yield (tons)', 'Target (tons)', 'Rainfall (mm)', 'Temperature (°C)'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.month,
      row.yield.toString(),
      row.target.toString(),
      row.rainfall.toString(),
      row.temperature.toString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `crop_data_${moment().format('YYYY-MM-DD')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnalysisReport(analysis: AnalysisResult): void {
  const report = {
    title: 'Crop Analysis Report',
    date: moment().format('YYYY-MM-DD'),
    summary: {
      totalYield: analysis.totalYield.toFixed(2),
      yieldTrend: analysis.yieldTrend.toFixed(1) + '%',
      averageRainfall: analysis.averageRainfall.toFixed(1) + ' mm'
    },
    recommendations: analysis.recommendedActions,
    efficiency: {
      yield: analysis.cropAnalysis.efficiencyMetrics.yieldEfficiency.toFixed(1) + '%',
      water: analysis.cropAnalysis.efficiencyMetrics.waterUsageEfficiency.toFixed(2),
      target: analysis.cropAnalysis.efficiencyMetrics.targetAchievement.toFixed(1) + '%'
    },
    risks: analysis.cropAnalysis.riskFactors,
    forecast: analysis.forecastData.nextMonth
  };

  const jsonContent = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `analysis_report_${moment().format('YYYY-MM-DD')}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFReport(cropData: CropData[], analysis: AnalysisResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Farm Dashboard Report', pageWidth / 2, yPos, { align: 'center' });
  
  // Date
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Generated on: ${moment().format('MMMM D, YYYY')}`, pageWidth / 2, yPos, { align: 'center' });

  // Summary Section
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Summary', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  const summaryData = [
    ['Total Yield:', `${analysis.totalYield.toFixed(2)} tons`],
    ['Yield Trend:', `${analysis.yieldTrend.toFixed(1)}%`],
    ['Average Rainfall:', `${analysis.averageRainfall.toFixed(1)} mm`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    margin: { left: 20 }
  });

  // Efficiency Metrics
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text('Efficiency Metrics', 20, yPos);
  
  yPos += 10;
  const efficiencyData = [
    ['Yield Efficiency:', `${analysis.cropAnalysis.efficiencyMetrics.yieldEfficiency.toFixed(1)}%`],
    ['Water Usage Efficiency:', analysis.cropAnalysis.efficiencyMetrics.waterUsageEfficiency.toFixed(2)],
    ['Target Achievement:', `${analysis.cropAnalysis.efficiencyMetrics.targetAchievement.toFixed(1)}%`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: efficiencyData,
    theme: 'plain',
    margin: { left: 20 }
  });

  // Risk Factors
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text('Risk Factors', 20, yPos);
  
  yPos += 10;
  const riskData = analysis.cropAnalysis.riskFactors.map(risk => [
    risk.type,
    risk.risk.toUpperCase(),
    risk.description
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Type', 'Risk Level', 'Description']],
    body: riskData,
    theme: 'striped',
    margin: { left: 20 }
  });

  // Recommendations
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text('Recommendations', 20, yPos);
  
  yPos += 10;
  const recommendationsData = analysis.recommendedActions.map(action => [action]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Action Items']],
    body: recommendationsData,
    theme: 'striped',
    margin: { left: 20 }
  });

  // Crop Data Table
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Historical Crop Data', 20, 20);
  
  const cropTableData = cropData.map(data => [
    data.month,
    data.yield.toFixed(2),
    data.target.toFixed(2),
    data.rainfall.toFixed(1),
    data.temperature.toFixed(1)
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Month', 'Yield (tons)', 'Target (tons)', 'Rainfall (mm)', 'Temperature (°C)']],
    body: cropTableData,
    theme: 'grid',
    margin: { left: 20 }
  });

  // Save the PDF
  doc.save(`farm_report_${moment().format('YYYY-MM-DD')}.pdf`);
}

export function exportWeatherReport(weatherData: any, recommendations: string[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Weather Impact Report', pageWidth / 2, yPos, { align: 'center' });
  
  // Date
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Generated on: ${moment().format('MMMM D, YYYY')}`, pageWidth / 2, yPos, { align: 'center' });

  // Current Weather
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Current Weather Conditions', 20, yPos);
  
  yPos += 10;
  const currentWeather = [
    ['Temperature:', `${weatherData.current.temperature}°C`],
    ['Humidity:', `${weatherData.current.humidity}%`],
    ['Wind Speed:', `${weatherData.current.windSpeed} km/h`],
    ['Conditions:', weatherData.current.condition || 'N/A']
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: currentWeather,
    theme: 'plain',
    margin: { left: 20 }
  });

  // Weather Alerts
  if (weatherData.alerts && weatherData.alerts.length > 0) {
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Weather Alerts', 20, yPos);
    
    yPos += 10;
    const alertsData = weatherData.alerts.map((alert: any) => [
      alert.type || 'Alert',
      alert.description
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Alert Type', 'Description']],
      body: alertsData,
      theme: 'striped',
      margin: { left: 20 }
    });
  }

  // Recommendations
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text('Weather-Based Recommendations', 20, yPos);
  
  yPos += 10;
  const recommendationsData = recommendations.map(rec => [rec]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Recommendation']],
    body: recommendationsData,
    theme: 'striped',
    margin: { left: 20 }
  });

  // Forecast Table if available
  if (weatherData.forecast && weatherData.forecast.hourly) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('24-Hour Forecast', 20, 20);
    
    const forecastData = weatherData.forecast.hourly.slice(0, 24).map((hour: any) => [
      moment(hour.dt * 1000).format('HH:mm'),
      `${hour.temp}°C`,
      `${hour.humidity}%`,
      hour.weather[0].main
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [['Time', 'Temperature', 'Humidity', 'Conditions']],
      body: forecastData,
      theme: 'grid',
      margin: { left: 20 }
    });
  }

  // Save the PDF
  doc.save(`weather_report_${moment().format('YYYY-MM-DD')}.pdf`);
}

export function generateCropPredictionReport(predictions: any[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Crop Yield Predictions', pageWidth / 2, yPos, { align: 'center' });
  
  // Date
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Generated on: ${moment().format('MMMM D, YYYY')}`, pageWidth / 2, yPos, { align: 'center' });

  // Predictions Table
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Monthly Predictions', 20, yPos);
  
  const predictionData = predictions.map(pred => [
    pred.date,
    pred.value.toFixed(2),
    pred.confidence ? `${(pred.confidence * 100).toFixed(1)}%` : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: yPos + 10,
    head: [['Month', 'Predicted Yield (tons)', 'Confidence']],
    body: predictionData,
    theme: 'grid',
    margin: { left: 20 }
  });

  // Save the PDF
  doc.save(`yield_predictions_${moment().format('YYYY-MM-DD')}.pdf`);
}
