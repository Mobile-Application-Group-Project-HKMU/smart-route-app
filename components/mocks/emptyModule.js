// This is an empty module to mock native-only imports
// Used as a fallback for various native modules that aren't available on web

// Basic no-op functions
export function createInterfaceAdapter() {
  return {
    Commands: {
      animateMarkerToCoordinate: () => {},
      showCallout: () => {},
      hideCallout: () => {},
      redraw: () => {}
    },
  };
}

export function dispatchCommand() {}
export function getEnforcing() { return { 
  animateMarkerToCoordinate: () => {},
  showCallout: () => {},
  hideCallout: () => {},
  redraw: () => {},
  Constants: {} 
}; }
export function get() { return null; }

// Common commands that might be called on native components
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

// Default export as an empty object with common functions
export default {
  createInterfaceAdapter,
  dispatchCommand,
  getEnforcing,
  get,
  Commands: commonCommands,
  Constants: {},
  directEventTypes: {},
  validAttributes: {}
};
