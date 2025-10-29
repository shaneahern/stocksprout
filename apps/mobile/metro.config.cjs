// Learn more https://docs.expo.dev/guides/customizing-metro
// Using .cjs extension to force CommonJS even if parent has type: module
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for module resolution in monorepo
// Prioritize local node_modules to avoid Metro export issues
config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// Enable symlinks for monorepo
config.watchFolders = [
  path.resolve(__dirname, '../..'),
];

module.exports = config;
