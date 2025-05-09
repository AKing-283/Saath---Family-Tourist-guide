import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlaceDetailsScreen = ({ route, navigation }) => {
  const { place } = route.params;

  const handleCall = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleDirections = () => {
    const { latitude, longitude } = place.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleOpenMaps = () => {
    const { latitude, longitude } = place.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.ratingContainer}>
          {place.rating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
            </View>
          )}
          {place.isOpen !== null && (
            <Text style={[styles.status, place.isOpen ? styles.open : styles.closed]}>
              {place.isOpen ? '🟢 Open Now' : '🔴 Closed'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>{place.address}</Text>
          <Text style={styles.distance}>
            <Ionicons name="location" size={16} color="#666" /> {place.distance}m away
          </Text>
        </View>

        {place.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <Text style={styles.hours}>{place.hours}</Text>
          </View>
        )}

        {place.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>
        )}

        {place.tips && place.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            {place.tips.map((tip, index) => (
              <View key={index} style={styles.tip}>
                <Ionicons name="chatbubble-outline" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {place.phone && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
          <Ionicons name="navigate" size={24} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps}>
          <Ionicons name="map" size={24} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Open in Maps</Text>
        </TouchableOpacity>
        {place.website && (
          <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
            <Ionicons name="globe" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginLeft: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  open: {
    color: '#4CAF50',
  },
  closed: {
    color: '#E53E3E',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  hours: {
    fontSize: 14,
    color: '#4A5568',
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
});

export default PlaceDetailsScreen; 