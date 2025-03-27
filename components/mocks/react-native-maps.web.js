// This file serves as a mock implementation of react-native-maps for web platforms
// It exports empty components to prevent errors when trying to import react-native-maps on web

const MockMapView = ({ children, ...props }) => null;
const MockMarker = (props) => null;
const MockPolyline = (props) => null;
const MockCallout = (props) => null;

// Export mocked components with the same names as the real ones
export default {
  __esModule: true,
  default: MockMapView,
};

export const Marker = MockMarker;
export const Polyline = MockPolyline;
export const Callout = MockCallout;
export const PROVIDER_GOOGLE = 'google';
