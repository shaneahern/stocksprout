# Testing the Mobile App in Expo

## Prerequisites

1. **Install Expo CLI** (optional, can use npx):
   ```bash
   npm install -g expo-cli
   ```

2. **Install Expo Go app** on your iOS device from the App Store (or Android from Play Store)

3. **Make sure backend is running** on `http://localhost:3000`

## Testing Steps

### Option 1: iOS Simulator (Recommended for Development)

1. **Open iOS Simulator:**
   ```bash
   open -a Simulator
   ```

2. **Start the mobile app:**
   ```bash
   cd apps/mobile
   npm start
   ```

3. **Press `i`** in the Expo terminal to open in iOS Simulator

### Option 2: Physical Device with Expo Go

1. **Start the mobile app:**
   ```bash
   cd apps/mobile
   npm start
   ```

2. **Scan the QR code** with your iPhone camera
   - This will open the app in Expo Go
   - Make sure your phone and computer are on the same Wi-Fi network

3. **For physical device testing**, you may need to update the API URL:
   - Edit `apps/mobile/src/config.ts`
   - Replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:3000`)
   - Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`

### Option 3: Android Emulator

1. **Start Android Emulator** from Android Studio

2. **Start the mobile app:**
   ```bash
   cd apps/mobile
   npm start
   ```

3. **Press `a`** in the Expo terminal to open in Android Emulator

   **Note:** For Android emulator, update API URL in `apps/mobile/src/config.ts`:
   ```typescript
   return 'http://10.0.2.2:3000'; // Android emulator special IP
   ```

## What to Test

### ✅ Basic Navigation
- [ ] App launches without errors
- [ ] Auth screen loads (login/signup forms)
- [ ] Login works (if backend is running)
- [ ] After login, tab navigation works
- [ ] Can navigate between Home, Portfolio, Timeline, Activities, Profile tabs

### ✅ Route Parameters
- [ ] Portfolio detail page with childId parameter works
- [ ] Timeline detail page with childId parameter works
- [ ] Gift giver page with giftCode parameter works
- [ ] Sprout request page with requestCode parameter works

### ✅ Navigation Flows
- [ ] Can navigate from Home to Add Child
- [ ] Can navigate to portfolio detail from portfolio list
- [ ] Back button works correctly
- [ ] Deep linking works (if testing with URLs)

## Known Issues & Limitations

1. **Styling**: Pages still use Tailwind classes which won't work on mobile. They need to be converted to StyleSheet.

2. **Some Components**: Components using web-only APIs (like `window`, `localStorage`) may not work. We've fixed `localStorage` → `AsyncStorage`, but there may be others.

3. **Icons**: App icons and splash screens are placeholders. You'll see warnings about missing assets.

4. **API URLs**: Need to configure for physical devices (use your computer's IP instead of localhost).

## Troubleshooting

### "Cannot connect to backend"
- Make sure backend is running on port 3000
- For physical devices, update API URL to use your computer's IP
- Check firewall settings

### "Module not found" errors
- Run `npm install` in the mobile directory
- Make sure all workspace dependencies are installed: `npm install` from root

### "Expo Go can't load app"
- Make sure you're on the same Wi-Fi network
- Try restarting Expo: `npm start -- --clear`

### TypeScript Errors
- These are mostly type strictness issues and won't prevent the app from running
- Can be ignored for now or fixed incrementally

## Next Steps

After confirming navigation works:
1. ✅ Test all navigation flows
2. ⏳ Convert Tailwind CSS to StyleSheet (major work)
3. ⏳ Fix any remaining web-only API usage
4. ⏳ Add app icons and splash screens
5. ⏳ Test on real devices
