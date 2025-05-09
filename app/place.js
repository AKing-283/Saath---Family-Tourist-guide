import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDetails } from '../services/foursquareService';
import { useTheme } from '../context/ThemeContext';

export default function PlaceDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params?.id) {
      setError('Place ID is missing');
      setLoading(false);
      return;
    }
    loadPlaceDetails();
  }, [params?.id]);

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      const details = await getPlaceDetails(params.id);
      setPlace(details);
      setError(null);
    } catch (err) {
      setError('Failed to load place details. Please try again.');
      console.error('Error loading place details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (place?.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleWebsite = () => {
    if (place?.website) {
      Linking.openURL(place.website);
    }
  };

  const handleViewOnMaps = () => {
    if (!place?.location) return;

    const { latitude, longitude } = place.location;
    const label = encodeURIComponent(place.name);

    // Default maps URL based on platform
    const defaultMapsUrl = Platform.select({
      ios: `maps:?q=${label}&ll=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const appleMapsUrl = `https://maps.apple.com/?q=${label}&ll=${latitude},${longitude}`;

    const options = [
      {
        text: 'Default Maps',
        onPress: () => Linking.openURL(defaultMapsUrl),
      }
    ];

    // Add Google Maps as an option
    options.push({
      text: 'Google Maps',
      onPress: () => Linking.openURL(googleMapsUrl),
    });

    // Add Apple Maps only on iOS
    if (Platform.OS === 'ios') {
      options.push({
        text: 'Apple Maps',
        onPress: () => Linking.openURL(appleMapsUrl),
      });
    }

    Alert.alert(
      'View on Maps',
      'Choose your preferred map app',
      [...options, { text: 'Cancel', style: 'cancel' }],
      { cancelable: true }
    );
  };

  const handleDirections = () => {
    if (!place?.location) return;

    const { latitude, longitude } = place.location;
    const label = encodeURIComponent(place.name);

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;

    const options = [
      {
        text: 'Google Maps',
        onPress: () => Linking.openURL(googleMapsUrl),
      }
    ];

    if (Platform.OS === 'ios') {
      options.push({
        text: 'Apple Maps',
        onPress: () => Linking.openURL(appleMapsUrl),
      });
    }

    Alert.alert(
      'Get Directions',
      'Choose your preferred map app',
      [...options, { text: 'Cancel', style: 'cancel' }],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadPlaceDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Place not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {place.photos && place.photos.length > 0 && (
        <Image
          source={{ uri: typeof place.photos[0] === 'string' ? place.photos[0] : place.photos[0].uri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]}>{place.name}</Text>
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.rating, { color: colors.text }]}>
                {place.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Location & Hours
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {place.address}
            </Text>
          </View>
          {place.hours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.hoursContainer}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {place.hours.open_now ? 'Open Now' : 'Closed'}
                </Text>
                {place.hours.regular && place.hours.regular.length > 0 && (
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {' • '}
                    {place.hours.regular[0].display}
                  </Text>
                )}
              </View>
            </View>
          )}
          {place.price !== undefined && (
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Price Level: {'$'.repeat(place.price || 0)}
              </Text>
            </View>
          )}
        </View>

        {place.bestTimeToVisit && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Best Time to Visit
            </Text>
            <View style={styles.bestTimeContainer}>
              {place.bestTimeToVisit.leastBusyHours && (
                <View style={styles.bestTimeItem}>
                  <Text style={[styles.bestTimeLabel, { color: colors.text }]}>
                    Least Busy
                  </Text>
                  <Text style={[styles.bestTimeValue, { color: colors.text }]}>
                    {Array.isArray(place.bestTimeToVisit.leastBusyHours) 
                      ? place.bestTimeToVisit.leastBusyHours.join(', ')
                      : place.bestTimeToVisit.leastBusyHours}
                  </Text>
                </View>
              )}
              {place.bestTimeToVisit.peakHours && (
                <View style={styles.bestTimeItem}>
                  <Text style={[styles.bestTimeLabel, { color: colors.text }]}>
                    Peak Hours
                  </Text>
                  <Text style={[styles.bestTimeValue, { color: colors.text }]}>
                    {Array.isArray(place.bestTimeToVisit.peakHours)
                      ? place.bestTimeToVisit.peakHours.join(', ')
                      : place.bestTimeToVisit.peakHours}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {place.touristTips && place.touristTips.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Tourist Tips
            </Text>
            {place.touristTips.map((tip, index) => (
              <View key={index} style={styles.tipContainer}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {place.accessibility && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Accessibility
            </Text>
            <View style={styles.accessibilityContainer}>
              {place.accessibility.wheelchair && (
                <View style={styles.accessibilityItem}>
                  <Ionicons name="wheelchair-outline" size={20} color={colors.primary} />
                  <Text style={[styles.accessibilityText, { color: colors.text }]}>
                    Wheelchair Accessible
                  </Text>
                </View>
              )}
              {place.accessibility.parking && (
                <View style={styles.accessibilityItem}>
                  <Ionicons name="car-outline" size={20} color={colors.primary} />
                  <Text style={[styles.accessibilityText, { color: colors.text }]}>
                    Parking Available
                  </Text>
                </View>
              )}
              {place.accessibility.publicTransport && (
                <View style={styles.accessibilityItem}>
                  <Ionicons name="bus-outline" size={20} color={colors.primary} />
                  <Text style={[styles.accessibilityText, { color: colors.text }]}>
                    Public Transport Nearby
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {place.nearbyAttractions && place.nearbyAttractions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Nearby Attractions
            </Text>
            {place.nearbyAttractions.map((attraction) => (
              <TouchableOpacity
                key={attraction.id}
                style={styles.attractionItem}
                onPress={() => router.push(`/place?id=${attraction.id}`)}
              >
                <Text style={[styles.attractionName, { color: colors.text }]}>
                  {attraction.name}
                </Text>
                {attraction.category && (
                  <Text style={[styles.attractionCategory, { color: colors.text }]}>
                    {attraction.category}
                  </Text>
                )}
                {attraction.distance && (
                  <Text style={[styles.attractionDistance, { color: colors.text }]}>
                    {(attraction.distance / 1000).toFixed(1)} km away
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleViewOnMaps}
          >
            <Ionicons name="map-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleDirections}
          >
            <Ionicons name="navigate-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>

          {place?.phone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {place?.website && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleWebsite}
            >
              <Ionicons name="globe-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  bestTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bestTimeItem: {
    flex: 1,
    marginRight: 16,
  },
  bestTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bestTimeValue: {
    fontSize: 14,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  accessibilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  accessibilityText: {
    fontSize: 14,
    marginLeft: 8,
  },
  attractionItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  attractionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  attractionCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  attractionDistance: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hoursContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 12,
  },
}); 