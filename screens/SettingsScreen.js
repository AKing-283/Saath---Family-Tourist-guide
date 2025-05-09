import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_PLACES_API_KEY, GEMINI_API_KEY } from '../config';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const apiStatus = {
    gemini: GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY',
    places: GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY',
  };

  const renderSettingItem = ({ icon, title, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color="#1A237E" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#4CAF50' }}
          thumbColor={value ? '#fff' : '#fff'}
        />
      ) : (
        <View style={[styles.status, apiStatus[value] ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>
            {apiStatus[value] ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Status</Text>
          {renderSettingItem({
            icon: 'logo-google',
            title: 'Google Places API',
            value: 'places',
            type: 'status',
          })}
          {renderSettingItem({
            icon: 'logo-google',
            title: 'Gemini API',
            value: 'gemini',
            type: 'status',
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem({
            icon: 'moon',
            title: 'Dark Mode',
            value: darkMode,
            onValueChange: setDarkMode,
          })}
          {renderSettingItem({
            icon: 'location',
            title: 'Location Services',
            value: locationEnabled,
            onValueChange: setLocationEnabled,
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutTitle}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#4A5568',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#C6F6D5',
  },
  statusInactive: {
    backgroundColor: '#FED7D7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  aboutTitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
    color: '#718096',
  },
});

export default SettingsScreen; 