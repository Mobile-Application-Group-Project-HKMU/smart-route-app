# Smart KMB App

## Project Overview

The Smart KMB App is a comprehensive mobile application developed as part of the COMP S313F Mobile Application Programming course at Hong Kong Metropolitan University. This cross-platform application provides real-time bus information for Kowloon Motor Bus (KMB) services in Hong Kong, designed to help users efficiently navigate public transportation.

This academic initiative serves as a practical implementation of modern mobile development paradigms, integrating cutting-edge technologies and industry best practices. The app delivers a seamless experience across iOS, Android, and web platforms through a unified codebase.

## Features

### Core Functionalities

- **Real-time Bus Arrival Information**: View accurate ETAs for all KMB bus routes and stops
- **Route Search**: Find bus routes by number, origin, or destination
- **Stop Locator**: Search for bus stops by name or ID
- **Favorites System**: Save frequently used routes and stops for quick access
- **Nearby Stops**: Discover bus stops within customizable proximity to current location
- **Map Integration**: Visualize bus stops and routes on interactive maps
- **Navigation Support**: Open directions to bus stops in Google Maps or Apple Maps
- **Multi-language Support**: Full localization in English, Traditional Chinese, and Simplified Chinese
- **Responsive Design**: Optimized for various screen sizes and orientations
- **Dark Mode Support**: Enhanced visual comfort in low-light environments

## Technology Stack

### Development Environment

- **Framework**: React Native with Expo (SDK 52)
- **Language**: TypeScript
- **Routing**: Expo Router v4 (file-based routing)
- **State Management**: React Context API
- **Platform Support**: iOS, Android, and Web

### Key Libraries and APIs

- **UI Components**: Custom themed components with platform-specific adaptations
- **Maps Integration**: react-native-maps (with Google Maps integration)
- **Location Services**: expo-location
- **Storage**: AsyncStorage for persistent data
- **Networking**: Axios for API requests
- **Animations**: react-native-reanimated
- **Internationalization**: Custom language context
- **Navigation**: expo-router with Stack and Tab navigators

### Data Sources

- KMB Open Data API for real-time bus information
- Device location services for proximity-based features

## Implementation Details

### Architecture

The application follows a modular architecture with the following key components:

1. **Routing System**: Leverages Expo Router's file-based routing for intuitive navigation
2. **Component Library**: Custom themed components that adapt to platform and appearance mode
3. **Data Fetching Layer**: Centralized API utilities for consistent data access
4. **Context Providers**: Global state management for language, theme, and favorites
5. **Platform-Specific Adaptations**: Specialized implementations for web (.web.tsx) and native platforms

### Key Implementation Highlights

#### Adaptive UI System

The app features a sophisticated UI system with ThemedView and ThemedText components that automatically adjust to the system's color scheme. This approach ensures visual consistency while respecting user preferences for light/dark mode.

```typescript
<ThemedView style={styles.container}>
  <ThemedText type="title">{t("home.title")}</ThemedText>
  <HelloWave />
</ThemedView>
```

#### Multi-platform Maps Integration

The mapping functionality is implemented with platform-specific considerations:

- On iOS: Integrates with Apple Maps
- On Android: Uses Google Maps via react-native-maps
- On Web: Provides a graceful fallback with direct Google Maps links

This approach ensures optimal performance and user experience across all supported platforms.

#### Location-Based Services

The nearby stops feature demonstrates sophisticated use of device location capabilities:

```typescript
const findNearbyStops = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const stops = await findNearbyStops(
      location.coords.latitude,
      location.coords.longitude,
      selectedRadius
    );

    setNearbyStops(stops);
  } catch (error) {
    // Error handling
  }
};
```

#### Internationalization System

The application implements a comprehensive language system that supports English, Traditional Chinese, and Simplified Chinese through a custom context provider:

```typescript
<LanguageProvider>
  <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <Stack>{/* Application routes */}</Stack>
  </ThemeProvider>
</LanguageProvider>
```

#### Real-time Data Processing

ETAs and bus information are processed and categorized efficiently to provide users with clear, organized data:

```typescript
const classifiedETAs = useMemo(() => {
  if (!etas) return [];
  return classifyStopETAs(etas);
}, [etas]);
```

### Performance Optimizations

1. **Memoization**: Strategic use of useMemo and useCallback to prevent unnecessary re-renders
2. **Lazy Loading**: Components are loaded only when needed
3. **Platform-Specific Code Splitting**: Separate implementations for web and native platforms
4. **Efficient List Rendering**: FlatList with optimized rendering for long lists
5. **Web-specific Optimizations**: Custom webpack configuration for web performance

### Accessibility Considerations

- Semantic markup for screen readers
- Sufficient color contrast for all UI elements
- Touch targets sized appropriately for all users

## Installation and Setup

### Prerequisites

- Node.js (v18 or later)
- Yarn or npm
- Expo CLI
- iOS/Android development environment (for native testing)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/smart-kmb-app.git
   cd smart-kmb-app
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server:

   ```bash
   yarn start
   # or
   npm start
   ```

4. Run on specific platforms:

   ```bash
   # For iOS
   yarn ios

   # For Android
   yarn android

   # For Web
   yarn web
   ```

### Building for Production

```bash
# Build for all platforms
yarn build

# Build APK for Android
yarn apk
```

## Project Structure

```
smart-kmb-app/
├── app/                      # Main application screens and routing
│   ├── (tabs)/               # Tab-based navigation screens
│   │   ├── index.tsx         # Home screen
│   │   ├── bus.tsx           # Bus routes screen
│   │   └── nearby.tsx        # Nearby stops screen
│   ├── bus/                  # Bus route details
│   │   └── [routeId].tsx     # Dynamic route for bus details
│   ├── stop/                 # Bus stop details
│   │   └── [stopId].tsx      # Dynamic route for stop details
│   ├── about.tsx             # About screen
│   ├── settings.tsx          # Settings screen
│   └── _layout.tsx           # Root layout component
├── assets/                   # Static assets (images, fonts)
├── components/               # Reusable UI components
│   ├── ui/                   # Basic UI building blocks
│   └── mocks/                # Mock components for web platform
├── contexts/                 # React Context providers
├── hooks/                    # Custom React hooks
├── util/                     # Utility functions and API clients
└── constants/                # Global constants and configuration
```

## Team Members

- **Li Yanpei** - Frontend Development / Server Deploy (13522245)
- **Li Yuan** - Group Member (13549915)
- **LEE Meng Hin** - Group Member (13799930)
- **Chan Antony** - Group Member (13830346)
- **Sze Tsz Yam** - Group Member (13852523)
- **Poon Chun Him** - Group Member (13810488)

## Academic Context

- **Institution**: Hong Kong Metropolitan University
- **Department**: Department of Computer Engineering
- **Course**: COMP S313F Mobile Application Programming
- **Academic Period**: Spring Term 2025
- **Project Type**: Course Group Project

## License and Terms

This project is intended for non-commercial, academic purposes only. The application is provided under the MIT License with the following considerations:

- Data integrity disclaimer - independent verification recommended for mission-critical applications
- Limited liability clause for system-derived decisions
- All code contributions remain the intellectual property of their respective authors

---

© 2025 Hong Kong Metropolitan University - Department of Computer Engineering
