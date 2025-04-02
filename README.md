# Smart KMB App

## Table of Contents

- [List of Figures](#list-of-figures)
- [Abstract](#abstract)
- [Introduction](#introduction)
  - [Project Description](#project-description)
- [Methodology](#methodology)
  - [Main Routes](#main-routes)
  - [Technology Stack](#technology-stack)
  - [Architecture](#architecture)
- [Features and Functionality](#features-and-functionality)
  - [Real-time Transportation Information](#real-time-transportation-information)
  - [Route Planning](#route-planning)
  - [Nearby Stops](#nearby-stops)
  - [Favorites System](#favorites-system)
  - [Multi-language Support](#multi-language-support)
- [Testing](#testing)
  - [Platform Testing](#platform-testing)
  - [Performance Testing](#performance-testing)
- [Future Enhancements](#future-enhancements)
- [Conclusion](#conclusion)
- [Appendix](#appendix)
  - [Team Members](#team-members)
  - [Installation Instructions](#installation-instructions)

## List of Figures

_(Include screenshots of key app screens here)_

## Abstract

This report presents the objectives, design, implementation, functions, and results of our project, Smart KMB. The application serves as a comprehensive public transportation tool for Hong Kong residents and visitors, providing real-time information on bus and MTR services, route planning capabilities, and location-based features. Our solution addresses the need for an integrated transportation app that simplifies the transit experience with an intuitive interface and robust functionality across multiple platforms.

## Introduction

### Project Description

Our project, Smart KMB, is a cross-platform public transportation app built with React Native (Expo) and TypeScript. It provides location-based services to help users find nearby bus stops, view real-time arrival updates, and navigate between stops. The app integrates Google Maps (Android) and Apple Maps (iOS), supports multiple languages (English, Traditional Chinese, and Simplified Chinese), and follows a modular architecture with a focus on user experience, performance, and accessibility.

## Methodology

### Main Routes

The application follows a structured routing system using Expo Router:

**Main Tabs**

- `/(tabs)/index` - Home page with favorites and quick access features
- `/(tabs)/transport` - Transport options and routes directory
- `/(tabs)/plan` - Journey planning interface
- `/(tabs)/nearby` - Location-based nearby stops discovery

**Transport Detail Pages**

- `/stop/[stopId]` - Information about specific bus stops
- `/bus/[routeId]` - Bus route details and stops
- `/mtr/[stationId]` - MTR station information and arrivals
- `/mtr/line/[lineId]` - MTR line overview with stations

**App Information**

- `/settings` - User preferences and language settings
- `/about` - Project information and team details

### Technology Stack

- **Frontend Framework**: React Native with Expo
- **Programming Language**: TypeScript
- **State Management**: React Context API
- **Navigation**: Expo Router
- **Mapping Services**: React Native Maps (with platform-specific providers)
- **Localization**: Custom translation system
- **Data Storage**: AsyncStorage for favorites and preferences

### Architecture

The application follows a modular architecture with:

- Component-based UI structure
- Separation of concerns between data fetching, business logic, and presentation
- Platform-specific adaptations for web, iOS, and Android
- Utility-based approach for common functions

## Features and Functionality

### Real-time Transportation Information

- KMB bus routes and stops directory
- MTR stations and lines information
- Real-time arrival estimates for both bus and MTR services
- Service status updates and remarks

### Route Planning

- Multi-modal journey planning (bus, MTR, walking)
- Distance and duration estimates
- Step-by-step journey guidance
- Location-based origin and destination selection
- Interactive map visualization of routes

### Nearby Stops

- Geolocation-based stop discovery
- Distance calculation to nearby transportation options
- Direct navigation to stop details
- Map visualization of surrounding transit infrastructure

### Favorites System

- Save frequently used routes for quick access
- Store favorite bus stops and MTR stations
- Personalized home screen with favorite items
- One-tap navigation to transport details

### Multi-language Support

- Complete English, Traditional Chinese, and Simplified Chinese localization
- Dynamic language switching without app restart
- Proper handling of locale-specific formatting

## Testing

_(Note: Add your specific testing approach and results here)_

### Platform Testing

- iOS performance and compatibility verification
- Android device testing across multiple screen sizes
- Web platform adaptations and fallbacks

### Performance Testing

- Startup time optimization
- API response handling and error resilience
- Memory usage monitoring
- Battery consumption analysis

## Future Enhancements

- Integration with additional transportation providers
- Real-time vehicle tracking on map
- Fare calculation and payment integration
- Push notifications for service disruptions
- Accessibility improvements for users with disabilities
- Offline mode for core functionality

## Conclusion

The Smart KMB app successfully delivers a comprehensive transportation solution for Hong Kong residents and visitors. By combining real-time data, intuitive journey planning, and location-based services in a user-friendly interface, the application addresses key pain points in public transportation usage. The project demonstrates effective implementation of modern mobile development practices and technologies while providing genuine utility to users.

## Appendix

### Team Members

- Li Yanpei (13522245) - Frontend Development / Server Deploy
- Li Yuan (13549915) - Group Member
- LEE Meng Hin (13799930) - Group Member
- Chan Antony (13830346) - Group Member
- Sze Tsz Yam (13852523) - Group Member
- Poon Chun Him (13810488) - Group Member

### Installation Instructions

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd smart-kmb-app

# Install dependencies
npm install

# Start the development server
npm start
```

For building native applications:

```bash
# For Android
npm run android

# For iOS
npm run ios

# For web
npm run web
```
