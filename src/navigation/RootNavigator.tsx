import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';

// App Screens
import VoiceOnboardingScreen from '@screens/onboarding/VoiceOnboardingScreen';
import SmartLoadingScreen from '@screens/loading/SmartLoadingScreen';
import ItinerarySelectionScreen from '@screens/itinerary/ItinerarySelectionScreen';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Root Navigator - Handles the app flow
 * Auth -> Onboarding -> Loading -> Itinerary Selection -> Main App
 */
const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Onboarding" component={VoiceOnboardingScreen} />
        <Stack.Screen name="SmartLoading" component={SmartLoadingScreen} />
        <Stack.Screen name="ItinerarySelection" component={ItinerarySelectionScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
