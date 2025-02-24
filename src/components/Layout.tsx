import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useStore } from '../store';

export default function Layout() {
  const isDarkMode = useStore((state) => state.preferences.isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}