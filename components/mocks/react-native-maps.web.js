// This file serves as a comprehensive mock implementation of react-native-maps for web platforms
// It exports empty components to prevent errors when trying to import react-native-maps on web

import React from 'react';
import { View } from 'react-native';

// Create mock components with basic structure to avoid errors
const MockMapView = ({ children, style, ...props }) => (
  <View style={style}>
    {/* Render a mock representation of the map for web */}
    <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ textAlign: 'center' }}>Map not available on web</p>
      {children}
    </View>
  </View>
);

const MockMarker = (props) => null;
const MockPolyline = (props) => null;
const MockPolygon = (props) => null;
const MockCircle = (props) => null;
const MockCallout = (props) => null;
const MockOverlay = (props) => null;

// Mock animations module
const mockAnimations = {
  timing: () => ({
    start: (callback) => {
      if (callback) callback({ finished: true });
    }
  })
};

// Mock region change events
const mockOnRegionChange = () => {};
const mockOnRegionChangeComplete = () => {};

// Export a default component that can be imported as the main module
const MapView = MockMapView;
MapView.Marker = MockMarker;
MapView.Polyline = MockPolyline;
MapView.Polygon = MockPolygon;
MapView.Circle = MockCircle;
MapView.Callout = MockCallout;
MapView.Overlay = MockOverlay;
MapView.Animated = MockMapView;

// Export constants
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export const MAP_TYPES = {
  STANDARD: 'standard',
  SATELLITE: 'satellite',
  HYBRID: 'hybrid',
  TERRAIN: 'terrain',
  NONE: 'none'
};

// Export all components
export const Marker = MockMarker;
export const Polyline = MockPolyline;
export const Polygon = MockPolygon;
export const Circle = MockCircle;
export const Callout = MockCallout;
export const Overlay = MockOverlay;
export const Animated = { MapView: MockMapView };

// Export for CommonJS and ES modules
export default MapView;
