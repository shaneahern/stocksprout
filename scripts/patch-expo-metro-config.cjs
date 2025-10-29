// Patch @expo/metro-config files to use ./private/* paths instead of ./src/*
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Replace metro/src/ paths with metro/private/ paths
  // This makes them use the ./private/* export pattern
  const patterns = [
    ['metro/src/DeltaBundler/Serializers/sourceMapString', 'metro/private/DeltaBundler/Serializers/sourceMapString'],
    ['metro/src/lib/bundleToString', 'metro/private/lib/bundleToString'],
    ['metro/src/', 'metro/private/'],
  ];
  
  let newContent = content;
  for (const [from, to] of patterns) {
    if (newContent.includes(from)) {
      newContent = newContent.split(from).join(to);
      modified = true;
    }
  }
  
  if (modified) {
    // Create backup
    const backupPath = filePath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  return false;
}

function patchDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let patched = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      patched += patchDirectory(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      if (patchFile(fullPath)) {
        patched++;
      }
    }
  }
  
  return patched;
}

console.log('🔧 Patching @expo/metro-config files to use ./private/* paths...\n');

let totalPatched = 0;

// Patch root @expo/metro-config
const rootMetroConfig = path.join(rootDir, 'node_modules', '@expo', 'metro-config');
if (fs.existsSync(rootMetroConfig)) {
  const count = patchDirectory(rootMetroConfig);
  console.log(`✅ Patched ${count} files in @expo/metro-config`);
  totalPatched += count;
}

// Patch nested @expo/metro/node_modules/metro-config
const nestedMetroConfig = path.join(rootDir, 'node_modules', '@expo', 'metro', 'node_modules', 'metro-config');
if (fs.existsSync(nestedMetroConfig)) {
  const count = patchDirectory(nestedMetroConfig);
  console.log(`✅ Patched ${count} files in @expo/metro/node_modules/metro-config`);
  totalPatched += count;
}

console.log(`\n✅ Done! Patched ${totalPatched} files total.`);
console.log('Note: These changes will be lost if you run npm install again.');
console.log('Consider creating patches with patch-package if needed.');
