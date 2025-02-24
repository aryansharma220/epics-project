import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart2,
  TrendingUp,
  Calendar,
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
  Plus
} from 'lucide-react';
import type { FarmingTask } from '../types';

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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Yield</p>
              <h3 className="text-2xl font-bold dark:text-white">20.3 tons</h3>
            </div>
            <Sprout className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rainfall</p>
              <h3 className="text-2xl font-bold dark:text-white">85 mm</h3>
            </div>
            <CloudRain className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-500">+5.2%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
              <h3 className="text-2xl font-bold dark:text-white">₹45,250</h3>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-500">+8.1%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {tasks.filter(t => t.status !== 'completed').length}
              </h3>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex items-center text-sm">
            <span className="text-purple-500">
              {tasks.filter(t => t.status === 'pending').length} pending
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              {tasks.filter(t => t.status === 'completed').length} completed
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Crop Yield Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold dark:text-white">Crop Yield Trends</h3>
            <div className="flex items-center gap-2">
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <Filter className="w-4 h-4" />
              </button>
              <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between">
            {cropYields.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-green-500 rounded-t"
                  style={{ height: `${data.yield * 30}px` }}
                ></div>
                <div
                  className="w-8 bg-green-200 dark:bg-green-700 rounded-t mt-1"
                  style={{ height: `${data.target * 30}px` }}
                ></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{data.month}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 dark:bg-green-700 rounded"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Target</span>
            </div>
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
                  <Calendar className="w-4 h-4 mr-2" />
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

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">
                  {selectedTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              {/* Add your task form here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Task title"
                    value={selectedTask?.title || ''}
                  />
                </div>
                {/* Add more form fields */}
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  {selectedTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}