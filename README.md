# Smart KMB App: A Transportation Solution for Hong Kong

## Table of Contents
- List of Figures
- Abstract
- Introduction
- Methodology
- Features and Functionality
- Testing
- Future Enhancements
- Conclusion
- Appendix

## List of Figures
- Figure 1: Home Screen Layout
- Figure 2: Nearby Screen Map Integration
- Figure 3: Plan Screen Journey Visualization

## Abstract
The Smart KMB App is a React Native application developed with Expo and TypeScript, designed to enhance public transportation in Hong Kong. It integrates data from KMB, GMB, and MTR systems, offering real-time arrivals, journey planning, and location-based services across eight key screens. This report examines the app’s screen logic, shared implementation patterns, and addresses its background, challenges, and standout features.

## Introduction
The Smart KMB App provides a unified platform for navigating Hong Kong’s public transit, leveraging React Native for cross-platform functionality, Expo for streamlined development, and TypeScript for robust code quality. It caters to users by offering personalized favorites, multi-modal journey planning, and real-time transit updates, addressing the diverse needs of urban commuters.

## Methodology
The app adopts Expo’s managed workflow for rapid development and deployment across iOS and Android. TypeScript ensures type safety for API responses, state, and props, reducing errors. A modular architecture organizes each screen with independent logic, utilizing libraries like `expo-location` and `react-native-maps` for location and visualization features.

## Features and Functionality
The app includes the following screens with their paths, logic, and implementations:

1. **Home Screen (`(tabs)/index`)**
   - **Logic**: Displays user favorites (bus routes, stops, MTR stations) with multi-language support and auto-refresh on focus.
   - **Implementation**: Uses state for favorites and loading, fetches data from local storage, and navigates to detail screens via handlers.

2. **Nearby Screen (`(tabs)/nearby`)**
   - **Logic**: Locates nearby stops using user position, filters by distance and type, and shows results on a map.
   - **Implementation**: Integrates `expo-location`, fetches KMB/MTR API data, and normalizes it into a `CombinedStop` type.

3. **Plan Screen (`(tabs)/plan`)**
   - **Logic**: Plans multi-modal journeys (walking, bus, MTR) with route options and map visualization.
   - **Implementation**: Manages stop data, generates journeys using distance calculations, and displays step-by-step instructions.

4. **Transport Screen (`(tabs)/transport`)**
   - **Logic**: Offers search across transit providers with filtering and pagination.
   - **Implementation**: Normalizes API data, applies filters, and customizes UI per provider.

5. **Bus Route Detail Screen (`bus/[routeId]`)**
   - **Logic**: Shows route details, stops, and nearest stop with favorites management.
   - **Implementation**: Joins route and stop data, uses location services, and renders an interactive map.

6. **MTR Station Screen (`mtr/[stationId]`)**
   - **Logic**: Displays station info, real-time arrivals, and navigation options.
   - **Implementation**: Fetches MTR data, manages favorites, and integrates device maps.

7. **MTR Line Screen (`mtr/line/[lineId]`)**
   - **Logic**: Visualizes an MTR line’s stations and route path.
   - **Implementation**: Filters station data, uses line-specific styling, and maps the route.

8. **Bus Stop Detail Screen (`stop/[stopId]`)**
   - **Logic**: Provides stop details, real-time arrivals, and navigation.
   - **Implementation**: Loads stop and ETA data, supports favorites, and integrates maps.

### Commonalities
- **State Management**: All screens use state for data and UI updates.
- **Data Fetching**: APIs or local storage provide dynamic content.
- **Internationalization**: Multi-language support via `useLanguage`.
- **Navigation**: Consistent routing to detail screens.
- **Favorites**: Shared system with local storage persistence.
- **Location Services**: Used in Nearby, Bus Route, and Stop screens.
- **Map Integration**: Interactive maps in multiple screens.
- **Real-Time Data**: Featured in MTR Station and Bus Stop screens.
- **UI Consistency**: Reusable components like cards and buttons.

### Background and Challenges
- **Background**: A transportation app for Hong Kong, integrating bus (KMB, GMB) and rail (MTR) services.
- **Challenges**: Unifying diverse API data, ensuring real-time accuracy, managing location permissions, and maintaining performance across screens.

### Significant Features
- Multi-modal journey planning.
- Real-time bus and train arrivals.
- Interactive maps for routes and stops.
- Personalized favorites system.
- Multi-language support.
- Device map navigation integration.

## Testing
Unit tests with Jest validate component logic and functions, while manual end-to-end testing ensures a seamless user experience across devices. Edge cases like API failures and permission denials are addressed.

## Future Enhancements
Future updates could include additional transit operators, real-time traffic integration for journey planning, performance optimizations for large datasets, and enhanced accessibility features.

## Conclusion
The Smart KMB App delivers a robust, user-centric transportation solution, effectively integrating Hong Kong’s transit systems. Its modular design and modern tech stack ensure scalability and a high-quality user experience.

## Appendix
- **Dependencies**: See `package.json` (e.g., `expo`, `react-native-maps`).
- **Code Snippets**: Available in the project repository.