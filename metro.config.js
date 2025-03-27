const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const defaultConfig = getDefaultConfig(__dirname);

// Add resolver options to handle platform-specific extensions
defaultConfig.resolver.sourceExts = process.env.RCT_METRO_PLATFORMS 
  ? ['native', 'ios', 'android', 'web'].map(
      (suffix) => `${process.env.RCT_METRO_PLATFORMS}.${suffix}.ts`
    ).concat(
      ['native', 'ios', 'android', 'web'].map(
        (suffix) => `${process.env.RCT_METRO_PLATFORMS}.${suffix}.tsx`
      )
    ).concat(
      ['native', 'ios', 'android', 'web'].map(
        (suffix) => `${process.env.RCT_METRO_PLATFORMS}.${suffix}.js`
      )
    ).concat(
      ['native', 'ios', 'android', 'web'].map(
        (suffix) => `${process.env.RCT_METRO_PLATFORMS}.${suffix}.jsx`
      )
    ).concat(defaultConfig.resolver.sourceExts)
  : defaultConfig.resolver.sourceExts;

// Enhanced module map for web platform
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  'react-native-maps': path.resolve(__dirname, './components/mocks/react-native-maps.web.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './components/mocks/codegenNativeCommands.js'),
  'react-native-maps/lib/MapMarkerNativeComponent': path.resolve(__dirname, './components/mocks/MapMarkerNativeComponent.js'),
  'react-native-maps/lib/MapViewNativeComponent': path.resolve(__dirname, './components/mocks/MapViewNativeComponent.js'),
};

// Configure platform-specific module resolution
defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
defaultConfig.resolver.platforms = [...defaultConfig.resolver.platforms, 'web'];

// Add resolveRequest function to handle problematic modules
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  // Special handling for native modules on web
  if (platform === 'web') {
    // Handle specific native modules with custom mocks
    if (moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, './components/mocks/codegenNativeCommands.js')
      };
    }
    
    if (moduleName.includes('react-native-maps/lib/')) {
      const componentName = moduleName.split('/').pop();
      const mockPath = path.resolve(__dirname, `./components/mocks/${componentName}.js`);
      
      // Check if we have a specific mock for this component
      if (require('fs').existsSync(mockPath)) {
        return {
          type: 'sourceFile',
          filePath: mockPath
        };
      }
      
      // Otherwise use the generic empty module
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, './components/mocks/emptyModule.js')
      };
    }
  }
  
  // For all other requests, use the default resolution
  return context.resolveRequest(context, moduleName, platform);
};

defaultConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = defaultConfig;
