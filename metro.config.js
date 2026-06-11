const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'gif', 'jpeg', 'webp', 'svg', 'mp3', 'mp4', 'wav'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
