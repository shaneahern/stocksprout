# Expo Metro Configuration Issue

## Problem
Metro bundler has strict package exports that conflict with monorepo setups, and requires Node.js >= 20.19.4.

Errors:
- `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './src/lib/TerminalReporter' is not defined by "exports"`
- Metro requires Node.js >= 20.19.4 (you have 20.18.0)

## Root Cause
- Root `package.json` has `"type": "module"` which makes Node treat .js files as ESM
- Expo/Metro expects CommonJS in metro.config.js  
- Root node_modules has Metro installed that conflicts with local installation
- Metro's package.json exports are too restrictive for internal path access
- Node.js version too old (need >= 20.19.4)

## Solutions (in order of preference)

### Option 1: Use Node.js 20 LTS (Recommended)
```bash
# Using nvm or asdf
nvm install 20
nvm use 20
# or
asdf install nodejs 20.x.x
asdf local nodejs 20.x.x
```

Then:
```bash
cd apps/mobile
npm start
```

### Option 2: Temporary Workaround - Isolate Metro
Create a separate Metro installation that doesn't conflict:

```bash
cd apps/mobile
# Install Metro locally with correct version
npm install metro@0.83.3 --save-dev
# Ensure package.json has "type": "commonjs"
```

### Option 3: Use Expo Development Build
Instead of Expo Go, use development builds which have better monorepo support.

## Current Status
- ✅ Navigation structure set up
- ✅ Wouter compatibility layer created
- ✅ Pages wrapped for React Navigation
- ⚠️ Expo startup blocked by Metro/Node.js 23 compatibility

## Recommendation
**Use Node.js 20 LTS** for development. This is the most stable solution and what Expo recommends.
