/**
 * API configuration for mobile app
 * Ensures API calls work on mobile devices
 */

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  // In Expo, you can use Constants.expoConfig.extra.apiUrl if configured
  // For now, use localhost for iOS simulator, or your computer's IP for physical devices
  
  if (__DEV__) {
    // iOS Simulator uses localhost
    // Android Emulator uses 10.0.2.2
    // Physical devices need your computer's IP address
    // TODO: Replace with your computer's IP for device testing
    return 'http://localhost:3000';
  }
  
  // Production: replace with your deployed backend URL
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper to make API calls with correct base URL
export const apiUrl = (path: string): string => {
  // If path already includes protocol, use as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Prepend API base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
