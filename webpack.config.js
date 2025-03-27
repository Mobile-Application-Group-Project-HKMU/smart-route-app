const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add resolve aliases for web platform
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': path.resolve(__dirname, './components/mocks/react-native-maps.web.js'),
  };
  
  return config;
};
