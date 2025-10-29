/**
 * Cross-platform storage abstraction
 * Works on web (localStorage) and mobile (AsyncStorage)
 */

// Web: localStorage
// Mobile: AsyncStorage from @react-native-async-storage/async-storage

let storage: StorageInterface;

// Type guard for web environment
const isWebEnvironment = (): boolean => {
  if (typeof globalThis === 'undefined') return false;
  const globalWindow = globalThis as any;
  return typeof globalWindow.window !== 'undefined' && typeof globalWindow.window.localStorage !== 'undefined';
};

// Determine which storage to use based on environment
if (isWebEnvironment()) {
  // Web environment - use localStorage
  const globalWindow = globalThis as any;
  const webStorage = globalWindow.window.localStorage;
  storage = {
    async getItem(key: string): Promise<string | null> {
      try {
        return webStorage.getItem(key);
      } catch (error) {
        console.error('Storage getItem error:', error);
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        webStorage.setItem(key, value);
      } catch (error) {
        console.error('Storage setItem error:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        webStorage.removeItem(key);
      } catch (error) {
        console.error('Storage removeItem error:', error);
      }
    },
  };
} else {
  // Mobile/React Native environment - use AsyncStorage
  // Dynamic import to avoid bundling AsyncStorage on web
  storage = {
    async getItem(key: string): Promise<string | null> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(key);
      } catch (error) {
        console.error('AsyncStorage getItem error:', error);
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, value);
      } catch (error) {
        console.error('AsyncStorage setItem error:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(key);
      } catch (error) {
        console.error('AsyncStorage removeItem error:', error);
      }
    },
  };
}

interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const crossPlatformStorage = storage;
