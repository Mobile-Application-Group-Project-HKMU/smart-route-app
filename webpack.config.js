const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Enhanced resolve aliases for web platform
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': path.resolve(__dirname, './components/mocks/react-native-maps.web.js'),
    // Add additional native module mocks as needed
    'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './components/mocks/emptyModule.js'),
  };
  
  return config;
};
