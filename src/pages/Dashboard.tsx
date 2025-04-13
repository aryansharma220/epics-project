import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import {
  AlertCircle,
  Sprout,
  CloudRain,
  DollarSign,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  Plus,
  Droplets,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { cropDataApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { validateCropData } from '../utils/validation';
import { generatePDFReport, exportWeatherReport } from '../utils/export';
import type { FarmingTask } from '../types';
import type { CropData, AnalysisResult, DashboardStats } from '../types/dashboard';
import { getWeatherData } from '../services/api';
import { useStore } from '../store';

const cropYields = [
  { month: 'Jan', yield: 2.4, target: 2.2, rainfall: 45, temperature: 22 },
  { month: 'Feb', yield: 2.8, target: 2.5, rainfall: 50, temperature: 24 },
  { month: 'Mar', yield: 3.2, target: 3.0, rainfall: 55, temperature: 25 },
  { month: 'Apr', yield: 3.8, target: 3.5, rainfall: 60, temperature: 26 },
  { month: 'May', yield: 4.2, target: 4.0, rainfall: 65, temperature: 28 },
  { month: 'Jun', yield: 3.9, target: 4.2, rainfall: 70, temperature: 29 },
];

const notifications = [
  {
    id: 1,
    type: 'alert',
    message: 'Weather alert: Heavy rainfall expected tomorrow',
    time: '2 hours ago',
    priority: 'high'
  },
  {
    id: 2,
    type: 'info',
    message: 'Best time to harvest your wheat crop',
    time: '5 hours ago',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'success',
    message: 'Crop price update: Wheat prices increased by 5%',
    time: '1 day ago',
    priority: 'low'
  },
];

const initialTasks: FarmingTask[] = [
  {
    id: '1',
    title: 'Apply fertilizer to wheat field',
    description: 'Use NPK fertilizer as per soil test recommendations',
    due: '2024-03-20',
    status: 'pending',
    priority: 'high',
    category: 'fertilization',
    notes: ['Check weather before application', 'Follow recommended dosage'],
  },
  {
    id: '2',
    title: 'Harvest rice crop',
    description: 'Complete harvesting of mature rice crop',
    due: '2024-03-25',
    status: 'completed',
    priority: 'high',
    category: 'harvesting',
    notes: ['Check grain moisture content', 'Arrange transportation'],
  },
  {
    id: '3',
    title: 'Maintain irrigation system',
    description: 'Regular maintenance of drip irrigation system',
    due: '2024-03-22',
    status: 'in-progress',
    priority: 'medium',
    category: 'maintenance',
    notes: ['Check for leaks', 'Clean filters'],
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<FarmingTask[]>(initialTasks);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FarmingTask | null>(null);
  const [newTask, setNewTask] = useState<Partial<FarmingTask>>({
    title: '',
    description: '',
    due: '',
    priority: 'medium',
    category: '',
    notes: [],
    status: 'pending'
  });

  const [cropData, setCropData] = useState<CropData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDataForm, setShowDataForm] = useState(false);
  const [newCropData, setNewCropData] = useState<Omit<CropData, 'id'>>({
    month: new Date().toLocaleString('default', { month: 'short' }),
    yield: 0,
    target: 0,
    rainfall: 0,
    temperature: 0
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [weatherRecommendations, setWeatherRecommendations] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const { preferences } = useStore(); // Get user location preferences
  const [weatherData, setWeatherData] = useState<any>(null);

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<CropData, 'id'>) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(value)) {
      setNewCropData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [stats, analysis] = await Promise.all([
        cropDataApi.getRealtimeStats(),
        cropDataApi.getAnalysis()
      ]);
      setStats(stats);
      setAnalysis(analysis);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIInsights = useCallback(async () => {
    if (cropData.length === 0) return;
    
    setInsightsLoading(true);
    try {
      const insights = await dashboardService.getAIInsights(cropData);
      setAiInsights(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  }, [cropData]);

  const fetchWeatherRecommendations = useCallback(async () => {
    if (cropData.length === 0 || !preferences?.location) return;
    
    try {
      const { lat, lng } = preferences.location;
      const weather = await getWeatherData(lat, lng);
      setWeatherData(weather);
      
      const recommendations = await dashboardService.getWeatherAdaptedRecommendations(
        cropData, 
        weather
      );
      setWeatherRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching weather recommendations:", error);
    }
  }, [cropData, preferences?.location]);

  useEffect(() => {
    fetchDashboardData();
    
    // Mock crop data for demonstration purposes
    setCropData(cropYields);
  }, []);

  useEffect(() => {
    if (cropData.length > 0) {
      fetchAIInsights();
      fetchWeatherRecommendations();
    }
  }, [cropData, fetchAIInsights, fetchWeatherRecommendations]);

  const handleSubmitCropData = async () => {
    const { isValid, errors } = validateCropData(newCropData);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setIsAnalyzing(true);
    try {
      await cropDataApi.submitCropData(newCropData);
      await fetchDashboardData();
      setShowDataForm(false);
      toast.success('Crop data submitted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit crop data');
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePDFReport = useCallback(() => {
    if (!analysis || cropData.length === 0) return;
    
    try {
      generatePDFReport(cropData, analysis);
      toast.success('PDF report generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF report');
      console.error(error);
    }
  }, [analysis, cropData]);
  
  const handleGenerateWeatherReport = useCallback(() => {
    if (!weatherData || weatherRecommendations.length === 0) return;
    
    try {
      exportWeatherReport(weatherData, weatherRecommendations);
      toast.success('Weather report generated successfully');
    } catch (error) {
      toast.error('Failed to generate weather report');
      console.error(error);
    }
  }, [weatherData, weatherRecommendations]);

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'completed') return task.status === 'completed';
    return task.status === 'pending' || task.status === 'in-progress';
  });

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed'
        };
      }
      return task;
    }));
  };

  const handleAddTask = () => {
    const task: FarmingTask = {
      id: String(Date.now()),
      ...newTask as Omit<FarmingTask, 'id'>
    };
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      due: '',
      priority: 'medium',
      category: '',
      notes: [],
      status: 'pending'
    });
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...selectedTask } : t));
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Farm Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleGeneratePDFReport}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            disabled={!analysis || cropData.length === 0}
          >
            Generate PDF Report
          </button>
          <button
            onClick={handleGenerateWeatherReport}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            disabled={!weatherData || weatherRecommendations.length === 0}
          >
            Generate Weather Report
          </button>
          <button
            onClick={() => setShowDataForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Crop Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Yield</p>
                  <h3 className="text-2xl font-bold dark:text-white">{stats.totalYield.toFixed(1)} tons</h3>
                </div>
                <Sprout className="w-8 h-8 text-green-500" />
              </div>
              {analysis && (
                <div className="flex items-center text-sm">
                  {analysis.yieldTrend >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={analysis.yieldTrend >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(analysis.yieldTrend).toFixed(1)}% {analysis.yieldTrend >= 0 ? 'increase' : 'decrease'}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rainfall</p>
                  <h3 className="text-2xl font-bold dark:text-white">{stats.rainfall.toFixed(1)} mm</h3>
                </div>
                <CloudRain className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center text-sm">
                <Droplets className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-500">
                  {analysis?.averageRainfall ? `${analysis.averageRainfall.toFixed(1)} mm avg` : 'No data'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                  <h3 className="text-2xl font-bold dark:text-white">₹{stats.revenue.toLocaleString()}</h3>
                </div>
                <DollarSign className="w-8 h-8 text-amber-500" />
              </div>
              <div className="flex items-center text-sm">
                <Target className="w-4 h-4 text-amber-500 mr-1" />
                <span className="text-amber-500">
                  ₹{(analysis?.predictedYield ? analysis.predictedYield * 1500 : 0).toLocaleString()} projected
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
                  <h3 className="text-2xl font-bold dark:text-white">{tasks.length}</h3>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-500">
                  {tasks.filter(t => t.status === 'completed').length} completed / {tasks.filter(t => t.status !== 'completed').length} pending
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Analysis Results Section */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Analysis Results</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium dark:text-white">Recommendations</h4>
              <ul className="mt-2 space-y-2">
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm dark:text-gray-300">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Predicted Yield</h4>
              <p className="text-2xl font-bold mt-2 text-green-500">
                {analysis.predictedYield.toFixed(1)} tons
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Efficiency Metrics */}
      {analysis && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Efficiency Metrics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium dark:text-white">Yield Efficiency</h4>
                <p className="text-2xl font-bold mt-2 text-blue-500">
                  {analysis.cropAnalysis.efficiencyMetrics.yieldEfficiency.toFixed(1)}%
                </p>
              </div>
              <div>
                <h4 className="font-medium dark:text-white">Water Usage Efficiency</h4>
                <p className="text-2xl font-bold mt-2 text-blue-500">
                  {analysis.cropAnalysis.efficiencyMetrics.waterUsageEfficiency.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="font-medium dark:text-white">Target Achievement</h4>
                <p className="text-2xl font-bold mt-2 text-blue-500">
                  {analysis.cropAnalysis.efficiencyMetrics.targetAchievement.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Risk Assessment</h3>
            <div className="space-y-4">
              {analysis.cropAnalysis.riskFactors.map((risk, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  risk.risk === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                  risk.risk === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <h4 className="font-medium dark:text-white flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${
                      risk.risk === 'high' ? 'text-red-500' :
                      risk.risk === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    {risk.type}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {risk.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">AI Insights</h3>
          <ul className="space-y-2">
            {aiInsights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weather Recommendations Section */}
      {weatherRecommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Weather-Aware Recommendations</h3>
          <ul className="space-y-2">
            {weatherRecommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Crop Yield Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold dark:text-white">Crop Yield Trends</h3>
            <div className="flex items-center gap-2">
              <button
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title="Expand"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={cropYields}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg shadow">
                        <p className="text-sm font-medium">{`Month: ${payload[0].payload.month}`}</p>
                        <p className="text-sm text-green-600">{`Yield: ${payload[0].value} tons`}</p>
                        <p className="text-sm text-blue-600">{`Target: ${payload[1].value} tons`}</p>
                        <p className="text-sm text-gray-600">{`Rainfall: ${payload[0].payload.rainfall} mm`}</p>
                      </div>
                    );
                  }
                  return null;
                }}/>
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  name="Actual Yield" 
                  stroke="#10b981" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Target" 
                  stroke="#93c5fd" 
                  strokeWidth={2}
                  strokeDasharray="5 5" 
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">Recent Notifications</h3>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg ${
                  notification.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : notification.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <Bell className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  notification.priority === 'high'
                    ? 'text-red-500'
                    : notification.priority === 'medium'
                    ? 'text-yellow-500'
                    : 'text-blue-500'
                }`} />
                <div>
                  <p className="text-sm dark:text-white">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">Yield vs Weather Impact</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cropYields}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="yield" name="Yield (tons)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tasks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold dark:text-white">Farming Tasks</h3>
          <div className="flex items-center gap-4">
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value as typeof taskFilter)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => {
                setSelectedTask(null);
                setShowTaskModal(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center flex-1">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    task.status === 'completed'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium dark:text-white ${
                    task.status === 'completed' ? 'line-through text-gray-500' : ''
                  }`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                }`}>
                  {task.priority}
                </span>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{task.due}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskModal(true);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold dark:text-white">
                {selectedTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Task title"
                  aria-label="Task title"
                  value={selectedTask?.title || newTask.title}
                  onChange={(e) => selectedTask 
                    ? setSelectedTask({...selectedTask, title: e.target.value})
                    : setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Task description"
                  aria-label="Task description"
                  rows={3}
                  value={selectedTask?.description || newTask.description}
                  onChange={(e) => selectedTask 
                    ? setSelectedTask({...selectedTask, description: e.target.value})
                    : setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    aria-label="Due date"
                    value={selectedTask?.due || newTask.due}
                    onChange={(e) => selectedTask 
                      ? setSelectedTask({...selectedTask, due: e.target.value})
                      : setNewTask({...newTask, due: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    aria-label="Task priority"
                    value={selectedTask?.priority || newTask.priority}
                    onChange={(e) => selectedTask 
                      ? setSelectedTask({...selectedTask, priority: e.target.value as FarmingTask['priority']})
                      : setNewTask({...newTask, priority: e.target.value as FarmingTask['priority']})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="Task category"
                  value={selectedTask?.category || newTask.category || 'maintenance'}
                  onChange={(e) => selectedTask 
                    ? setSelectedTask({...selectedTask, category: e.target.value as FarmingTask['category']})
                    : setNewTask({...newTask, category: e.target.value as FarmingTask['category']})}
                >
                  <option value="planting">Planting</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="fertilization">Fertilization</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={selectedTask ? handleUpdateTask : handleAddTask}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {selectedTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Data Form Modal */}
      {showDataForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold dark:text-white">Add Crop Data</h3>
              <button
                onClick={() => setShowDataForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <input
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCropData.month}
                    onChange={(e) => setNewCropData({...newCropData, month: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Yield (tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      validationErrors.yield ? 'border-red-500' : ''
                    }`}
                    value={newCropData.yield || ''}
                    onChange={(e) => handleNumberInput(e, 'yield')}
                  />
                  {validationErrors.yield && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.yield}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target (tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      validationErrors.target ? 'border-red-500' : ''
                    }`}
                    value={newCropData.target || ''}
                    onChange={(e) => handleNumberInput(e, 'target')}
                  />
                  {validationErrors.target && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.target}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      validationErrors.rainfall ? 'border-red-500' : ''
                    }`}
                    value={newCropData.rainfall || ''}
                    onChange={(e) => handleNumberInput(e, 'rainfall')}
                  />
                  {validationErrors.rainfall && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.rainfall}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    validationErrors.temperature ? 'border-red-500' : ''
                  }`}
                  value={newCropData.temperature || ''}
                  onChange={(e) => handleNumberInput(e, 'temperature')}
                />
                {validationErrors.temperature && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.temperature}</p>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowDataForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCropData}
                  disabled={isLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-gray-700 dark:text-gray-200">Analyzing crop data...</p>
          </div>
        </div>
      )}
    </div>
  );
}