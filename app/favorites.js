import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const FAVORITES_STORAGE_KEY = '@favorites';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      setError(null);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (placeId) => {
    try {
      const newFavorites = favorites.filter(place => place.fsq_id !== placeId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handlePlacePress = (place) => {
    router.push({
      pathname: '/place-details',
      params: { placeId: place.fsq_id }
    });
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handlePlacePress(item)}
    >
      <View style={styles.favoriteInfo}>
        <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.location?.address || 'Address not available'}
        </Text>
        <View style={styles.statsContainer}>
          {item.rating && (
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {(item.rating / 2).toFixed(1)}/5
              </Text>
            </View>
          )}
          {item.price && (
            <View style={styles.statItem}>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {'💰'.repeat(item.price)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.fsq_id)}
      >
        <Ionicons name="heart" size={24} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.text }]}>
            Loading favorites...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.messageText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadFavorites}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="heart" size={48} color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.text }]}>
            No favorites yet. Start adding places to your favorites!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your saved places
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.fsq_id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  listContent: {
    padding: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  favoriteInfo: {
    flex: 1,
    marginRight: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
}); 