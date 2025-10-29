# Expo App Startup Fix Summary

## Problem Diagnosis

The Expo mobile app was failing to start with the error:
```
Error: Cannot find module '/home/ubuntu/repos/stocksprout/apps/mobile/node_modules/@expo/cli/build/bin/cli'
```

### Root Causes Identified

1. **Missing Dependencies**: The mobile app's `node_modules` directory didn't exist because workspace dependencies weren't installed properly
2. **Hardcoded CLI Paths**: The mobile app's start scripts used hardcoded paths to `@expo/cli` which are fragile in workspace setups
3. **npm vs yarn Configuration**: The `postinstall-postinstall` package was trying to run yarn commands in an npm-based project
4. **Incorrect resolutions Field**: The mobile package.json used `resolutions` field which npm ignores (should use `overrides`)
5. **Metro Package Exports**: Metro packages have restrictive `exports` fields that block internal module access needed by Expo

## Fixes Applied

### 1. Removed postinstall-postinstall Package
- **File**: `package.json`
- **Change**: Removed `postinstall-postinstall` dependency that was causing yarn/npm conflicts
- **Impact**: Allows npm install to complete successfully

### 2. Fixed Mobile App Start Scripts
- **File**: `apps/mobile/package.json`
- **Change**: Updated start scripts to use `expo` binary instead of hardcoded paths
  ```diff
  - "start": "node node_modules/@expo/cli/build/bin/cli start"
  + "start": "expo start"
  ```
- **Impact**: More robust script execution that works with hoisted dependencies

### 3. Moved resolutions to overrides
- **File**: `apps/mobile/package.json` (removed resolutions)
- **File**: `package.json` (added overrides)
- **Change**: Moved Metro version pinning from `resolutions` to root `overrides`
  ```json
  "overrides": {
    "metro": "0.83.3"
  }
  ```
- **Impact**: npm now properly enforces Metro version constraints

### 4. Updated Metro Package Export Patches
- **File**: `scripts/patch-metro-exports.cjs`
- **Change**: Updated patch script to add permissive exports that allow nested path access
  ```javascript
  packageJson.exports = {
    '.': originalExports['.'] || packageJson.main || './src/index.js',
    './package.json': './package.json',
    './private/*': './src/*.js',
    './src/*': './src/*.js'
  };
  ```
- **Impact**: Allows Metro to access internal modules like `metro/private/lib/TerminalReporter`

### 5. Created Permanent Patches
- **Files**: `patches/metro+0.83.3.patch`, `patches/metro-cache+0.83.3.patch`, etc.
- **Change**: Created patch-package patches for all Metro packages
- **Impact**: Fixes persist across `npm install` runs

### 6. Fixed @expo/metro-config sourceMapString Imports
- **Files**: Modified during postinstall via `scripts/patch-expo-metro-config.cjs`
- **Change**: Patched @expo/metro-config files to handle Metro's CommonJS exports correctly
- **Impact**: Prevents "Cannot read properties of undefined (reading 'sourceMapString')" errors

## Current Status

### ✅ Fixed
- Dependencies install successfully
- Metro bundler starts successfully
- Metro configuration loads without errors
- Package exports allow nested path access

### ⚠️ Remaining Issues

**Expo CLI Terminal Compatibility Issue**
- **Error**: `TypeError: this._scheduleUpdate is not a function`
- **Location**: `@expo/cli/build/src/start/server/metro/instantiateMetro.js`
- **Cause**: Version mismatch between Expo CLI's `LogRespectingTerminal` class and metro-core's `Terminal` class
- **Warning Message**:
  ```
  The following packages should be updated for best compatibility with the installed expo version:
    @expo/metro-config@54.0.8 - expected version: ~0.19.0
    @expo/metro-runtime@6.1.2 - expected version: ~4.0.1
    metro@0.83.3 - expected version: ^0.81.0
  ```

### Recommended Next Steps

1. **Option A: Use Expo-Compatible Metro Version**
   - Remove Metro version override and let Expo use its expected Metro ^0.81.0
   - Test if this resolves the Terminal compatibility issue
   - May require updating mobile app dependencies

2. **Option B: Update Expo Packages**
   - Update @expo/metro-config, @expo/metro-runtime to versions compatible with Metro 0.83.3
   - Check Expo documentation for compatible versions

3. **Option C: Use Expo Development Build**
   - Instead of Expo Go, use development builds which have better monorepo support
   - See: https://docs.expo.dev/develop/development-builds/introduction/

## Testing

To test the current state:
```bash
cd apps/mobile
npm start
```

Expected behavior:
- Metro bundler starts successfully
- Configuration loads without errors
- Terminal compatibility error occurs (known issue)

## Files Modified

- `package.json` - Removed postinstall-postinstall, added overrides
- `apps/mobile/package.json` - Fixed start scripts, removed resolutions
- `scripts/patch-metro-exports.cjs` - Updated Metro export patching logic
- `patches/*.patch` - Created/updated patches for all Metro packages
- `package-lock.json` - Updated after dependency changes

## Installation

After pulling these changes:
```bash
npm install
```

The postinstall hook will automatically:
1. Apply Metro package patches
2. Fix nested Metro packages in @expo/metro
3. Patch @expo/metro-config files
