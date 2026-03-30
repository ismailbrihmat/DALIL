import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabParamList, LogisticsStackParamList } from './types';

import DashboardScreen from '@screens/dashboard/DashboardScreen';
import TimelineScreen from '@screens/timeline/TimelineScreen';
import MapScreen from '@screens/map/MapScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import LogisticsScreen from '@screens/logistics/LogisticsScreen';

// Icons (using simple text as placeholder)
const Icon = ({ name }: { name: string }) => <Text style={styles.icon}>{name}</Text>;

const Tab = createBottomTabNavigator<MainTabParamList>();
const LogisticsStack = createStackNavigator<LogisticsStackParamList>();

const LogisticsNavigator: React.FC = () => (
  <LogisticsStack.Navigator screenOptions={{ headerShown: false }}>
    <LogisticsStack.Screen name="LogisticsOverview" component={LogisticsScreen} />
  </LogisticsStack.Navigator>
);

/**
 * Main Tab Navigator
 * Primary navigation for the authenticated app experience
 */
const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#C65D3B',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: () => <Icon name="🗺️" />,
          tabBarLabel: 'Plans',
        }}
      />
      <Tab.Screen
        name="Logistics"
        component={LogisticsNavigator}
        options={{
          tabBarIcon: () => <Icon name="🏨" />,
          tabBarLabel: 'Logistics',
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarIcon: () => <Icon name="📅" />,
          tabBarLabel: 'Timeline',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: () => <Icon name="🗺️" />,
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Icon name="👤" />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  text: {
    fontSize: 18,
    color: '#1B365D',
  },
  icon: {
    fontSize: 24,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  },
});

export default MainNavigator;
