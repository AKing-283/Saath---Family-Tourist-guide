import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../hooks/useLocation';
import { getTouristTips } from '../services/geminiService';
import SearchBar from '../components/SearchBar';

const TouristGuideScreen = () => {
  const { colors } = useTheme();
  const { location, errorMsg, loading: locationLoading } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (location) => {
    setSelectedLocation(location);
    setLoading(true);
    setError(null);
    try {
      const locationTips = await getTouristTips(location);
      setTips(locationTips);
    } catch (err) {
      setError(err.message);
      Alert.alert(
        'Error',
        'Failed to load tourist information. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTipCard = (tip) => (
    <View key={tip.title} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Ionicons name={tip.icon} size={24} color="#007AFF" />
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>
      <Text style={styles.tipContent}>{tip.content}</Text>
    </View>
  );

  if (locationLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Tourist Guide</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.text }]}>
            Loading tourist guide...
          </Text>
        </View>
      </View>
    );
  }

  if (errorMsg || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Tourist Guide</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.messageText, { color: colors.text }]}>
            {errorMsg || error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSearch(location)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading tourist information...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : selectedLocation ? (
          <>
            <Text style={styles.locationTitle}>{selectedLocation}</Text>
            {tips.map(renderTipCard)}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="compass" size={64} color="#007AFF" />
            <Text style={styles.placeholderText}>
              Search for a location to see tourist information
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tipCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  tipContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    padding: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
});

export default TouristGuideScreen; 