// Get base URL for gift links - works in both web and React Native
function getBaseUrl(): string {
  // React Native / Expo environment
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_URL) {
    return process.env.EXPO_PUBLIC_APP_URL;
  }
  
  // Web environment - use window.location.origin
  // Note: Vite's import.meta.env is not available in React Native/Hermes
  // For web builds, VITE_APP_URL should be injected at build time or use window.location.origin
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  
  // Default fallback
  return 'https://stocksprout.com';
}

export function generateGiftLink(childCode: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/gift/${childCode}`;
}

export function generateSMSMessage(childName: string, giftLink: string): string {
  return `🎁 You've been invited to send an investment gift to ${childName}! Click the link to choose and send your gift.`;
}

// Copy to clipboard - works in both web and React Native
export function copyToClipboard(text: string): Promise<void> {
  // React Native using Expo Clipboard
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // In React Native, this should be handled by the calling component using @react-native-clipboard/clipboard
    // For now, return a resolved promise (implementer should handle this in component)
    return Promise.resolve();
  }
  
  // Web environment
  return navigator.clipboard.writeText(text);
}

// Share via Web Share API - web only, React Native should use expo-sharing
export function shareViaWebShare(data: { title: string; text: string; url: string }): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    return navigator.share(data);
  } else {
    // Fallback to clipboard
    return copyToClipboard(data.url);
  }
}
