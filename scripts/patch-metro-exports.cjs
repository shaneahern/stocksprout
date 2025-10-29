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
    // For metro-runtime, remove exports entirely to allow any path access
    // Metro-runtime needs to access paths like ./src/polyfills/require.js
    // which don't match the ./private/* pattern
    if (packageJson.name === 'metro-runtime') {
      delete packageJson.exports;
      console.log(`✅ Removed exports from ${packageName} (allows all paths)`);
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      return true;
    }
    // For root metro, add permissive exports that allow nested paths
    // getDefaultConfig and other Metro internals access paths like
    // ./src/DeltaBundler/Serializers/sourceMapString directly
    if (packageJson.name === 'metro') {
      packageJson.exports = {
        '.': originalExports['.'] || packageJson.main || './src/index.js',
        './package.json': './package.json',
        './private/*': './src/*.js',
        './src/*': './src/*.js'
      };
      console.log(`✅ Patched ${packageName} - added permissive exports for nested paths`);
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      return true;
    }
    // For other Metro packages, add permissive exports that allow nested paths
    packageJson.exports = {
      '.': originalExports['.'] || packageJson.main || './src/index.js',
      './package.json': './package.json',
      './private/*': './src/*.js',
      './src/*': './src/*.js'
    };
    console.log(`✅ Patched ${packageName} - added permissive exports for nested paths`);
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
      // Patch nested packages - metro in nested location needs exports removed
      const packageJsonPath = path.join(nestedPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const backupPath = packageJsonPath + '.backup';
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(packageJsonPath, backupPath);
        }
        // Remove exports for metro in @expo/metro to allow all paths
        if (pkg === 'metro' && packageJson.exports) {
          delete packageJson.exports;
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log(`✅ Removed exports from @expo/metro/node_modules/${pkg} (allows all paths)`);
        } else {
          // Use regular patch function for other packages
          patchMetroPackage(path.join('@expo', 'metro', 'node_modules', pkg));
        }
      }
    }
  });
}
console.log('\n✅ Done! Metro packages should now work with require().');
console.log('Note: These changes will be lost if you run npm install again.');
console.log('Consider using patch-package (https://github.com/ds300/patch-package) for permanent fixes.');
