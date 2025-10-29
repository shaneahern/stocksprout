#!/usr/bin/env node
/**
 * Patch Metro package.json files to add missing exports
 * This fixes ERR_PACKAGE_PATH_NOT_EXPORTED errors in monorepo setups
 */
const fs = require('fs');
const path = require('path');

function patchMetroPackage(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Package.json not found: ${packageJsonPath}`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Create backup
  const backupPath = packageJsonPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log(`📦 Created backup: ${backupPath}`);
  }

  // Update exports
  if (!packageJson.exports) {
    packageJson.exports = {};
  }

  // Add wildcard export for src/* paths
  if (packageJson.name === 'metro') {
    packageJson.exports = {
      '.': packageJson.exports['.'] || './src/index.js',
      './package.json': './package.json',
      './private/*': './src/*.js',
      './src/*': './src/*.js',
    };
  } else if (packageJson.name === 'metro-cache') {
    packageJson.exports = {
      '.': packageJson.exports['.'] || './src/index.js',
      './package.json': './package.json',
      './src/*': './src/*.js',
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Patched ${packageJson.name} at ${packagePath}`);
  return true;
}

// Patch Metro packages in root node_modules
const rootDir = path.resolve(__dirname, '..');
const metroPath = path.join(rootDir, 'node_modules', 'metro');
const metroCachePath = path.join(rootDir, 'node_modules', 'metro-cache');

console.log('🔧 Patching Metro packages...\n');
patchMetroPackage(metroPath);
patchMetroPackage(metroCachePath);
console.log('\n✅ Done!');
