// Patch Metro packages to allow all internal paths
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function patchMetroPackage(packageName) {
  const packagePath = path.join(rootDir, 'node_modules', packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Package not found: ${packageName}`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Create backup if it doesn't exist
  const backupPath = packageJsonPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(packageJsonPath, backupPath);
  }

  // Keep minimal exports but preserve ./private/* pattern that Metro relies on
  if (packageJson.exports && typeof packageJson.exports === 'object') {
    const originalExports = packageJson.exports;
    // Keep essential exports and preserve ./private/* pattern if it exists
    packageJson.exports = {
      '.': originalExports['.'] || packageJson.main || './src/index.js',
      './package.json': './package.json'
    };
    // Preserve ./private/* pattern (Metro uses this extensively)
    if (originalExports['./private/*']) {
      packageJson.exports['./private/*'] = originalExports['./private/*'];
    }
    console.log(`✅ Patched ${packageName} - kept minimal exports with ./private/* pattern`);
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  return true;
}

// Patch all Metro-related packages
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

console.log('🔧 Patching Metro packages to remove export restrictions...\n');
packages.forEach(pkg => patchMetroPackage(pkg));

// Also patch nested packages in @expo/metro
console.log('\n🔧 Patching nested Metro packages in @expo/metro...\n');
const expoMetroPath = path.join(rootDir, 'node_modules', '@expo', 'metro');
if (fs.existsSync(expoMetroPath)) {
  packages.forEach(pkg => {
    const nestedPath = path.join(expoMetroPath, 'node_modules', pkg);
    if (fs.existsSync(nestedPath)) {
      patchMetroPackage(path.join('@expo', 'metro', 'node_modules', pkg));
    }
  });
}
console.log('\n✅ Done! Metro packages should now work with require().');
console.log('Note: These changes will be lost if you run npm install again.');
console.log('Consider using patch-package (https://github.com/ds300/patch-package) for permanent fixes.');
