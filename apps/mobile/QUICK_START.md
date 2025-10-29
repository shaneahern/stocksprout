# Quick Start: Test Mobile App

## Fastest Way to Test

```bash
# From project root
cd apps/mobile

# Start Expo (this will open iOS Simulator automatically if available)
npm start --ios

# Or manually:
# 1. npm start
# 2. Press 'i' for iOS Simulator
# 3. Or scan QR code with Expo Go app on your phone
```

## Requirements

- Backend must be running on `http://localhost:3000`
- For iOS Simulator: Xcode installed
- For physical device: Expo Go app installed, same Wi-Fi network

## Expected Behavior

✅ App should launch  
✅ Navigation structure is set up  
⚠️ Pages will show but may have styling issues (Tailwind → StyleSheet migration pending)

## If You See Errors

See `TESTING.md` for detailed troubleshooting.
