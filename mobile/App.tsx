import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Text } from 'react-native';

import DashboardScreen   from './src/screens/DashboardScreen';
import ReadingsScreen    from './src/screens/ReadingsScreen';
import ChartsScreen      from './src/screens/ChartsScreen';
import MedicationsScreen from './src/screens/MedicationsScreen';
import SettingsScreen    from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2 },
  },
});

// Simple emoji icons — replace with react-native-vector-icons or expo-symbols in production
const ICONS: Record<string, string> = {
  Home: '🏠', Readings: '📋', Analytics: '📊', Medications: '💊', Settings: '⚙️',
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
                  {ICONS[route.name]}
                </Text>
              ),
              tabBarActiveTintColor: '#0f172a',
              tabBarInactiveTintColor: '#94a3b8',
              tabBarLabelStyle: { fontSize: 11 },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home"        component={DashboardScreen} />
            <Tab.Screen name="Readings"    component={ReadingsScreen} />
            <Tab.Screen name="Analytics"   component={ChartsScreen} />
            <Tab.Screen name="Medications" component={MedicationsScreen} />
            <Tab.Screen name="Settings"    component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
