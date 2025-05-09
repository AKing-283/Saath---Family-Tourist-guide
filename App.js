import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import MapViewScreen from './screens/MapViewScreen';
import PlaceDetailsScreen from './screens/PlaceDetailsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#1A202C',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Smart Local Assistant',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={{ marginRight: 16 }}
              >
                <Ionicons name="settings-outline" size={24} color="#1A202C" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="MapView"
          component={MapViewScreen}
          options={{
            title: 'Map View',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PlaceDetails"
          component={PlaceDetailsScreen}
          options={{
            title: 'Place Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 