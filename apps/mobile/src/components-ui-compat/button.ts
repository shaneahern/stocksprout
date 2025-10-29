/**
 * Compatibility layer: redirect @/components/ui/button to @stocksprout/components Button
 * This prevents @radix-ui/react-slot from being loaded
 */
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from '@stocksprout/components';

// Export buttonVariants for compatibility (not used in React Native, but might be referenced)
export const buttonVariants = () => ({});
