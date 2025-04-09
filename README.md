# Smart KMB App

A comprehensive mobile application for Hong Kong's transportation system, providing real-time information for KMB buses and MTR trains, route planning, nearby stops, and achievements tracking.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Important Note: Web Support](#important-note-web-support)
- [Technical Architecture](#technical-architecture)
- [Screen Implementations](#screen-implementations)
  - [Home Screen](#home-screen)
  - [Transport Screen](#transport-screen)
  - [Route Planning Screen](#route-planning-screen)
  - [Nearby Screen](#nearby-screen)
  - [Bus Route Detail Screen](#bus-route-detail-screen)
  - [MTR Station Screen](#mtr-station-screen)
  - [MTR Line Screen](#mtr-line-screen)
  - [Achievements System](#achievements-system)
- [Contributors](#contributors)

## Features

- **Real-time transit data** for KMB buses and MTR trains
- **Multi-language support** (English, Traditional Chinese, Simplified Chinese)
- **Journey planning** with multi-modal transportation options
- **Location-based services** to find nearby bus stops and MTR stations
- **Favorites system** to save frequently used routes and stops
- **Achievements system** to track your transit usage
- **Weather-aware route planning** that adapts to current conditions
- **Interactive maps** for all transportation routes

## Prerequisites

- Node.js (LTS version)
- Yarn package manager
- iOS or Android development environment
- Expo CLI

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/smart-kmb-app.git
cd smart-kmb-app
```

2. Install dependencies using Yarn (npm is not recommended for this project):

```bash
yarn install
```

3. Setup environment (if needed):

```bash
yarn expo prebuild --platform all --clean
```

## Running the App

### Development Mode

Start the development server:

```bash
yarn start
```

Run on specific platforms:

```bash
# For iOS
yarn ios

# For Android
yarn android
```

### Building for Production

To create a production build:

```bash
# Build for all platforms
yarn build

# Build APK for Android testing
yarn apk
```

## Important Note: Web Support

**This application does NOT support web browsers** due to several platform-specific dependencies:

- Native map integration using `react-native-maps`
- Location services via `expo-location`
- Platform-specific navigation features

The app is designed exclusively for iOS and Android mobile devices. Attempting to run in web browsers will result in compilation errors or missing functionality.

## Technical Architecture

- **Frontend Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React Hooks for local state
- **Storage**: AsyncStorage for persistent data
- **Maps**: React Native Maps with Google Maps integration
- **Styling**: StyleSheet for component-specific styling
- **Internationalization**: Custom context-based language system
- **APIs**: Integration with KMB and MTR data services

## Screen Implementations

### Home Screen

**File:** `app/(tabs)/index.tsx`

**Functionality:**
- Displays user's favorite bus routes, stops, and MTR stations
- Implements auto-refresh when the screen comes into focus
- Uses horizontal scroll lists for each category of favorites
- Provides quick navigation to settings and achievements

**Implementation Details:**
- Uses `useFocusEffect` to reload favorites when the screen becomes active
- Retrieves favorites from AsyncStorage using `getFromLocalStorage`
- Displays different UI elements based on the favorite type (bus route/stop/MTR station)
- Handles proper localization of names based on the selected language

### Transport Screen

**File:** `app/(tabs)/transport.tsx`

**Functionality:**
- Allows browsing and filtering of transportation routes and stations
- Supports multiple transportation companies (KMB, CTB, MTR, etc.)
- Provides search functionality for finding specific routes/stations
- Implements pagination for efficient data loading

**Implementation Details:**
- Fetches transportation data from different APIs on component mount
- Uses state management to handle filtering and searching
- Implements tabs for switching between routes and stations views
- Provides transport company-specific styling for visual distinction
- Handles navigation to appropriate detail screens based on selection

### Route Planning Screen

**File:** `app/(tabs)/plan.tsx`

**Functionality:**
- Allows users to plan journeys between two locations
- Supports searching for bus stops and MTR stations as origin/destination
- Offers option to use current location as starting point
- Generates multiple route options with different transportation modes
- Displays journey details with step-by-step instructions
- Integrates with weather data to suggest optimal routes

**Implementation Details:**
- Uses `expo-location` to get user's current position
- Implements search functionality for finding stops/stations
- Generates sample journeys with bus, MTR, and combined options
- Calculates distances and travel times for each journey segment
- Renders an interactive map showing the selected route
- Adjusts recommendations based on weather conditions

### Nearby Screen

**File:** `app/(tabs)/nearby.tsx`

**Functionality:**
- Finds transit stops near the user's current location
- Allows filtering by distance (250m, 500m, 1km)
- Supports filtering by transportation type (Bus/MTR)
- Displays results on an interactive map and in a list
- Shows distance to each stop from current location

**Implementation Details:**
- Requests location permissions using `expo-location`
- Fetches nearby stops from both KMB and MTR APIs
- Combines and normalizes data into a unified format
- Renders results on a map with custom markers for each transport type
- Provides UI controls for adjusting search radius and filters
- Allows navigation to stop details with a single tap

### Bus Route Detail Screen

**File:** `app/bus/[routeId].tsx`

**Functionality:**
- Displays detailed information about a specific bus route
- Shows list of all stops along the route in sequence
- Visualizes the route on an interactive map
- Highlights the stop nearest to user's current location
- Provides quick navigation to stop details
- Allows adding/removing routes from favorites

**Implementation Details:**
- Uses dynamic routing with parameters to load specific route data
- Fetches route details including stops, origin, and destination
- Renders a polyline on the map connecting all stops
- Uses location services to find the nearest stop to user
- Implements favorite functionality with local storage
- Supports both KMB and GMB bus companies with different data structures

### MTR Station Screen

**File:** `app/mtr/[stationId].tsx`

**Functionality:**
- Displays detailed information about an MTR station
- Shows real-time train arrival information by line and platform
- Displays station location on an interactive map
- Provides navigation options to the station
- Shows crowdedness predictions for upcoming trains
- Allows adding/removing stations from favorites

**Implementation Details:**
- Fetches station details and real-time arrival data
- Classifies ETAs by line and destination for organized display
- Implements favorites functionality with AsyncStorage
- Provides platform-specific map navigation (iOS vs Android)
- Integrates with crowd prediction system for enhanced information
- Uses focus effects to refresh data when the screen is viewed

### MTR Line Screen

**File:** `app/mtr/line/[lineId].tsx`

**Functionality:**
- Displays detailed information about an MTR train line
- Shows all stations along the selected line in sequence
- Visualizes the line on a map with colored polyline
- Highlights interchange stations with multiple lines
- Provides navigation to individual station details

**Implementation Details:**
- Fetches line data and all stations on the line
- Renders a color-coded map view showing the entire line
- Lists all stations with proper sequencing
- Shows interchange information for stations connecting multiple lines
- Implements proper localization for station names based on language setting
- Uses the official MTR color scheme for line identification

### Achievements System

**File:** `app/achievements.tsx`

**Functionality:**
- Displays user's transportation achievements
- Shows progress toward various transit-related goals
- Categorizes achievements by type
- Calculates completion percentages and points

**Implementation Details:**
- Retrieves user achievement data from local storage
- Renders achievements with visual indicators of progress
- Implements filtering by achievement category
- Displays achievement unlocking dates for completed items
- Calculates statistics like total points and completion percentage
- Uses color coding to distinguish achievement levels (bronze, silver, gold)

## Contributors

- Li Yanpei - Frontend Development / Server Deploy
- Li Yuan - Group Member
- LEE Meng Hin - Group Member
- Chan Antony - Group Member
- Sze Tsz Yam - Group Member
- Poon Chun Him - Group Member

## License

This project is licensed under the MIT License. See the LICENSE file for details.