import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plane as Plant, Cloud, ShoppingBag, BarChart2, ArrowRight, Users, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Plant className="w-8 h-8 text-green-500" />,
      title: t('nav.map'),
      description: 'Get AI-powered crop recommendations based on your location',
      link: '/map'
    },
    {
      icon: <Cloud className="w-8 h-8 text-blue-500" />,
      title: t('nav.weather'),
      description: 'Real-time weather updates and alerts',
      link: '/weather'
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-orange-500" />,
      title: t('nav.marketplace'),
      description: 'Buy and sell agricultural products',
      link: '/marketplace'
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-500" />,
      title: t('nav.dashboard'),
      description: 'Track your farming insights and analytics',
      link: '/dashboard'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Farmers', icon: <Users className="w-6 h-6" /> },
    { number: '95%', label: 'Accuracy Rate', icon: <Award className="w-6 h-6" /> },
    { number: '24/7', label: 'Support Available', icon: <BookOpen className="w-6 h-6" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 dark:text-white">
          Welcome to FarmAssist
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your AI-powered farming companion for smarter agriculture
        </p>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 group"
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-green-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-center text-green-500 dark:text-green-400 mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold dark:text-white">{stat.number}</div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="relative rounded-2xl overflow-hidden mb-16">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
          alt="Farm landscape"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-transparent flex items-center">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Smart Farming Journey Today
            </h2>
            <p className="text-white/90 text-lg max-w-lg mb-6">
              Get personalized recommendations, weather insights, and connect with other farmers
              in your community.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Smart Recommendations</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Get AI-powered insights for optimal crop selection and farming practices based on your location and conditions.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Weather Intelligence</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Stay ahead with accurate weather forecasts and timely alerts to protect your crops.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Market Access</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Connect directly with buyers and sellers in our agricultural marketplace for better prices.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-green-500 text-white rounded-2xl p-12 mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h2>
        <p className="text-lg mb-8">
          Join thousands of farmers who are already using FarmAssist to improve their yields.
        </p>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold"
        >
          Start Now
          <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}