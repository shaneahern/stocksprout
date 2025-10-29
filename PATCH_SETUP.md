# Patch-Package Setup for Metro Fixes

## Overview

We've set up `patch-package` to permanently fix Metro bundler export issues that prevent Expo from working in our monorepo setup.

## What's Fixed

Metro packages have restrictive `exports` fields that block internal module access. We patch them to:
- Keep essential exports (`.` and `./package.json`)
- Preserve `./private/*` pattern (required by Metro)
- Remove other restrictive paths

## Setup

### Root Metro Packages
Patches are automatically applied from `patches/` directory:
- `metro+0.83.3.patch`
- `metro-cache+0.83.3.patch`
- `metro-config+0.83.3.patch`
- `metro-core+0.83.3.patch`
- `metro-runtime+0.83.3.patch`
- `metro-transform-worker+0.83.3.patch`
- `metro-file-map+0.83.3.patch`
- `metro-resolver+0.83.3.patch`
- `metro-source-map+0.83.3.patch`

### Nested Packages in @expo/metro
The `scripts/patch-metro-exports.cjs` script handles nested packages that can't be patched directly.

## Automatic Application

The `postinstall` script in `package.json` automatically:
1. Runs `patch-package` to apply root Metro patches
2. Runs `scripts/patch-metro-exports.cjs` to fix nested packages

```json
{
  "scripts": {
    "postinstall": "patch-package && node scripts/patch-metro-exports.cjs"
  }
}
```

## Manual Application

If patches don't apply automatically:

```bash
# Apply patches manually
npx patch-package

# Fix nested packages
node scripts/patch-metro-exports.cjs
```

## Updating Patches

When Metro packages are updated:

1. Remove old patches:
   ```bash
   rm patches/*.patch
   ```

2. Run patch script to apply fixes:
   ```bash
   node scripts/patch-metro-exports.cjs
   ```

3. Create new patches:
   ```bash
   npx patch-package metro metro-cache metro-config metro-core metro-runtime metro-transform-worker metro-file-map metro-resolver metro-source-map
   ```

4. Commit the new patches to git

## Files Modified

- `package.json` - Added `postinstall` script
- `patches/*.patch` - Patch files (should be committed)
- `scripts/patch-metro-exports.cjs` - Handles nested packages

## Why This Is Needed

Metro's package.json exports are too restrictive for monorepo setups where internal modules need to be accessed. This is a known issue with Metro in Node.js 20+ when using ESM-style package resolution.

## References

- [patch-package documentation](https://github.com/ds300/patch-package)
- [Metro bundler issues](https://github.com/facebook/metro/issues)
- [Expo monorepo guide](https://docs.expo.dev/guides/monorepos/)
