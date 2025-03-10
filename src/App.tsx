import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CropMap from './pages/CropMap';
import Weather from './pages/Weather';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<CropMap />} />
          <Route path="weather" element={<Weather />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="https://chatbot-farm-assist.vercel.app/" element={<ChatBot />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;