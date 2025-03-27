const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Enhanced resolve aliases for web platform
  config.resolve.alias = {
    ...config.resolve.alias,
    // Mock all react-native-maps components
    'react-native-maps': path.resolve(__dirname, './components/mocks/react-native-maps.web.js'),
    // Mock specific native components
    'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './components/mocks/codegenNativeCommands.js'),
    // Add specific mocks for MapMarkerNativeComponent and other components
    'react-native-maps/lib/MapMarkerNativeComponent': path.resolve(__dirname, './components/mocks/MapMarkerNativeComponent.js'),
    'react-native-maps/lib/MapViewNativeComponent': path.resolve(__dirname, './components/mocks/MapViewNativeComponent.js'),
  };
  
  // Add fallback for node modules that might cause issues
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-maps': path.resolve(__dirname, './components/mocks/react-native-maps.web.js'),
    'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './components/mocks/emptyModule.js'),
  };
  
  // Add a rule to handle native modules
  config.module.rules.push({
    test: /\.js$/,
    include: [
      path.resolve(__dirname, 'node_modules/react-native-maps'),
    ],
    use: {
      loader: 'babel-loader',
      options: {
        plugins: [
          // This plugin helps replace problematic imports
          ['module-resolver', {
            alias: {
              'react-native/Libraries/Utilities/codegenNativeCommands': './components/mocks/codegenNativeCommands.js'
            }
          }]
        ]
      }
    }
  });
  
  return config;
};
