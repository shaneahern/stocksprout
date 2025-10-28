// Shared TypeScript types
// Types will be extracted from schema and components

// Re-export types from schema (they're exported as types in schema.ts)
export type {
  User,
  Child,
  Gift,
  Investment,
  PortfolioHolding,
  Contributor,
  SproutRequest,
  RecurringContribution,
  ThankYouMessage,
  Notification
} from '../schema';

// Additional shared types
export interface ApiError {
  error: string;
  message?: string;
}
