import { Stack } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function StackLayout() {
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
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.header,
          height: 160,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 22,
          marginTop: 200,
          marginBottom: 20,
          letterSpacing: 0.5,
          color: colors.headerText,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'bottom',
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)' }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: 'Smart Local Assistant',
          headerLeft: () => null,
          headerRight: renderHeaderRight,
          contentStyle: {
            paddingHorizontal: 16,
            paddingTop: 16,
            backgroundColor: colors.background,
          },
        }}
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