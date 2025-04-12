import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plane as Plant, 
  Cloud, 
  ShoppingBag, 
  BarChart2, 
  ArrowRight, 
  Users, 
  Award, 
  BookOpen, 
  ChevronRight, 
  Star, 
  ArrowUp,
  Leaf,
  Sun,
  Droplets
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Animate stats when in view
      if (statsRef.current && !hasAnimated) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setHasAnimated(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  // Automatic testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Plant className="w-8 h-8 text-green-500" />,
      title: t('nav.map'),
      description: 'Get AI-powered crop recommendations based on your location',
      link: '/map',
      bgColor: 'from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700'
    },
    {
      icon: <Cloud className="w-8 h-8 text-blue-500" />,
      title: t('nav.weather'),
      description: 'Real-time weather updates and alerts',
      link: '/weather',
      bgColor: 'from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700'
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-orange-500" />,
      title: t('nav.marketplace'),
      description: 'Buy and sell agricultural products',
      link: '/marketplace',
      bgColor: 'from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700'
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-500" />,
      title: t('nav.dashboard'),
      description: 'Track your farming insights and analytics',
      link: '/dashboard',
      bgColor: 'from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700'
    }
  ];

  const stats = [
    { number: 10000, suffix: '+', label: 'Active Farmers', icon: <Users className="w-6 h-6" /> },
    { number: 95, suffix: '%', label: 'Accuracy Rate', icon: <Award className="w-6 h-6" /> },
    { number: 24, suffix: '/7', label: 'Support Available', icon: <BookOpen className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Maria Johnson",
      role: "Organic Farmer",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
      quote: "FarmAssist has revolutionized how I plan my crops. The AI recommendations increased my yield by 30% in just one season!",
      rating: 5
    },
    {
      name: "Daniel Smith",
      role: "Commercial Grower",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      quote: "The weather alerts have saved my crops multiple times from unexpected frost. This platform is a game-changer.",
      rating: 5
    },
    {
      name: "Sarah Thompson",
      role: "Small-Scale Farmer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      quote: "The marketplace feature connected me directly with local restaurants. I'm now selling at premium prices without middlemen.",
      rating: 4
    }
  ];

  const benefits = [
    {
      icon: <Leaf className="w-8 h-8 text-green-500" />,
      title: "Smart Recommendations",
      description: "Get AI-powered insights for optimal crop selection and farming practices based on your location and conditions."
    },
    {
      icon: <Sun className="w-8 h-8 text-amber-500" />,
      title: "Weather Intelligence",
      description: "Stay ahead with accurate weather forecasts and timely alerts to protect your crops."
    },
    {
      icon: <Droplets className="w-8 h-8 text-blue-500" />,
      title: "Market Access",
      description: "Connect directly with buyers and sellers in our agricultural marketplace for better prices."
    }
  ];

  // Animated counter
  const Counter = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!hasAnimated) return;
      
      let start = 0;
      const end = value;
      const duration = 2000;
      const step = Math.max(1, Math.floor(end / (duration / 16)));
      
      const timer = setInterval(() => {
        start += step;
        setCount(start);
        
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [value, hasAnimated]);
    
    return <span>{count}{suffix}</span>;
  };

  // Define animation CSS classes
  const fadeInAnimation = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  const slideUpAnimation = `
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;

  useEffect(() => {
    // Add animation styles to head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      ${fadeInAnimation}
      ${slideUpAnimation}
      
      .animate-fadeIn {
        animation: fadeIn 1s ease-out forwards;
      }
      
      .animate-slideUp {
        animation: slideUp 1s ease-out 0.5s forwards;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
      {/* Hero Section with Parallax */}
      <div className="relative h-[80vh] mb-24 flex items-center justify-center overflow-hidden rounded-3xl">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80')] bg-fixed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-center px-6 py-12 backdrop-blur-sm bg-white/10 rounded-xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fadeIn">
            Welcome to <span className="text-green-300">FarmAssist</span>
          </h1>
          <div className="overflow-hidden h-20">
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slideUp">
              Your AI-powered farming companion for smarter agriculture
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 font-medium"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-lg hover:bg-white/30 transition-all duration-300 font-medium"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center animate-bounce">
          <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-white transform rotate-90" />
          </div>
        </div>
      </div>

      {/* Features Grid - Enhanced with gradients and hover effects */}
      <div className="mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 dark:text-white">
          Our <span className="text-green-500">Features</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative"
            >
              <div className={`p-8 rounded-xl bg-gradient-to-br ${feature.bgColor} shadow-lg transition-all duration-500 h-full transform group-hover:-translate-y-2 group-hover:shadow-xl dark:shadow-gray-800/20 overflow-hidden`}>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:opacity-20 transition-opacity duration-500">
                  {React.cloneElement(feature.icon, { className: "w-40 h-40" })}
                </div>
                <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                  Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Section - Enhanced with better overlay */}
      <div className="relative rounded-3xl overflow-hidden mb-24 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
          alt="Farm landscape"
          className="w-full h-[500px] object-cover transform scale-105 hover:scale-100 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/70 to-transparent flex items-center">
          <div className="p-12 max-w-2xl">
            <span className="inline-block px-4 py-1 bg-green-500/20 backdrop-blur-sm text-green-300 rounded-full mb-4 text-sm font-medium">
              Get Started Today
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Your Smart Farming Journey Today
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
              Get personalized recommendations, weather insights, and connect with other farmers
              in your community. Transform your agricultural practices with data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-6 py-3 rounded-lg hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-white/20 transform hover:-translate-y-1"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Explore Map
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid - Enhanced with icons and hover effects */}
      <div className="mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 dark:text-white">
          Why Choose <span className="text-green-500">FarmAssist</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-b-4 border-transparent hover:border-green-500"
            >
              <div className="mb-6 p-4 rounded-full bg-gray-50 dark:bg-gray-700 inline-block">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section - Enhanced with gradient and shape */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-400 text-white rounded-3xl p-16 mb-24 overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-20">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M50.5,-68.5C62.9,-59,68.5,-39.7,73,-21.1C77.6,-2.5,81.1,15.5,75.6,30.3C70,45.1,55.4,56.7,39.9,65.1C24.4,73.6,8.1,79,-8.8,79C-25.6,79,-51.2,73.6,-68.4,59.3C-85.6,45,-94.3,21.7,-92.9,-0.8C-91.4,-23.4,-79.9,-45.1,-63.5,-54.9C-47.2,-64.7,-26.1,-62.6,-6,-55.8C14.1,-49,38.1,-77.9,50.5,-68.5Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Farming?</h2>
          <p className="text-xl mb-10 text-white/90">
            Join thousands of farmers who are already using FarmAssist to improve their yields and make data-driven decisions.
          </p>
          <Link
            to="/map"
            className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-4 rounded-lg hover:bg-green-50 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-white/20 transform hover:-translate-y-1"
          >
            Start Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-8 bottom-8 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:-translate-y-1 z-50 ${
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}