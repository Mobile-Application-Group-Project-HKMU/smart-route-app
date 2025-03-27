/**
 * Comprehensive mock implementation for react-native/Libraries/Utilities/codegenNativeCommands
 * This handles all potential use cases for this module on web platforms
 */

// Create a Commands object with all potential methods that might be called
const commonCommands = {
  animateMarkerToCoordinate: () => {},
  showCallout: () => {},
  hideCallout: () => {},
  redraw: () => {},
  fitToElements: () => {},
  fitToSuppliedMarkers: () => {},
  fitToCoordinates: () => {},
  setMapBoundaries: () => {},
  animateToRegion: () => {},
  animateToCoordinate: () => {},
  animateToBearing: () => {},
  animateToViewingAngle: () => {},
};

export function createInterfaceAdapter() {
  return {
    Commands: { ...commonCommands },
  };
}

export function dispatchCommand() {
  // No-op function for web
}

export function getEnforcing() {
  return {
    ...commonCommands,
    Commands: { ...commonCommands },
    Constants: {}
  };
}

export function get() {
  return {
    ...commonCommands,
    Commands: { ...commonCommands },
    Constants: {}
  };
}

// Export a more complete interface for flexibility
export default {
  createInterfaceAdapter,
  dispatchCommand,
  getEnforcing,
  get,
  Commands: { ...commonCommands },
  Constants: {},
  directEventTypes: {},
  validAttributes: {}
};
