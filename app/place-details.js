import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaceDetailsScreen = () => {
  const { placeId } = useLocalSearchParams();
  const [place, setPlace] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPlaceDetails();
    checkFavoriteStatus();
  }, [placeId]);

  const loadPlaceDetails = async () => {
    try {
      // In a real app, you would fetch place details from an API
      // For now, we'll get it from favorites
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        const placeDetails = favorites.find(p => p.id === placeId);
        if (placeDetails) {
          setPlace(placeDetails);
        } else {
          Alert.alert('Error', 'Place not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading place details:', error);
      Alert.alert('Error', 'Failed to load place details');
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        setIsFavorite(favorites.some(p => p.id === placeId));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        favorites = favorites.filter(p => p.id !== placeId);
      } else {
        favorites.push(place);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (!place) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading place details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF3B30' : '#333'}
          />
        </TouchableOpacity>
      </View>

      {place.image && (
        <Image
          source={{ uri: place.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address}>{place.address}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{place.description}</Text>
        </View>

        {place.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{place.rating}</Text>
            </View>
          </View>
        )}

        {place.openingHours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <Text style={styles.openingHours}>{place.openingHours}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  openingHours: {
    fontSize: 16,
    color: '#666',
  },
});

export default PlaceDetailsScreen; 