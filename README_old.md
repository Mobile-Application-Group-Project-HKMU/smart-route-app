### (tabs)/index
# Home Screen Implementation Analysis

This screen serves as the main landing page of the transportation app, primarily focusing on displaying user favorites and providing navigation to other app sections.

## Core Functionality

1. **Favorites Management**: Displays user's favorite KMB bus routes, bus stops, and MTR stations
2. **Multi-Transit Support**: Handles both bus (KMB) and rail (MTR) transportation systems
3. **Personalized Experience**: Shows content based on saved user preferences

## Implementation Details

### State Management
The component uses several state variables:
- `favoriteRoutes`: Stores user's favorite bus routes
- `favoriteStops`: Stores user's favorite bus stops
- `favoriteMtrStations`: Stores user's favorite MTR stations 
- `loading`: Tracks data loading state

### Data Flow

The `loadFavorites` function:
1. Retrieves saved favorites from local storage
2. Fetches complete data for routes and stops
3. Processes and categorizes data by transport type
4. Updates state variables with the retrieved information

### Key Functions

1. **`loadFavorites()`**: Fetches and processes user favorites
2. **Navigation handlers**:
   - `handleRoutePress()`: Navigates to bus route details
   - `handleStopPress()`: Navigates to bus stop details
   - `handleMtrStationPress()`: Navigates to MTR station details

### UI Components

The interface features:
- Parallax header with title and settings access
- Horizontally scrollable sections for different favorite types
- Different styling for bus routes, bus stops, and MTR stations
- Appropriate loading and empty states

### Internationalization

The screen supports multiple languages through:
- The `useLanguage` hook
- Conditional rendering based on selected language
- Displaying names in English, Traditional Chinese, or Simplified Chinese

### Auto-Refresh Logic

Uses `useFocusEffect` to reload favorites whenever the screen comes into focus, ensuring the content stays current if changes are made elsewhere in the app.




### (tabs)/nearby
### User Experience Flow

1. User sees their favorites organized by category (bus routes, stops, MTR stations)
2. User can tap any favorite to navigate to its detailed view
3. User can access settings or about page from this screen
4. When returning to the screen, data refreshes automatically

### Multi-language Support

- Uses the language context (`useLanguage`) to display content in different languages
- Conditionally renders text in English, Traditional Chinese, or Simplified Chinese

### Visual Design

- Uses a warm color scheme (oranges and browns) for bus items
- Blue colors for MTR-related items
- Cards with icons and clear typography for easy scanning
- Responsive layout with proper spacing

This is a well-structured home screen that provides quick access to the user's favorite transportation options while maintaining a clean and organized interface.

# Nearby Screen Implementation Analysis

This screen helps users find nearby public transportation stops (both bus stops and MTR stations) in Hong Kong. Here's a breakdown of its implementation:

## Core Functionality

1. **Location-based Search**: Uses `expo-location` to get the user's current position
2. **Multi-Transport Support**: Fetches both KMB (bus) and MTR (rail) stops near the user
3. **Interactive Map**: Displays stops and the user's location on a Google Maps integration
4. **Distance Filtering**: Allows searching within 250m, 500m, or 1km radius
5. **Transport Filtering**: Toggles to show/hide buses or MTR stations

## Implementation Details

### State Management
The component uses several state variables to track:
- User's current location
- Nearby stops data
- Loading/error states
- Filter preferences (radius, transport types)

### Data Structure
Both KMB and MTR stops are normalized into a unified `CombinedStop` type that includes:
- Stop ID and names in multiple languages (English, Traditional Chinese, Simplified Chinese)
- Geographic coordinates
- Distance from user
- Transport type/company identifier

### Key Functions

1. **`requestLocationPermission()`**: Handles location permissions and fetches current position
2. **`fetchNearbyStops()`**: Queries both KMB and MTR APIs to find stops within the specified radius
3. **`handleStopPress()`**: Navigates to appropriate detail screen based on stop type
4. **`goToStop()`**: Animates the map to focus on a selected stop

### UI Components

The interface displays:
- Interactive map showing stops and user location
- Distance filters (250m, 500m, 1km buttons)
- Transport type filters (Bus/MTR toggle buttons)
- List of nearby stops sorted by distance
- Different UI states for loading, errors, and initial screen

### Internationalization

The screen supports multiple languages through the `useLanguage` hook, displaying stop names and UI text in the user's preferred language.


### (tabs)/plan
# Route Planning Screen Implementation Analysis

This screen implements a comprehensive journey planning feature that helps users find transportation routes between locations in Hong Kong. It's one of the most complex screens in the app.

## Core Functionality

1. **Location Search**: Users can search for and select origin and destination points from all KMB bus stops and MTR stations
2. **Current Location**: Option to use device's current GPS location as starting point
3. **Multi-Modal Journey Planning**: Generates routes combining walking, buses, and MTR trains
4. **Route Visualization**: Displays routes on a map with different colored paths for each transport type
5. **Step-by-Step Instructions**: Provides detailed journey instructions with distances and transport information

## Implementation Details

### Data Management
The component manages several key data elements:
- All available stops (both bus and MTR) loaded on initialization
- Selected origin and destination locations
- Generated journey options with multiple transport combinations
- Journey step details (walk segments, transit segments)

### Journey Generation Logic

The `generateSampleJourneys()` function creates three different route options:
1. **Bus-only route**: Uses KMB buses (with walking to/from stops)
2. **MTR-only route**: Uses MTR trains (with walking to/from stations)
3. **Combined route**: Uses both bus and MTR with transfers between modes

Each journey consists of "steps" representing segments like:
- Walking to a stop/station
- Taking a bus/train
- Walking between transfers
- Walking to final destination

### Helper Functions

Several utility functions support the route planning:
- `calculateDistance()`: Uses the Haversine formula to calculate distance between coordinates
- `findNearestStop()`: Identifies the closest transit stop to a location
- `formatDistance()`: Converts meters to human-readable format
- `getTransportIcon()` and `getTransportColor()`: UI helpers for consistent styling

### UI Components

The interface is organized into:
1. **Search inputs**: Origin and destination fields with current location option
2. **Search results**: Dropdown showing matching stops when searching
3. **Journey options**: Horizontal list of route alternatives
4. **Map view**: Visual representation of the selected route
5. **Journey steps**: Detailed list of instructions with icons and distances


### (tabs)/transport
# Transport Screen Implementation Analysis

This screen provides a unified interface for browsing and searching public transportation options in Hong Kong. It's a comprehensive solution that handles multiple transport providers in a single view.

## Core Functionality

1. **Multi-Transport Provider Support**: Aggregates data from different companies (KMB, GMB, MTR, etc.)
2. **Dual-Mode Searching**: Toggle between routes and stations
3. **Advanced Filtering**: Filter by company, search text, or route characteristics
4. **Paginated Results**: Handles large datasets with efficient pagination
5. **Company-Specific UI**: Custom rendering for each transport provider

## Implementation Details

### Data Management

The component manages transport data through:
- Parallel data fetching from different APIs (KMB, GMB, MTR)
- Data normalization to a standard format (`TransportRoute` and `TransportStop`)
- Unified filter functions that work across different data types
- Pagination system with configurable `itemsPerPage`

### Filtering Logic

The `applyFilters()` function:
1. First filters by transport company (if not "ALL")
2. Then applies text-based search across route/station properties
3. Handles different search fields based on whether in route or station mode
4. Resets pagination when filters change

### UI Components

The interface provides:
- Search box for text-based filtering
- Mode toggle between routes and stations
- Horizontal scrolling company filter tabs
- Company-specific styling (each with custom colors)
- Custom cards for each transport provider
- Station count statistics when in station mode

### Navigation

The implementation handles different navigation patterns:
- KMB routes go to route details with bound/service type params
- MTR routes navigate to line details
- Station navigation differs between MTR and bus stops

### Visual Styling

The UI uses consistent styling with:
- Color-coded provider tabs
- Custom icons for each transport type
- Consistent card layouts with provider-specific colors
- Clear pagination controls
- Responsive layout that works across screen sizes


### bus/[routeId]
# Bus Route Detail Screen Implementation Analysis

This screen provides comprehensive information about a specific bus route, including stops, map visualization, and real-time location awareness. It's designed to work with multiple transit operators.

## Core Functionality

1. **Detailed Route Information**: Displays route number, direction, and terminal points
2. **Stop Listing**: Shows all stops along the route with sequence information
3. **Interactive Map**: Visualizes the complete route with stop markers
4. **Nearest Stop Detection**: Identifies and highlights the stop closest to user
5. **Favorites Management**: Allows adding/removing routes from favorites
6. **Multi-Company Support**: Handles both KMB and GMB routes with different data structures

## Implementation Details

### Data Loading and Processing

The screen manages two main data flows:
- **KMB Routes**: Fetches route details and stops via KMB API, then merges with stop details
- **GMB Routes**: Dynamically imports GMB utilities and handles region-specific data

The app performs sophisticated data joining operations:
1. Fetches basic route information (terminals, direction)
2. Retrieves sequential stop data for the route
3. Maps stop IDs to full stop details with coordinates
4. Calculates nearest stop based on user location

### Location Integration

The component includes location-aware features:
- Requests location permissions on load
- Determines the stop closest to user's current position
- Highlights this stop in both map and list
- Auto-focuses the map based on user location or entire route

### Map Visualization

Implements an interactive map experience:
- Polyline showing the complete route path
- Markers for each stop with popups showing names
- Custom coloring for the nearest stop
- User location marker
- "Go to stop" functionality to focus the map on specific stops

### Favorites System

Implements a complete favorites management system:
- Checks if route is already in favorites when screen loads
- Toggle function adds/removes from favorites
- Persists changes to local storage
- Provides visual feedback with star icon and alerts

### Internationalization

The component fully supports multiple languages:
- Context-based language selection
- Displays content in user's preferred language
- Helper function (`getLocalizedText`) to select the appropriate text version
- Shows both English and Chinese names when in English mode


### mtr/[stationId]
# MTR Station Screen Implementation Analysis

This screen provides detailed information about an MTR (Mass Transit Railway) station, including real-time train arrival data and location information. It's designed to be a comprehensive reference for transit users.

## Core Functionality

1. **Station Details**: Displays station ID, name, and interchange status
2. **Line Information**: Shows all train lines serving the station with color-coded chips
3. **Real-Time Arrivals**: Lists upcoming train arrivals with destination and timing
4. **Location Visualization**: Displays station on an interactive map
5. **Navigation Integration**: Opens device maps app for directions
6. **Favorites Management**: Allows adding/removing stations from favorites

## Implementation Details

### Data Loading

The component handles several data fetching operations:
- Loads station details from the MTR API
- Fetches real-time train arrivals with direction and platform info
- Checks if the station is in the user's favorites
- Refreshes data automatically when the screen comes into focus

### Favorites System

The screen implements a complete station favorites system:
- Checks favorites status on load
- Provides toggle function to add/remove
- Saves to local storage with proper error handling
- Updates UI instantly to reflect changes

### Mapping and Navigation

Sophisticated location features include:
- Interactive map showing the station location
- Platform-specific navigation implementations (iOS vs Android)
- "Navigate" button that opens the device's default maps application
- URL handling with proper error cases

### Real-Time Data Rendering

The arrival times display is particularly sophisticated:
- Groups arrivals by line and destination
- Formats times in a user-friendly way (e.g., "3 min" or "Arriving")
- Shows platform numbers and any service remarks
- Color-codes each line according to official MTR colors
- Handles edge cases like no service or disruptions

### Internationalization

The component fully supports multiple languages:
- Displays station names in English, Traditional Chinese, or Simplified Chinese
- Formats all times appropriately for the selected language
- Uses translated labels for all UI elements
- Properly handles missing translations for some languages



### mtr/line/[lineId]
# MTR Line Screen Implementation Analysis

This screen provides a detailed view of a specific MTR (Mass Transit Railway) train line in Hong Kong, showing its stations, route path, and interchange information. It's a comprehensive visualization tool for transit users.

## Core Functionality

1. **Line Information Display**: Shows line code, name, and terminal stations
2. **Visual Route Mapping**: Displays the entire line path on an interactive map
3. **Station Listing**: Lists all stations along the selected line in sequence
4. **Interchange Highlighting**: Identifies transfer stations with multiple lines
5. **Navigation to Stations**: Provides direct access to detailed station information

## Implementation Details

### Data Loading

The component loads line-specific data through:
- Fetching line details from the MTR API based on the lineId parameter
- Retrieving all stations and filtering to only those on this line
- Error handling with user-friendly messages and navigation fallback

### Map Visualization

The screen includes a sophisticated map visualization:
- Polyline connecting all stations in sequence with line-specific color
- Custom markers for each station with special styling for interchanges
- Centered view based on the first station of the line
- Platform-specific provider handling (Google Maps on Android)

### Station Rendering

Each station is displayed with:
- Station name in the user's preferred language
- Station code (3-letter identifier)
- Color-coded dot matching the line color
- For interchange stations, chips showing all connecting lines
- Navigation chevron for proceeding to station details

### Styling and Visual Elements

The implementation uses consistent MTR-style theming:
- Official MTR line colors from the `MTR_COLORS` constant
- Special highlighting for interchange stations
- Color-coded header and station dots matching the line color
- Clean, card-based station listing with visual separation

### Internationalization

The screen fully supports multiple languages:
- Uses the language context to determine display language
- Shows line names, station names, and origin/destination in the correct language
- Respects the app's global language setting
- Falls back gracefully when translations are missing

### stop/[stopId]
# Bus Stop Detail Screen Implementation Analysis

This screen provides comprehensive information about a specific bus stop, including real-time arrival data. It's designed to help users monitor upcoming buses and find their location.

## Core Functionality

1. **Real-Time Arrivals**: Displays upcoming bus arrivals with route and timing information
2. **Stop Location**: Shows the exact stop position on an interactive map
3. **Navigation Integration**: Provides directions to the stop via device maps app
4. **Favorites Management**: Allows adding/removing stops from favorites
5. **Auto-Refreshing Data**: Updates arrival times when the screen is viewed

## Implementation Details

### Data Loading and Processing

The component manages three primary data processes:
- Fetches stop details (name, location) on initial load
- Loads real-time arrival estimates with route classifications
- Refreshes data automatically when the screen gains focus

### Real-Time Data Display

The ETA (Estimated Time of Arrival) system:
- Groups arrivals by route number and destination
- Shows multiple upcoming buses for each route
- Displays special remarks or service notices
- Formats times in user-friendly format (e.g., "3 min", "Arriving")
- Handles cases where no arrivals are available

### Navigation Features

Location-oriented functionality includes:
- Interactive map showing the stop's exact position
- Platform-specific navigation integration:
  - Opens Apple Maps on iOS devices
  - Opens Google Maps on Android devices
- Error handling for devices without map support

### Favorites System

The implementation includes a complete favorites management system:
- Loads favorite status from local storage
- Provides toggle to add/remove from favorites
- Updates the UI instantly to reflect changes
- Displays confirmation messages for user actions

### Internationalization

The component fully supports multiple languages:
- Shows stop names in English, Traditional Chinese, or Simplified Chinese
- Dynamically chooses appropriate bus destination text
- Translates all interface elements and messages
- Formats times according to language preferences

### UI Design

The interface features:
- Clean, card-based design for each route
- Visual timeline for arrivals using a vertical line and spacing
- Color-coded route numbers for quick identification
- Header controls for refreshing data and managing favorites
- Direct links to route detail pages
