import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function LayoutContent() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={[styles.headerButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)' }]}
      >
        <Ionicons name="settings-outline" size={24} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
        />
        <Stack.Screen
          name="map"
          options={{
            title: 'Map View',
            headerRight: renderHeaderRight,
            contentStyle: {
              paddingHorizontal: 16,
              paddingTop: 16,
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="place"
          options={{
            title: 'Place Details',
            headerRight: renderHeaderRight,
            contentStyle: {
              paddingHorizontal: 16,
              paddingTop: 16,
              backgroundColor: colors.background,
            },
          }}
        />
      </Stack>
    </>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <LayoutContent />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    height: '100%',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 12,
  },
  headerButton: {
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
}); 