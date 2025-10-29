/**
 * React Navigation type definitions for StockSprout mobile app
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator Params
export type RootStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: undefined;
  EarlyAccess: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddChild: undefined;
  GiftGiver: { giftCode: string };
  SproutRequest: { requestCode: string };
  PortfolioDetail: { childId?: string };
  TimelineDetail: { childId?: string };
  NotFound: undefined;
};

// Main Tab Navigator Params
export type MainTabParamList = {
  Home: undefined;
  Portfolio: undefined;
  Timeline: undefined;
  Activities: undefined;
  Profile: undefined;
};

// Helper type for navigation props
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigate: (screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  replace: (screen: T, params?: RootStackParamList[T]) => void;
  setParams: (params: Partial<RootStackParamList[T]>) => void;
  canGoBack: () => boolean;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
