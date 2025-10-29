# Metro Export Issues - Permanent Fix Setup

## ✅ Setup Complete

We've set up `patch-package` to permanently preserve Metro export fixes:

1. **Installed patch-package** - Automatically applies patches after `npm install`
2. **Created patches** for root Metro packages
3. **Added postinstall script** - Automatically runs patch-package and our patch script

## How It Works

### Root Metro Packages
Patches are stored in `patches/` directory:
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
These are handled by `scripts/patch-metro-exports.cjs`, which runs automatically after each `npm install` via the `postinstall` hook.

## What Gets Fixed

All Metro packages get their `exports` field modified to:
- Keep essential exports (`.` and `./package.json`)
- Preserve `./private/*` pattern (required by Metro)
- Remove other restrictive export paths

This allows Metro to access internal modules like:
- `metro/private/lib/TerminalReporter`
- `metro-core/private/canonicalize`
- `metro/src/DeltaBundler/Serializers/sourceMapString`

## Verification

After running `npm install`, patches will be automatically applied. You can verify:

```bash
# Check that patches exist
ls patches/*.patch

# Manually test patch application
npx patch-package --reverse
npx patch-package
```

## Updating Patches

If Metro packages are updated and patches break:

1. Remove old patches: `rm patches/*.patch`
2. Run our patch script: `node scripts/patch-metro-exports.cjs`
3. Create new patches: `npx patch-package metro metro-cache metro-config ...`

## Current Status

- ✅ Node.js 20.19.4 installed
- ✅ patch-package configured
- ✅ Postinstall hook set up
- ✅ Patches created for root Metro packages
- ✅ Patch script handles nested @expo/metro packages
- ⚠️ Metro config loading still has issues (being investigated)
