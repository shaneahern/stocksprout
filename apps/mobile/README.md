# StockSprout Mobile App

React Native mobile application for iOS and Android using Expo.

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (optional, can use npx)
- iOS Simulator (via Xcode) for iOS development
- Android Studio for Android development (or use Expo Go app)

## Setup

1. **Install dependencies:**
```bash
cd apps/mobile
npm install
```

2. **Run on iOS:**
```bash
npm run ios
# or
npx expo start --ios
```

3. **Run on Android:**
```bash
npm run android
# or
npx expo start --android
```

4. **Run in Expo Go (quickest way to test):**
```bash
npm start
# Then scan QR code with Expo Go app on your phone
```

## Configuration

The app uses the same backend as the web app. Make sure your backend server is running on the configured port (default: 3000).

For development, you may need to update API endpoints in:
- `client/src/contexts/AuthContext.tsx` - Change `/api/` to `http://YOUR_IP:3000/api/` for device testing

## Structure

- Uses `@stocksprout/components` for cross-platform UI
- Uses React Navigation for routing (replaces wouter)
- Shares business logic from `@stocksprout/shared` and `@stocksprout/hooks`

## Status

⚠️ **Work in Progress**: Pages still need migration from web-only components (wouter, Tailwind) to React Native components.
