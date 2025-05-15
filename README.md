# FarmAssist 🌾

![image](https://github.com/user-attachments/assets/e83b42b7-4483-4d8c-8369-c744317b0e8e)


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
  
![image](https://github.com/user-attachments/assets/139238ea-1169-4236-aa1a-3de8ca1b9df5)


### 🌦️ Weather Intelligence
- Real-time weather updates
- Advanced weather forecasting
- Agricultural alerts and advisories
- Weather-based crop management tips
  
![image](https://github.com/user-attachments/assets/a6d41259-09a2-4fb8-9ae7-10b1ca004275)


### 💰 Financial Services
- Government scheme eligibility checker
- MSP (Minimum Support Price) rate tracker
- Subsidy information and applications
- Financial planning tools
  
  ![image](https://github.com/user-attachments/assets/65f421fe-c997-4dc9-8da3-f2bb688c806b)
  
  ![image](https://github.com/user-attachments/assets/ea2bd3e4-dba2-4cb2-88d7-5339f90a30b8)


### 🏪 Agricultural Marketplace
- Buy/sell agricultural products
- Equipment and tools marketplace
- Direct farmer-to-consumer platform
- Transparent pricing system
  
![image](https://github.com/user-attachments/assets/1529fdcd-a769-4366-a25b-b377b082e2e7)

### 🧮 Personlised Dashboard
- Real-time crop monitoring and analytics
- Custom yield predictions using AI
- Financial insights and profit tracking
- Farm resource management
- Interactive data visualization with charts and graphs
- Personalized recommendations based on farming history
- Activity timeline and task management
- Weather impact analysis on crops
- Smart notifications and reminders
- Export reports in multiple formats (PDF, CSV)
  
![image](https://github.com/user-attachments/assets/af3c3a65-5a85-43a4-bc4b-ff880fab85ea)


### 🌐 Multi-language Support
- Supports multiple Indian languages
- Localized content and information
- Regional farming practices integration
- Cultural context awareness

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

GET /api/weather
Parameters:
- lat: number
- lng: number
Returns: WeatherData


### Soil Analysis API

GET /api/soil
Parameters:
- lat: number
- lng: number
Returns: SoilData


### Crop Recommendations API

GET /api/crops
Parameters:
- soil: SoilData
- weather: WeatherData
Returns: CropData[]


## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Progressive Web App (PWA) ready

## 🚀 Deployment

The application is deployed on Vercel and can be accessed at:
[https://my-farm-assist.vercel.app](https://my-farm-assist.vercel.app/)

## 🙏 Acknowledgments

- Weather data: OpenWeather API
- Maps: Mapbox
- AI Services: Google Gemini
- Government Data: Data.gov.in

## 📞 Support

For support, email [aryansharma220318@gmail.com].

---

Made with ❤️ for Indian Farmers
