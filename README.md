# Smart KMB App

A modern, multi-language mobile application for accessing real-time information about Kowloon Motor Bus (KMB) services in Hong Kong. The app allows users to search bus routes, find nearby stops, view estimated arrival times, and save favorites.

![Smart KMB App Screenshot](./assets/images/app-screenshot.png)

## 📱 Features

- **Real-time Bus Information**: Access the latest data on bus routes and arrival times
- **Multi-language Support**: Available in English, Traditional Chinese, and Simplified Chinese
- **Route Search**: Find bus routes by number or destination
- **Nearby Stops**: Discover bus stops near your current location
- **Interactive Maps**: View bus routes and stops on an interactive map
- **Favorites**: Save your most used routes and stops for quick access
- **Dark Mode Support**: Comfortable viewing experience day and night
- **Cross-platform**: Works on iOS, Android, and web platforms

## 🔧 Technologies Used

- **Frontend**:
  - React Native / Expo
  - TypeScript
  - Expo Router for navigation
  - React Hooks for state management
  - Reanimated for animations
- **APIs & Services**:
  - KMB Data API for bus information
  - Device location services
  - Google Maps integration

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS/Android emulator or physical device for testing

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/smart-kmb-app.git
   cd smart-kmb-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan the QR code with the Expo Go app on your physical device

### Building for Production

```bash
# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios
```

## 📁 Project Structure

```
smart-kmb-app/
├── app/                   # Main app screens using Expo Router
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── bus/               # Bus route screens
│   ├── stop/              # Bus stop screens
│   ├── _layout.tsx        # Root layout configuration
│   └── about.tsx          # About screen
├── assets/                # Static resources
│   ├── fonts/             # Custom fonts
│   └── images/            # App images
├── components/            # Reusable UI components
│   ├── mocks/             # Web mock components
│   └── ui/                # UI elements
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── util/                  # Utility functions and API services
├── constants/             # App-wide constants
├── babel.config.js        # Babel configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── app.json               # Expo configuration
```

## 📡 API Documentation

The app uses the KMB Data API to fetch real-time bus information:

- **Base URL**: `https://data.etabus.gov.hk/v1/transport/kmb`
- **Routes Endpoint**: `/route/`
- **Route Stops Endpoint**: `/route-stop/{route}/{direction}/{service_type}`
- **Stop Information Endpoint**: `/stop/`
- **ETA Endpoint**: `/eta/{stop_id}/{route}/{service_type}`

Data is cached for 5 minutes to reduce API calls and improve performance.

## 📋 Features Implementation

### Multi-language Support

The app supports three languages: English, Traditional Chinese, and Simplified Chinese. Language settings can be changed from the settings screen.

### Location Services

The app uses device location to find nearby bus stops within selectable radiuses (250m, 500m, or 1km).

### Favorites System

Users can save both bus routes and stops to favorites for quick access from the home screen.

### Maps Integration

Interactive maps display bus routes and stops with tap-to-navigate functionality.

## 👥 Contributors

This app was developed as a course group project at Hong Kong Metropolitan University (HKMU):

- Li Yanpei - Frontend Development / Server Deploy
- Li Yuan - Group Member
- LEE Meng Hin - Group Member
- Chan Antony - Group Member
- Sze Tsz Yam - Group Member
- Poon Chun Him - Group Member

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📝 Notes

- This application is developed for academic purposes as part of COMP S313F Mobile Application Programming.
- The app uses real data from KMB, but is not officially affiliated with or endorsed by KMB.
