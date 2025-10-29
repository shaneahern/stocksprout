// Script to create patches for nested Metro packages in @expo/metro
// This is needed because patch-package doesn't handle nested packages well
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const expoMetroPath = path.join(rootDir, 'node_modules', '@expo', 'metro', 'node_modules');

const packages = [
  'metro',
  'metro-cache',
  'metro-config',
  'metro-core',
  'metro-runtime',
  'metro-transform-worker',
  'metro-file-map',
  'metro-resolver',
  'metro-source-map'
];

console.log('🔧 Creating patches for nested Metro packages in @expo/metro...\n');

// First, ensure we run our patch script to apply current fixes
console.log('1. Applying current fixes...');
require('./patch-metro-exports.cjs');

console.log('\n2. Creating patches using patch-package...');
packages.forEach(pkg => {
  const packagePath = path.join(expoMetroPath, pkg);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const backupPath = packageJsonPath + '.backup';
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping ${pkg} - package not found`);
    return;
  }
  
  // Restore backup temporarily to create a clean diff
  if (fs.existsSync(backupPath)) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const backupJson = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      
      // Restore backup
      fs.writeFileSync(packageJsonPath, JSON.stringify(backupJson, null, 2));
      
      // Create patch
      try {
        execSync(`npx patch-package ${pkg} --patch-dir patches/@expo-metro 2>&1`, {
          cwd: rootDir,
          stdio: 'ignore'
        });
        console.log(`✅ Created patch for ${pkg}`);
      } catch (e) {
        // Patch might already exist or package not directly patchable
      }
      
      // Restore our changes
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkgJson, null, 2));
    } catch (e) {
      console.log(`⚠️  Could not create patch for ${pkg}: ${e.message}`);
    }
  }
});

console.log('\n✅ Patch creation complete!');
console.log('\nNote: Nested packages in @expo/metro are handled by patch-metro-exports.cjs');
console.log('This script runs automatically after npm install via postinstall hook.');
