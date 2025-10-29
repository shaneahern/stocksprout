/**
 * Mobile app configuration
 */

// API Base URL - for mobile, we need the full URL
// In development, use your local IP address if testing on device
// For iOS simulator, localhost works
// For Android emulator, use 10.0.2.2
const getApiBaseUrl = () => {
  // Check if we're in Expo Go or development
  if (__DEV__) {
    // For iOS Simulator, localhost works
    // For Android Emulator, use 10.0.2.2
    // For physical device, you need your computer's IP (e.g., 'http://192.168.1.100:3000')
    return 'http://localhost:3000';
  }
  
  // Production: replace with your deployed backend URL
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};
