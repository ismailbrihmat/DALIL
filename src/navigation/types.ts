/**
 * Navigation Types for DALIL App
 */

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  SmartLoading: undefined;
  ItinerarySelection: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Logistics: undefined;
  Timeline: undefined;
  Map: undefined;
  Profile: undefined;
};

export type LogisticsStackParamList = {
  LogisticsOverview: undefined;
  Accommodation: undefined;
  Transport: undefined;
  LocalExpertise: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
