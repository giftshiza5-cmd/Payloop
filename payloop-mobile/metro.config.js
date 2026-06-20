const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Speed up Metro indexing by ignoring backend and web sibling node_modules
config.resolver.blockList = [
  /payloop-backend\/node_modules\/.*/,
  /payloop-web\/node_modules\/.*/,
  /payloop-contracts\/.*/,
];

module.exports = config;
