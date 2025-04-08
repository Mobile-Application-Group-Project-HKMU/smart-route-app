# Smart Route App: A React Native Expo Transportation Solution

---

## Table of Contents

1. List of Figures
2. Abstract
3. Introduction
4. Methodology
5. Features and Functionality
6. Future Enhancements
7. Appendix

---

## List of Figures

- Figure 1: App Screen Paths
- Figure 2: Technology Stack

---

## Abstract

The Smart Route App is a cross-platform mobile application built with React Native, Expo, and TypeScript, designed to streamline public transportation in Hong Kong. It integrates data from providers like KMB (bus) and MTR (rail), offering features such as real-time arrivals, journey planning, and location-based services. The app addresses the complexity of Hong Kong’s transit system by providing a unified, multilingual interface, enhancing accessibility for both locals and tourists.

---

## Introduction

Hong Kong’s public transportation system, comprising buses (KMB, GMB) and rail (MTR), is extensive yet intricate. Navigating this network poses challenges, particularly for tourists and occasional users. The Smart Route App aims to simplify this experience by consolidating transit information into a single, user-friendly platform. Built with modern technologies, it tackles issues like real-time tracking and multi-modal route planning while supporting multiple languages.

---

## Methodology

The app leverages **React Native** and **Expo** for cross-platform development, ensuring compatibility with iOS and Android. **TypeScript** enhances code reliability through static typing. Key dependencies from `package.json` include:

- **React Navigation** (`@react-navigation/native`, `@react-navigation/bottom-tabs`): Manages screen navigation.
- **Expo Location** (`expo-location`): Provides GPS functionality.
- **React Native Maps** (`react-native-maps`): Enables map integration.
- **Axios** (`axios`): Handles API requests.
- **Async Storage** (`@react-native-async-storage/async-storage`): Stores user preferences.

The app uses a tab-based structure with dynamic routes, managed via `expo-router`. State is handled with React hooks, and internationalization is implemented through a language context.

---

## Features and Functionality

### Paths

The app includes the following screens:

1. `(tabs)/index` - Home Screen
2. `(tabs)/nearby` - Nearby Screen
3. `(tabs)/plan` - Route Planning Screen
4. `(tabs)/transport` - Transport Screen
5. `bus/[routeId]` - Bus Route Detail Screen
6. `mtr/[stationId]` - MTR Station Screen
7. `mtr/line/[lineId]` - MTR Line Screen
8. `stop/[stopId]` - Bus Stop Detail Screen

### Screen Logic and Implementation

1. **Home Screen (`(tabs)/index`)**

   - **Logic**: Displays user favorites (bus routes, stops, MTR stations); auto-refreshes on focus.
   - **Implementation**: Uses state for favorites and loading; fetches data from local storage; supports navigation and multi-language UI.

2. **Nearby Screen (`(tabs)/nearby`)**

   - **Logic**: Finds nearby stops using location services; filters by radius and type.
   - **Implementation**: Integrates `expo-location` and maps; fetches stops via APIs; displays list and map views.

3. **Route Planning Screen (`(tabs)/plan`)**

   - **Logic**: Plans multi-modal journeys (bus, MTR, walking) between locations.
   - **Implementation**: Uses search inputs, distance calculations, and map visualization; generates route options.

4. **Transport Screen (`(tabs)/transport`)**

   - **Logic**: Aggregates and filters transport options from multiple providers.
   - **Implementation**: Fetches data from APIs; supports pagination and custom UI per provider.

5. **Bus Route Detail Screen (`bus/[routeId]`)**

   - **Logic**: Shows route details, stops, and nearest stop detection.
   - **Implementation**: Fetches route data; integrates maps and location; manages favorites.

6. **MTR Station Screen (`mtr/[stationId]`)**

   - **Logic**: Displays station info, real-time arrivals, and navigation options.
   - **Implementation**: Uses MTR API for data; integrates maps and favorites.

7. **MTR Line Screen (`mtr/line/[lineId]`)**

   - **Logic**: Visualizes an MTR line with stations and interchanges.
   - **Implementation**: Fetches line data; uses custom map markers and official colors.

8. **Bus Stop Detail Screen (`stop/[stopId]`)**
   - **Logic**: Provides stop details and real-time bus arrivals.
   - **Implementation**: Fetches ETA data; integrates maps and navigation; supports favorites.

### Common Points

- **Data Fetching**: APIs and local storage across all screens.
- **State Management**: React hooks for dynamic updates.
- **Navigation**: React Navigation for seamless transitions.
- **Internationalization**: Multi-language support via context.
- **Map Integration**: Visualizes routes and locations.
- **Location Services**: Enhances context-awareness.
- **Favorites Management**: Consistent save/remove functionality.
- **Real-Time Data**: Updates for arrivals where applicable.
- **Custom UI**: Provider-specific styling.

### Background and Problems

Hong Kong’s transit system is diverse, with multiple operators and languages, creating navigation difficulties. The app unifies this information, solving issues like fragmented data access and language barriers.

### Main Features

1. **Unified Interface**: Combines KMB, GMB, and MTR data.
2. **Real-Time Updates**: Tracks bus and train arrivals.
3. **Journey Planning**: Offers multi-modal route options.
4. **Location Awareness**: Highlights nearby stops.
5. **Favorites**: Saves user preferences.
6. **Interactive Maps**: Visualizes transit paths.
7. **Multilingual**: Supports English and Chinese.

---

## Future Enhancements

- **More Providers**: Add ferries or trams.
- **Fare Estimates**: Calculate journey costs.
- **Offline Access**: Cache data for poor connectivity.
- **Accessibility**: Include voice or high-contrast modes.

---

## Appendix

### Figure 1: App Screen Paths

```plaintext
Tabs: Home → Nearby → Plan → Transport
Dynamic: Bus/[routeId] → MTR/[stationId] → MTR/Line/[lineId] → Stop/[stopId]
```

### Figure 2: Technology Stack

- **Core**: React Native, Expo, TypeScript
- **Navigation**: React Navigation
- **Location**: Expo Location
- **Maps**: React Native Maps
- **Storage**: Async Storage
- **API**: Axios

### Key Dependencies

- `expo-location`: Location services
- `react-native-maps`: Map rendering
- `@react-navigation/*`: Navigation framework
