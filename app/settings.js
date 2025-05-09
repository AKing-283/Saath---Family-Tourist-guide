import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, isSystemTheme, toggleTheme, setSystemTheme, colors } = useTheme();

  const renderSettingItem = ({ icon, title, value, onPress, type = 'switch' }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <Text style={[styles.settingItemText, { color: colors.text }]}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.disabled, true: colors.primary }}
          thumbColor={colors.background}
        />
      ) : (
        <Text style={[styles.settingItemValue, { color: colors.placeholder }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        {renderSettingItem({
          icon: 'moon-outline',
          title: 'Dark Mode',
          value: isDarkMode,
          onPress: toggleTheme,
        })}
        {renderSettingItem({
          icon: 'phone-portrait-outline',
          title: 'Use System Theme',
          value: isSystemTheme,
          onPress: setSystemTheme,
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        {renderSettingItem({
          icon: 'information-circle-outline',
          title: 'Version',
          value: '1.0.0',
          type: 'text',
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingItemValue: {
    fontSize: 16,
  },
}); 