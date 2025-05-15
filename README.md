# FarmAssist 🌾

A comprehensive agricultural assistance platform built to empower farmers with modern technology, data-driven insights, and access to government schemes.

[![Built with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🌟 Features

### 🗺️ Crop Mapping & Analysis
- Interactive maps showing crop distribution
- Soil quality analysis using AI
- Crop recommendation system based on local conditions
- Weather-based farming insights

### 🌦️ Weather Intelligence
- Real-time weather updates
- Advanced weather forecasting
- Agricultural alerts and advisories
- Weather-based crop management tips

### 💰 Financial Services
- Government scheme eligibility checker
- MSP (Minimum Support Price) rate tracker
- Subsidy information and applications
- Financial planning tools

### 🏪 Agricultural Marketplace
- Buy/sell agricultural products
- Equipment and tools marketplace
- Direct farmer-to-consumer platform
- Transparent pricing system

### 🌐 Multi-language Support
- Supports multiple Indian languages
- Localized content and information
- Regional farming practices integration
- Cultural context awareness

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/farmassist.git
cd farmassist
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a .env file in the root directory:
\`\`\`env
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_API_URL=your_api_url
VITE_GOOGLE_AI_KEY=your_google_ai_key
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_DATA_GOV_API_KEY=your_data_gov_api_key
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🏗️ Project Structure

\`\`\`
src/
├── components/         # Reusable UI components
├── pages/             # Route pages
├── services/          # API and business logic
├── store/             # State management
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── i18n/              # Internationalization
└── hooks/             # Custom React hooks
\`\`\`

## 🔧 Technology Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS
- **Vite**: Build tool
- **React Router**: Routing
- **i18next**: Internationalization

### APIs & Services
- **Google Maps API**: Location services
- **Mapbox**: Interactive maps
- **OpenWeather API**: Weather data
- **Google Gemini AI**: AI insights
- **Data.gov.in API**: Government data

### State Management & Data Flow
- **React Context**: Application state
- **Custom Hooks**: Business logic
- **TypeScript**: Type safety

## 📈 Features in Detail

### Crop Mapping System
- Utilizes Mapbox for interactive mapping
- AI-powered soil analysis
- Integration with weather data
- Crop recommendation engine

### Weather System
- Real-time weather updates
- 5-day weather forecasts
- Agricultural advisories
- Weather-based crop management

### Government Schemes
- Real-time scheme updates
- Eligibility checker
- Document requirements
- Application tracking

### Marketplace
- Product listings
- Shopping cart
- Order management
- Payment integration

## 🔐 Security

- HTTPS encryption
- Environment variable protection
- API key security
- Data validation

## 🌐 API Documentation

### Weather API
\`\`\`typescript
GET /api/weather
Parameters:
- lat: number
- lng: number
Returns: WeatherData
\`\`\`

### Soil Analysis API
\`\`\`typescript
GET /api/soil
Parameters:
- lat: number
- lng: number
Returns: SoilData
\`\`\`

### Crop Recommendations API
\`\`\`typescript
GET /api/crops
Parameters:
- soil: SoilData
- weather: WeatherData
Returns: CropData[]
\`\`\`

## 🌍 Internationalization

Supported languages:
- English
- Hindi
- Other regional languages (configurable)

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Progressive Web App (PWA) ready

## 🚀 Deployment

The application is deployed on Vercel and can be accessed at:
[https://farmassist.vercel.app](https://farmassist.vercel.app)

### Deployment Steps
1. Push to main branch
2. Automatic deployment via Vercel
3. Environment variable configuration
4. Domain setup and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Developer: [Your Name]
- Project Guide: [Guide Name]
- Institution: [Institution Name]

## 🙏 Acknowledgments

- Weather data: OpenWeather API
- Maps: Mapbox
- AI Services: Google Gemini
- Government Data: Data.gov.in

## 📞 Support

For support, email [your-email@example.com] or join our Discord server.

---

Made with ❤️ for Indian Farmers
