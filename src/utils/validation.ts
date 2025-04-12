import { z } from 'zod';
import type { CropData } from '../types/dashboard';
import moment from 'moment';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const cropDataSchema = z.object({
  month: z.string().min(1),
  yield: z.number().min(0).max(1000),
  target: z.number().min(0).max(1000),
  rainfall: z.number().min(0).max(5000),
  temperature: z.number().min(-50).max(60)
});

export function validateCropData(data: Omit<CropData, 'id'>): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate month format (YYYY-MM)
  if (!data.month || !moment(data.month, 'YYYY-MM', true).isValid()) {
    errors.month = 'Invalid month format. Use YYYY-MM format.';
  }

  // Validate future dates
  if (moment(data.month).isAfter(moment(), 'month')) {
    errors.month = 'Cannot add data for future months.';
  }

  // Validate yield
  if (typeof data.yield !== 'number' || data.yield < 0) {
    errors.yield = 'Yield must be a positive number.';
  } else if (data.yield > 100) { // Assuming unrealistic yield above 100 tons
    errors.yield = 'Yield value seems unrealistic. Please verify.';
  }

  // Validate target
  if (typeof data.target !== 'number' || data.target < 0) {
    errors.target = 'Target must be a positive number.';
  } else if (data.target > 100) {
    errors.target = 'Target value seems unrealistic. Please verify.';
  }

  // Validate rainfall
  if (typeof data.rainfall !== 'number' || data.rainfall < 0) {
    errors.rainfall = 'Rainfall must be a positive number.';
  } else if (data.rainfall > 1000) { // Unrealistic monthly rainfall
    errors.rainfall = 'Rainfall value seems unrealistic. Please verify.';
  }

  // Validate temperature
  if (typeof data.temperature !== 'number') {
    errors.temperature = 'Temperature must be a number.';
  } else if (data.temperature < -20 || data.temperature > 50) {
    errors.temperature = 'Temperature value seems unrealistic. Please verify.';
  }

  // Additional business logic validations
  if (data.yield > data.target * 1.5) {
    errors.yield = 'Yield significantly exceeds target. Please verify data.';
  }

  // Season-specific validations
  const month = moment(data.month).month();
  const season = getSeason(month);
  if (season === 'winter' && data.temperature > 30) {
    errors.temperature = 'Temperature seems too high for winter season.';
  }
  if (season === 'summer' && data.temperature < 10) {
    errors.temperature = 'Temperature seems too low for summer season.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateAnalysisData(data: CropData[]): ValidationResult {
  const errors: Record<string, string> = {};

  if (!Array.isArray(data)) {
    errors.data = 'Invalid data format';
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.data = 'No data provided for analysis';
    return { isValid: false, errors };
  }

  // Check for duplicate months
  const months = new Set<string>();
  data.forEach(item => {
    if (months.has(item.month)) {
      errors.duplicates = `Duplicate entry found for month ${item.month}`;
    }
    months.add(item.month);
  });

  // Check for data consistency
  let prevMonth = moment(data[0].month);
  for (let i = 1; i < data.length; i++) {
    const currentMonth = moment(data[i].month);
    const monthDiff = currentMonth.diff(prevMonth, 'months');
    
    if (monthDiff > 1) {
      errors.gaps = `Missing data between ${prevMonth.format('YYYY-MM')} and ${currentMonth.format('YYYY-MM')}`;
    } else if (monthDiff < 0) {
      errors.order = 'Data is not in chronological order';
    }
    
    prevMonth = currentMonth;
  }

  // Validate trends for unrealistic changes
  for (let i = 1; i < data.length; i++) {
    const yieldChange = Math.abs(data[i].yield - data[i-1].yield) / data[i-1].yield * 100;
    if (yieldChange > 50) {
      errors.trends = `Suspicious yield change of ${yieldChange.toFixed(1)}% between ${data[i-1].month} and ${data[i].month}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateExportData(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    errors.data = 'Invalid data format for export';
    return { isValid: false, errors };
  }

  // Check required data sections
  if (!data.cropData || !Array.isArray(data.cropData)) {
    errors.cropData = 'Missing or invalid crop data';
  }

  if (!data.analysis || typeof data.analysis !== 'object') {
    errors.analysis = 'Missing or invalid analysis data';
  }

  if (!data.weatherData || typeof data.weatherData !== 'object') {
    errors.weatherData = 'Missing or invalid weather data';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function validateWeatherData(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    errors.data = 'Invalid weather data format';
    return { isValid: false, errors };
  }

  // Validate current weather data
  if (!data.current || typeof data.current !== 'object') {
    errors.current = 'Missing or invalid current weather data';
  } else {
    if (typeof data.current.temperature !== 'number') {
      errors.temperature = 'Invalid temperature value';
    }
    if (typeof data.current.humidity !== 'number' || data.current.humidity < 0 || data.current.humidity > 100) {
      errors.humidity = 'Invalid humidity value';
    }
    if (typeof data.current.windSpeed !== 'number' || data.current.windSpeed < 0) {
      errors.windSpeed = 'Invalid wind speed value';
    }
  }

  // Validate forecast data
  if (data.forecast) {
    if (!Array.isArray(data.forecast.hourly)) {
      errors.forecast = 'Invalid hourly forecast data';
    } else {
      const invalidHour = data.forecast.hourly.find((hour: any) => 
        typeof hour.temp !== 'number' ||
        typeof hour.humidity !== 'number' ||
        !hour.weather ||
        !Array.isArray(hour.weather)
      );
      
      if (invalidHour) {
        errors.forecast = 'Invalid forecast hour data format';
      }
    }
  }

  // Validate alerts
  if (data.alerts && !Array.isArray(data.alerts)) {
    errors.alerts = 'Invalid weather alerts format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
