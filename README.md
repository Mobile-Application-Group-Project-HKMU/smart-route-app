# Smart KMB App - Hong Kong Transportation Guide

A comprehensive mobile application for navigating Hong Kong's public transportation system, featuring real-time bus and MTR information, journey planning, and location-based services.

## Features

- **Multi-transport Support**: Integrated KMB bus and MTR railway information
- **Real-time Arrivals**: Up-to-date estimated arrival times
- **Route Planning**: Plan journeys with combined transportation modes
- **Location Services**: Find nearby stops and stations
- **Favorites System**: Save frequently used routes and stops
- **Achievements System**: Gamified travel experience
- **Multi-language Support**: English, Traditional Chinese, and Simplified Chinese

## Installation Requirements

- Node.js (v14.0 or newer)
- Yarn (v1.22 or newer)
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Physical iOS/Android device (for testing)

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Mobile-Application-Group-Project-HKMU/smart-route-app.git
cd smart-kmb-app
```

2. Install dependencies (using Yarn exclusively):

```bash
yarn install
```

> **Important**: This project requires Yarn package manager. NPM is not supported and may cause dependency conflicts.

## Running the Application

### Development Mode

Start the development server:

```bash
yarn start
```

### iOS Simulator:

```bash
yarn ios
```

### Android Emulator:

```bash
yarn android
```

### Building for Production:

```bash
yarn build
```

### Build APK for Testing:

```bash
yarn apk
```

> **Important Note**: Web browser support is **NOT available** for this application due to platform-specific native module dependencies, including mapping features and location services. The app must be run on physical devices or simulators.

## Project Structure

```
smart-kmb-app/
├── app/                   # Main application screens
│   ├── (tabs)/           # Tab-based navigation screens
│   ├── bus/              # Bus route screens
│   ├── mtr/              # MTR station screens
│   └── achievements.tsx  # Achievements screen
├── components/           # Reusable UI components
├── constants/            # App constants and theme definitions
├── contexts/             # React contexts (language, etc.)
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── translations/         # Localization files
└── util/                 # Utility functions and API clients
```

## Implementation Details

### Tab-based Navigation

The app uses Expo Router's tab-based navigation system defined in `app/(tabs)/_layout.tsx`, providing a consistent bottom tab interface for the main sections of the application:

```typescript
// Main tab sections
<Tabs.Screen name="index" options={{ title: t("tabs.home") }} />
<Tabs.Screen name="transport" options={{ title: t("tabs.routes") }} />
<Tabs.Screen name="plan" options={{ title: t("tabs.plan") }} />
<Tabs.Screen name="nearby" options={{ title: t("tabs.nearby") }} />
```

### Home Screen (`app/(tabs)/index.tsx`)

The home screen serves as the main entry point, displaying:

1. **Favorite Management**:

   - Loads user favorites (routes, stops, MTR stations) from AsyncStorage
   - Uses `useFocusEffect` to refresh data when navigating back to the screen
   - Separates MTR and KMB items for categorized display

2. **UI Components**:

   - Scrollable horizontal lists for each favorite category
   - Color-coded cards with dynamic information based on the data type
   - Quick access buttons for achievements and app information

3. **Internationalization**:
   - Uses language context to display content in the user's preferred language
   - Handles conditional rendering for different language options

### Transport Screen (`app/(tabs)/transport.tsx`)

This screen provides a comprehensive listing of all public transportation options:

1. **Data Management**:

   - Fetches and combines data from multiple transit providers (KMB, MTR)
   - Implements pagination for handling large datasets efficiently
   - Supports both route and station browsing modes

2. **Filtering System**:

   - Company filter tabs with visual indicators
   - Text-based search across multiple fields (route numbers, origins, destinations)
   - Filter persistence during mode switching

3. **Dynamic Rendering**:
   - Different card styles based on transport company
   - Adaptive UI for different transport types
   - Consistent navigation pattern to appropriate detail screens

### Route Planning Screen (`app/(tabs)/plan.tsx`)

The route planning screen enables users to find transportation routes between locations:

1. **Location Selection**:

   - Search interface for origin and destination points
   - Current location integration using `expo-location`
   - Interactive search results with stop/station details

2. **Journey Generation**:

   - Creates multiple route options combining different transport modes
   - Calculates walking distances, transit times, and transfers
   - Weather-aware routing that adapts to current conditions

3. **Route Visualization**:

   - Interactive map showing the complete journey
   - Color-coded path segments for different transport types
   - Step-by-step instructions with distance and time estimates

4. **Weather Integration**:
   - Fetches real-time weather data for the user's location
   - Adjusts route recommendations based on weather conditions
   - Provides weather protection scores for different journey options

### Nearby Screen (`app/(tabs)/nearby.tsx`)

The nearby screen finds transportation options close to the user's current location:

1. **Location Services**:

   - Permission handling for location access
   - High-precision location tracking
   - Distance calculation for nearby stops

2. **Multi-Transport Integration**:

   - Unified data structure for both KMB and MTR stops
   - Combined display with type indicators
   - Transport-specific filtering options

3. **Map Visualization**:

   - Interactive map showing all nearby stops
   - Custom markers for different transport types
   - Focus controls to zoom to specific stops

4. **Distance Filtering**:
   - Adjustable search radius (250m, 500m, 1km)
   - Dynamic updating based on selection
   - Distance-based sorting of results

### Bus Route Detail Screen (`app/bus/[routeId].tsx`)

This screen provides comprehensive information about a specific bus route:

1. **Dynamic Route Loading**:

   - Parses URL parameters for route ID, bound, and service type
   - Supports both KMB and GMB routes with different data structures
   - Handles inbound/outbound directions separately

2. **Location Awareness**:

   - Determines the nearest stop to user's current position
   - Highlights this stop in both the map and list
   - Provides quick navigation to the closest stop

3. **Map Visualization**:

   - Polyline showing the complete route path
   - Markers for each stop with stop names and sequence numbers
   - Current location marker for reference

4. **Journey Recording**:
   - Integration with achievement system
   - Records route usage for tracking progress
   - Provides navigation to achievements when unlocked

### MTR Station Screen (`app/mtr/[stationId].tsx`)

This screen displays detailed information about an MTR station:

1. **Real-time Arrivals**:

   - Fetches and processes ETA data from MTR API
   - Classifies and groups arrivals by line and direction
   - Displays platform information and service remarks

2. **Station Information**:

   - Shows station ID and name in multiple languages
   - Displays all train lines serving the station with color coding
   - Identifies interchange stations with special indicators

3. **Map Integration**:

   - Shows exact station location on an interactive map
   - Platform-specific map links (Google Maps on Android, Apple Maps on iOS)
   - Navigation button to get directions to the station

4. **Crowd Prediction**:
   - Integrates with settings to show/hide crowd indicators
   - Predicts crowdedness levels based on time and historical data
   - Visual indicators for different crowd levels

### MTR Line Screen (`app/mtr/line/[lineId].tsx`)

This screen shows comprehensive information about an MTR train line:

1. **Line Information**:

   - Displays line code, name, and terminal stations
   - Color coding based on official MTR line colors
   - Origin and destination information in multiple languages

2. **Station Listing**:

   - Shows all stations along the selected line in sequence
   - Interchange stations marked with connecting lines
   - Navigation to detailed station information

3. **Map Visualization**:
   - Interactive map showing the line path
   - Color-coded polyline matching the line's official color
   - Special markers for interchange stations

### Bus Stop Detail Screen (`app/stop/[stopId].tsx`)

This screen provides information about a specific bus stop:

1. **Real-time Arrivals**:

   - Fetches and displays estimated arrival times for all routes
   - Groups arrivals by route and destination
   - Shows multiple upcoming buses with timing information

2. **Location Features**:

   - Interactive map showing the stop's exact position
   - Platform-specific navigation integration
   - Distance calculation from current location

3. **Favorites Management**:
   - Local storage integration for saving favorite stops
   - Toggle functionality for adding/removing favorites
   - Visual feedback for favorite status

### Achievements Screen (`app/achievements.tsx`)

The achievements screen implements a gamification system for public transport usage:

1. **Achievement Tracking**:

   - Loads user progress from local storage
   - Categorizes achievements by type (journey count, transport variety, etc.)
   - Calculates completion percentages and total points

2. **UI Implementation**:

   - Category tabs for filtering different achievement types
   - Progress bars showing completion status
   - Visual indicators for unlocked achievements

3. **Achievement Card Design**:
   - Color coding based on achievement level (bronze, silver, gold)
   - Icon representation of achievement type
   - Progress tracking with current/required values

### Settings Screen (`app/settings.tsx`)

This screen allows users to customize app behavior:

1. **Language Selection**:

   - Toggle between English, Traditional Chinese, and Simplified Chinese
   - Real-time UI updates when language changes
   - Persistent storage of language preference

2. **Feature Toggles**:

   - Crowd prediction enable/disable option
   - Visual toggle switches with state indicators
   - Settings persistence across app restarts

3. **UI Design**:
   - Clean, sectioned layout for different setting categories
   - Visual feedback for active settings
   - Back navigation with state preservation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any questions or issues, please open an issue on the GitHub repository.
