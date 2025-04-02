# Smart KMB App

## Group Project for COMP S313F Mobile Application Programming

### Hong Kong Metropolitan University - Spring Term 2025

---

## Team Members

- Li Yanpei (s13522245) - Frontend Development / Server Deploy
- Chan Antony (s13830346) - Group Member
- Lee Meng Hin (s13799930) - Group Member
- Sze Tse Yam (s13852523) - Group Member
- Li Yuan (s13549915) - Group Member
- Poon Chun Him (s13810488) - Group Member

---

## Table of Contents

- [Abstract](#abstract)
- [Introduction](#introduction)
- [Methodology](#methodology)
- [Features and Functionality](#features-and-functionality)
- [Testing](#testing)
- [Future Enhancement](#future-enhancement)
- [Conclusion](#conclusion)
- [Appendix](#appendix)

---

## Abstract

Smart KMB App is a comprehensive mobile application designed to enhance the public transportation experience in Hong Kong. This app integrates real-time data from various transportation services including KMB bus routes, MTR lines, and other public transport options. It offers users a unified platform to access route information, check arrival times, plan journeys, and find nearby transportation stops.

---

## Introduction

Public transportation in Hong Kong is extensive and efficient, but navigating the complex network of buses, trains, and ferries can be challenging for both residents and visitors. The Smart KMB App addresses this challenge by providing users with a user-friendly interface to access real-time information about public transportation services.

Our application focuses on delivering accurate, timely information while offering intuitive navigation and a seamless user experience across different transportation modes. By integrating data from multiple transit providers, we aim to simplify journey planning and improve the overall public transport experience.

---

## Methodology

The Smart KMB App is built using the following technologies:

- **Frontend:** React Expo 5 with Application Routing
- **Language:** TypeScript
- **State Management:** React Context API
- **Version Control:** Git
- **APIs:** Integration with Hong Kong public transportation APIs
- **UI Components:** Custom components with responsive design
- **Localization:** Multi-language support (English, Traditional Chinese, Simplified Chinese)

Our development process followed an agile methodology, with regular sprints and iterative improvements based on user feedback and testing results.

---

## Features and Functionality

### Main Screens

#### Home Screen

- Displays favorite routes, stops, and MTR stations
- Quick access to recently viewed routes
- One-tap navigation to nearby stops

#### Transport Screen

- Comprehensive listing of bus routes, MTR lines, and other transport options
- Search functionality for finding specific routes
- Filtering by transport type

#### Journey Planner

- Point-to-point journey planning
- Multiple route options with different transport modes
- Walking directions between stops
- Time and distance estimates

#### Nearby Stops

- Location-based discovery of nearby bus stops and MTR stations
- Real-time distance information
- Map view of surrounding transport options

### Transport Information

#### Bus Routes

- Detailed route information including stops, direction, and frequency
- Real-time ETA for upcoming buses
- Route maps with stop indicators

#### MTR Stations

- Station details including exits, facilities, and interchange information
- Real-time train arrival information
- Line status updates

---

## Testing

Our testing strategy included:

- Unit testing of core components
- Integration testing of API calls and data processing
- User acceptance testing across different devices
- Performance testing for responsiveness and load times
- Localization testing for all supported languages

---

## Future Enhancement

Planned future enhancements include:

- Fare calculation for journeys
- Push notifications for service updates
- Offline mode for basic functionality
- Personalized alerts for favorite routes
- Integration with payment systems
- Accessibility improvements

---

## Conclusion

The Smart KMB App successfully addresses the need for a unified, user-friendly public transportation application in Hong Kong. By combining real-time data, intuitive navigation, and comprehensive coverage of transport options, the app provides significant value to daily commuters and visitors alike.

The project demonstrates effective implementation of modern mobile development practices, with a focus on performance, reliability, and user experience. Through continuous iteration and user feedback, we have developed an application that simplifies the complexities of Hong Kong's public transportation system.

---

## Appendix

### App Structure

```
- Main page
  - /(tabs)/index
  - /(tabs)/transport
  - /(tabs)/plan
  - /(tabs)/nearby
- Transport pages
  - /stop/[stopId]
  - /bus/[routeId]
  - /mtr/line/[lineId]
  - /mtr/[stationId]
- Settings page
  - /settings
- About page
  - /about
```

### Technical Stack

- React Native/Expo
- TypeScript
- Expo Router for navigation
- React Native Maps for mapping features
- AsyncStorage for local data persistence
- Custom UI components with Themed context
- React Native Reanimated for animations
