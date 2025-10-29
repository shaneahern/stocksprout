# Node.js Version Requirement

## Issue
Metro bundler (used by Expo) requires **Node.js >= 20.19.4**.

Current version: 20.18.0 (too old)

## Solution

Update Node.js to at least 20.19.4:

```bash
# If using asdf
asdf install nodejs 20.19.4
asdf local nodejs 20.19.4

# Verify
node --version  # Should show v20.19.4 or higher

# Then try Expo again
cd apps/mobile
npm start
```

## Alternative: Use Latest LTS

```bash
asdf install nodejs 22.11.0  # Latest LTS
asdf local nodejs 22.11.0
```

## Why This Matters

Metro's package.json specifies `"engines": { "node": ">=20.19.4" }`. 
While Node.js might still work with older versions, some Metro features
may fail silently or produce cryptic errors related to package exports.
