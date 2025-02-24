import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, BotIcon } from 'lucide-react';
import { useStore } from '../store';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { preferences, setDarkMode, setLanguage } = useStore();

  const toggleDarkMode = () => {
    setDarkMode(!preferences.isDarkMode);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const openChatBot =() =>{
    window.location.href = 'https://chatbot-farm-assist.vercel.app/';
  }

  return (
    <nav className={`${
      preferences.isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    } shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              🌾 FarmAssist
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/map" className="hover:text-green-500">{t('nav.map')}</Link>
              <Link to="/weather" className="hover:text-green-500">{t('nav.weather')}</Link>
              <Link to="/marketplace" className="hover:text-green-500">{t('nav.marketplace')}</Link>
              <Link to="/dashboard" className="hover:text-green-500">{t('nav.dashboard')}</Link>

            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={openChatBot}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <BotIcon size={20} />
            </button>
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {preferences.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}