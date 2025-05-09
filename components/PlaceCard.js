import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const PlaceCard = ({ place, onPress }) => {
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, [place.id]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoritesArray = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoritesArray.includes(place.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoritesArray = favoritesArray.filter(id => id !== place.id);
      } else {
        favoritesArray.push(place.id);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!place) return null;

  const formatDistance = (meters) => {
    if (!meters) return '';
    const km = meters / 1000;
    return km < 1 
      ? `${Math.round(meters)}m`
      : `${km.toFixed(1)}km`;
  };

  const getPriceLevel = (price) => {
    if (!price) return '';
    return '💰'.repeat(price);
  };

  const getPopularityIcon = (rating) => {
    if (!rating) return 'star-outline';
    if (rating >= 8) return 'star';
    if (rating >= 6) return 'star-half';
    return 'star-outline';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {place.name}
            </Text>
            {place.category && (
              <Text style={[styles.category, { color: colors.primary }]}>
                {place.category}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
              {place.address}
            </Text>
          </View>
          
          {place.distance && (
            <View style={styles.detailRow}>
              <Ionicons name="navigate" size={16} color={colors.textSecondary} />
              <Text style={[styles.distance, { color: colors.textSecondary }]}>
                {formatDistance(place.distance)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  address: {
    fontSize: 14,
    flex: 1,
  },
  distance: {
    fontSize: 14,
  },
});

export default PlaceCard;
 