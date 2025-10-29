# Running the StockSprout App

## Quick Start

### Run Everything (Recommended for Development)

```bash
# From the project root
npm run dev
```

This starts:
- **Web app** (Vite) - Usually at `http://localhost:5173` or `http://localhost:5174`
- **Server** (Express API) - Usually at `http://localhost:3000`
- Mobile and Desktop apps (placeholder scripts for now)

## Individual Components

### Web App Only

```bash
cd apps/web
npm run dev
```

Access at: `http://localhost:5173` (or next available port)

### Server Only

```bash
cd server
npm run dev
```

Runs on: `http://localhost:3000`

**Note:** Make sure port 3000 is not already in use, or set a different PORT:
```bash
PORT=3001 npm run dev
```

### Mobile App (iOS/Android)

**Prerequisites:**
- Node.js 20.19.4+ (check with `node --version`)
- iOS Simulator or Android Emulator (for mobile devices)
- Or Expo Go app on your phone

**Start Expo:**
```bash
cd apps/mobile
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone
- Press `w` for web (uses React Native Web)

**Note:** The mobile app currently has Metro bundler issues that are being worked on. The patches we created should help, but you may still encounter errors.

## Environment Setup

1. **Create `.env` file** in the project root:
   ```bash
   # Database
   DATABASE_URL=your_database_url
   
   # Optional: Cloudinary for video storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```
   
   Note: The `postinstall` hook will automatically apply Metro patches.

## Common Issues

### Port Already in Use

If you see `EADDRINUSE` errors:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Metro Bundler Errors (Mobile)

If you see Metro export errors when running the mobile app:

1. Ensure Node.js version is 20.19.4+:
   ```bash
   node --version
   asdf local nodejs 20.19.4  # if using asdf
   ```

2. Re-run the patch script:
   ```bash
   node scripts/patch-metro-exports.cjs
   ```

3. Try starting Expo again:
   ```bash
   cd apps/mobile
   npm start
   ```

### Dependencies Not Installed

If you get module not found errors:

```bash
# Install all dependencies
npm install

# The postinstall hook will automatically:
# 1. Apply Metro patches
# 2. Fix nested @expo/metro packages
```

## Development Workflow

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the web app** (in another terminal):
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Access the app:**
   - Frontend: `http://localhost:5173` (or port shown in terminal)
   - API: `http://localhost:3000`

## Production Build

### Web App
```bash
cd apps/web
npm run build
```

### Server
```bash
cd server
npm run build
npm start
```

## Troubleshooting

For mobile-specific issues, see:
- `apps/mobile/EXPO_FIX.md` - Expo setup issues
- `apps/mobile/NODE_VERSION.md` - Node.js version requirements
- `apps/mobile/METRO_FIX_SUMMARY.md` - Metro bundler fixes
- `PATCH_SETUP.md` - Patch-package documentation
