/**
 * Mock implementation for react-native-maps MapMarkerNativeComponent
 * This resolves the import error for react-native/Libraries/Utilities/codegenNativeCommands
 */

// Export a mock component interface that matches what react-native-maps expects
export default {
  Commands: {
    animateMarkerToCoordinate: () => {},
    showCallout: () => {},
    hideCallout: () => {},
    redraw: () => {}
  }
};

// Add other properties that might be expected
export const Constants = {};
export const directEventTypes = {};
export const validAttributes = {};
