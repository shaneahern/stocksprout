# iOS App Setup Guide

## Current Status

✅ **Completed:**
- Expo project structure created
- React Navigation configured
- Component library uses React Native primitives (cross-platform ready)
- Authentication forms migrated to React Native components

⚠️ **Not Yet Ready:**
- Most pages still use web-only libraries (`wouter` for routing, Tailwind classes)
- `localStorage` needs to be replaced with `AsyncStorage` for mobile
- API URLs need configuration for device testing
- App icons and splash screens needed

## Quick Start (Testing with Expo Go)

1. **Install Expo Go app** on your iPhone (from App Store)

2. **Start the mobile app:**
```bash
cd apps/mobile
npm start
```

3. **Scan the QR code** with your iPhone camera (opens in Expo Go)

4. **Note:** The app will show placeholders for pages that haven't been migrated yet.

## Running in iOS Simulator

1. **Make sure Xcode is installed** (includes iOS Simulator)

2. **Start iOS Simulator:**
```bash
open -a Simulator
```

3. **Run the app:**
```bash
cd apps/mobile
npm run ios
```

## Remaining Work

### Critical (to make app functional):
1. Replace `localStorage` with `@react-native-async-storage/async-storage` in AuthContext
2. Update API URLs to work with mobile (currently uses relative URLs)
3. Migrate pages from `wouter` to React Navigation screens
4. Remove Tailwind classes and convert to StyleSheet

### Nice to have:
- App icons and splash screens
- iOS-specific configurations (permissions, etc.)
- Native modules if needed (camera, biometrics, etc.)

## Testing Authentication

The authentication forms (Login/Signup) should work since they're already migrated to React Native components! However, you'll need to:

1. Make sure your backend is accessible (update API_BASE_URL in `src/config.ts` if using a physical device)
2. Update AuthContext to use AsyncStorage instead of localStorage

Would you like me to:
1. Fix localStorage → AsyncStorage migration?
2. Set up API URL configuration for mobile?
3. Start migrating pages to React Native?
