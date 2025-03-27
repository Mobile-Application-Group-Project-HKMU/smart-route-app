const { getDefaultConfig } = require('@expo/metro-config');
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

// Add module map for web platform
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  'react-native-maps': require.resolve('./components/mocks/react-native-maps.web.js'),
};

module.exports = defaultConfig;
