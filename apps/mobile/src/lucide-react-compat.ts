/**
 * Compatibility layer to redirect lucide-react imports to lucide-react-native
 * This allows web components to work in React Native without modification
 * 
 * Re-export everything from lucide-react-native
 * Using explicit re-export to ensure proper module structure
 */

console.log('[lucide-compat] Loading lucide-react-native compatibility layer');

// Import all icons
import * as LucideIcons from 'lucide-react-native';

// Re-export everything to match lucide-react's export pattern
export * from 'lucide-react-native';

// Also export as default for compatibility (lucide-react doesn't have default, but just in case)
export default LucideIcons;
