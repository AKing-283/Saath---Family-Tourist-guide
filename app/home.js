import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Linking,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@app_settings';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    useMetricSystem: true,
    showDistance: true,
    showRatings: true,
    showPrices: true,
    autoDetectLocation: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadSettings();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const openGoogleMaps = async () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });
      
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.log("Google Maps is not installed");
        }
      } catch (error) {
        console.error("Error opening Google Maps:", error);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search-results',
        params: { query: searchQuery.trim() }
      });
    }
  };

  const features = [
    {
      id: 'favorites',
      title: 'Favorites',
      description: 'View your saved places',
      icon: 'heart',
      route: '/favorites',
    },
    {
      id: 'travel-expert',
      title: 'AI Travel Expert',
      description: 'Get personalized travel advice',
      icon: 'chatbubble',
      route: '/travel-expert',
    },
    {
      id: 'tourist-guide',
      title: 'Tourist Guide',
      description: 'Local tips and information',
      icon: 'compass',
      route: '/tourist-guide',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Smart Local Assistant
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your personal travel companion
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
          
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search places nearby..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[
              styles.featureCard,
              { backgroundColor: colors.cardBackground },
              styles.cardShadow
            ]}
            onPress={() => router.push(feature.route)}
            activeOpacity={0.7}
          >
            <View 
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + '20' },
                styles.iconShadow
              ]}
            >
              <Ionicons 
                name={feature.icon} 
                size={36} 
                color={colors.primary}
                style={styles.featureIcon} 
              />
            </View>
            <View style={styles.featureContent}>
              <Text 
                style={[
                  styles.featureTitle, 
                  { color: colors.text },
                  styles.featureText
                ]}
                numberOfLines={1}
              >
                {feature.title}
              </Text>
              <Text 
                style={[
                  styles.featureDescription,
                  { color: colors.textSecondary },
                  styles.descriptionText
                ]}
                numberOfLines={2}
              >
                {feature.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.mapButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/map')}
      >
        <Ionicons name="map" size={24} color="white" />
        <Text style={styles.mapButtonText}>Open Map</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Toggle dark/light theme
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Metric System</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Use kilometers instead of miles
                  </Text>
                </View>
                <Switch
                  value={settings.useMetricSystem}
                  onValueChange={() => toggleSetting('useMetricSystem')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Show Distance</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Display distance to places
                  </Text>
                </View>
                <Switch
                  value={settings.showDistance}
                  onValueChange={() => toggleSetting('showDistance')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Show Ratings</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Display place ratings
                  </Text>
                </View>
                <Switch
                  value={settings.showRatings}
                  onValueChange={() => toggleSetting('showRatings')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Show Prices</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Display price information
                  </Text>
                </View>
                <Switch
                  value={settings.showPrices}
                  onValueChange={() => toggleSetting('showPrices')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-detect Location</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Automatically use current location
                  </Text>
                </View>
                <Switch
                  value={settings.autoDetectLocation}
                  onValueChange={() => toggleSetting('autoDetectLocation')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Enable push notifications
                  </Text>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={() => toggleSetting('notificationsEnabled')}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderRadius: 0,
    elevation: 0,
    shadowColor: 'transparent',
    marginBottom: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
}); 