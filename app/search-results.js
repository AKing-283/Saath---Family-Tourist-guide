import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import {
  FOURSQUARE_API_KEY,
  FOURSQUARE_API_URL,
  FOURSQUARE_API_VERSION,
  SEARCH_RADIUS,
  DEFAULT_LOCATION,
} from '../config';

const { width, height } = Dimensions.get('window');
const FAVORITES_STORAGE_KEY = '@favorites';
const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchResultsScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [placeDetails, setPlaceDetails] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'distance', // 'distance', 'rating', 'price'
    priceRange: [1, 4],
    openNow: false,
    category: null,
  });
  const [searchInput, setSearchInput] = useState(query || '');

  useEffect(() => {
    loadFavorites();
    loadRecentSearches();
    getLocation();
  }, []);

  useEffect(() => {
    if (query && location) {
      searchPlaces(query);
      addToRecentSearches(query);
    }
  }, [query, location]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const addToRecentSearches = async (searchQuery) => {
    try {
      const newSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)]
        .slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(newSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLocation(DEFAULT_LOCATION);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (err) {
      setError('Failed to get location');
      setLocation(DEFAULT_LOCATION);
      console.error(err);
    }
  };

  const searchPlaces = async (searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      const { latitude, longitude } = location?.coords || DEFAULT_LOCATION;
      
      const response = await fetch(
        `${FOURSQUARE_API_URL}/places/search?query=${encodeURIComponent(
          searchQuery
        )}&ll=${latitude},${longitude}&radius=${SEARCH_RADIUS}&limit=20&fields=fsq_id,name,location,rating,stats,price,tel,website,categories,hours,geocodes`,
        {
          headers: {
            'Authorization': FOURSQUARE_API_KEY,
            'Accept': 'application/json',
            'X-API-Version': FOURSQUARE_API_VERSION,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Process and validate coordinates
        const processedPlaces = data.results.map(place => ({
          ...place,
          location: {
            ...place.location,
            latitude: place.geocodes?.main?.latitude || place.location.latitude,
            longitude: place.geocodes?.main?.longitude || place.location.longitude,
          }
        })).filter(place => {
          const lat = parseFloat(place.location.latitude);
          const lng = parseFloat(place.location.longitude);
          return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        });

        setPlaces(processedPlaces);
      } else {
        setPlaces([]);
        setError('No places found');
      }
    } catch (err) {
      setError('Failed to fetch places');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `${FOURSQUARE_API_URL}/places/${placeId}?fields=hours,website,tel`,
        {
          headers: {
            'Authorization': FOURSQUARE_API_KEY,
            'Accept': 'application/json',
            'X-API-Version': FOURSQUARE_API_VERSION,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch place details');

      const data = await response.json();
      setPlaceDetails(prev => ({
        ...prev,
        [placeId]: data,
      }));
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const toggleFavorite = async (placeId) => {
    try {
      const place = places.find(p => p.fsq_id === placeId);
      if (!place) return;

      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      const currentFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      const isFavorite = currentFavorites.some(fav => fav.fsq_id === placeId);
      const newFavorites = isFavorite
        ? currentFavorites.filter(fav => fav.fsq_id !== placeId)
        : [...currentFavorites, place];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const openInMaps = (place) => {
    const { latitude, longitude } = place.location;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    Linking.openURL(url);
  };

  const openWebsite = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const openPhone = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half-star" name="star-half" size={16} color="#FFD700" />
      );
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }
    return stars;
  };

  const getCategoryIcon = (categories) => {
    if (!categories || categories.length === 0) return 'location';
    
    const mainCategory = categories[0];
    const categoryName = mainCategory.name.toLowerCase();
    
    if (categoryName.includes('restaurant') || categoryName.includes('food')) return 'restaurant';
    if (categoryName.includes('cafe') || categoryName.includes('coffee')) return 'cafe';
    if (categoryName.includes('hotel') || categoryName.includes('lodging')) return 'bed';
    if (categoryName.includes('shop') || categoryName.includes('store')) return 'cart';
    if (categoryName.includes('park') || categoryName.includes('garden')) return 'leaf';
    if (categoryName.includes('museum') || categoryName.includes('gallery')) return 'images';
    if (categoryName.includes('bar') || categoryName.includes('pub')) return 'wine';
    
    return 'location';
  };

  const applyFilters = (places) => {
    let filtered = [...places];

    // Apply price range filter
    filtered = filtered.filter(place => 
      place.price >= filters.priceRange[0] && 
      place.price <= filters.priceRange[1]
    );

    // Apply open now filter
    if (filters.openNow) {
      filtered = filtered.filter(place => 
        placeDetails[place.fsq_id]?.hours?.isOpen
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(place =>
        place.categories?.some(cat => 
          cat.name.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'distance':
      default:
        // Already sorted by distance from Foursquare API
        break;
    }

    return filtered;
  };

  const renderPlaceCard = ({ item }) => {
    const isFavorite = favorites.some(fav => fav.fsq_id === item.fsq_id);
    const details = placeDetails[item.fsq_id];
    const category = item.categories?.[0]?.name || 'Place';
    const rating = item.rating ? (item.rating / 2).toFixed(1) : null;
    const price = item.price ? '💰'.repeat(item.price) : null;
    const isFamilyFriendly = details?.attributes?.some(attr => 
      attr.name.toLowerCase().includes('family') || 
      attr.name.toLowerCase().includes('kid') ||
      attr.name.toLowerCase().includes('child')
    );

    return (
      <TouchableOpacity
        style={[styles.placeCard, { backgroundColor: colors.cardBackground }]}
        onPress={() => {
          setSelectedPlace(item);
          setShowDetailsModal(true);
          if (!placeDetails[item.fsq_id]) {
            fetchPlaceDetails(item.fsq_id);
          }
        }}
      >
        <View style={styles.placeInfo}>
          <View style={styles.placeHeader}>
            <View style={styles.titleContainer}>
              <View style={styles.nameRow}>
                <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {isFamilyFriendly && (
                  <View style={styles.familyBadge}>
                    <Ionicons name="people" size={14} color="#4CAF50" />
                    <Text style={styles.familyText}>Family Friendly</Text>
                  </View>
                )}
              </View>
              <View style={styles.categoryContainer}>
                <Ionicons 
                  name={getCategoryIcon(item.categories)} 
                  size={16} 
                  color={colors.primary} 
                  style={styles.categoryIcon}
                />
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                  {category}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.fsq_id)}
              style={styles.favoriteButton}
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
                {item.location.address || 'Address not available'}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              {rating && (
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {rating}/5
                  </Text>
                </View>
              )}
              {price && (
                <View style={styles.statItem}>
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {price}
                  </Text>
                </View>
              )}
              {details?.hours?.isOpen !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons 
                    name={details.hours.isOpen ? 'time' : 'time-outline'} 
                    size={16} 
                    color={details.hours.isOpen ? '#4CAF50' : '#FF3B30'} 
                  />
                  <Text style={[
                    styles.statText, 
                    { color: details.hours.isOpen ? '#4CAF50' : '#FF3B30' }
                  ]}>
                    {details.hours.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHours = (hours) => {
    if (!hours || !hours.regular) return null;

    const today = new Date().getDay();
    const todayHours = hours.regular.find(h => h.day === today);
    
    if (!todayHours) return null;

    return (
      <View style={styles.detailRow}>
        <Ionicons name="time" size={20} color={colors.primary} />
        <Text style={[styles.detailText, { color: colors.text }]}>
          {`${todayHours.open} - ${todayHours.close}`}
        </Text>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Sort by:</Text>
        <View style={styles.filterOptions}>
          {['distance', 'rating', 'price'].map((option) => (
            <TouchableOpacity
              key={`sort-${option}`}
              style={[
                styles.filterOption,
                filters.sortBy === option && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilters(prev => ({ ...prev, sortBy: option }))}
            >
              <Text style={[
                styles.filterOptionText,
                { color: filters.sortBy === option ? '#fff' : colors.text }
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range:</Text>
        <View style={styles.priceRange}>
          {[1, 2, 3, 4].map((price) => (
            <TouchableOpacity
              key={`price-${price}`}
              style={[
                styles.priceButton,
                price >= filters.priceRange[0] && price <= filters.priceRange[1] && 
                { backgroundColor: colors.primary }
              ]}
              onPress={() => {
                if (price === filters.priceRange[0]) {
                  setFilters(prev => ({ ...prev, priceRange: [price + 1, prev.priceRange[1]] }));
                } else if (price === filters.priceRange[1]) {
                  setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], price - 1] }));
                } else {
                  setFilters(prev => ({ ...prev, priceRange: [price, price] }));
                }
              }}
            >
              <Text style={[
                styles.priceButtonText,
                { color: price >= filters.priceRange[0] && price <= filters.priceRange[1] ? '#fff' : colors.text }
              ]}>
                {'$'.repeat(price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.filterToggle, filters.openNow && { backgroundColor: colors.primary }]}
        onPress={() => setFilters(prev => ({ ...prev, openNow: !prev.openNow }))}
      >
        <Text style={[styles.filterToggleText, { color: filters.openNow ? '#fff' : colors.text }]}>
          Open Now
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecentSearches = () => (
    <View style={[styles.recentSearchesContainer, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.recentSearchesHeader}>
        <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>Recent Searches</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      {recentSearches.map((search, index) => (
        <TouchableOpacity
          key={index}
          style={styles.recentSearchItem}
          onPress={() => {
            setSearchInput(search);
            searchPlaces(search);
          }}
        >
          <Ionicons name="time-outline" size={20} color={colors.text} />
          <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search places..."
            placeholderTextColor={colors.textSecondary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => searchPlaces(searchInput)}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "options" : "options-outline"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {showFilters && renderFilters()}
      
      {!query && recentSearches.length > 0 && renderRecentSearches()}

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === 'map' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons
            name="map"
            size={20}
            color={viewMode === 'map' ? 'white' : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            viewMode === 'list' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewMode === 'list' ? 'white' : colors.text}
          />
        </TouchableOpacity>
      </View>

      {viewMode === 'map' && mapRegion && (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {places.map((place) => {
              // Ensure coordinates are valid numbers
              const latitude = parseFloat(place.location.latitude);
              const longitude = parseFloat(place.location.longitude);
              
              if (isNaN(latitude) || isNaN(longitude)) {
                console.warn('Invalid coordinates for place:', place.name);
                return null;
              }

              return (
                <Marker
                  key={place.fsq_id}
                  coordinate={{
                    latitude,
                    longitude,
                  }}
                  title={place.name}
                  description={place.location.address}
                  onPress={() => {
                    setSelectedPlace(place);
                    setShowDetailsModal(true);
                    if (!placeDetails[place.fsq_id]) {
                      fetchPlaceDetails(place.fsq_id);
                    }
                  }}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.marker,
                      selectedPlace?.fsq_id === place.fsq_id && styles.selectedMarker
                    ]}>
                      <Text style={styles.markerText}>
                        {place.name.charAt(0)}
                      </Text>
                    </View>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={applyFilters(places)}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.fsq_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No places found
            </Text>
          }
        />
      )}

      {selectedPlace && (
        <Modal
          visible={showDetailsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedPlace.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDetailsModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      {selectedPlace.location.address}
                    </Text>
                  </View>

                  {selectedPlace.rating && (
                    <View style={styles.detailRow}>
                      <Ionicons name="star" size={20} color={colors.primary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedPlace.rating.toFixed(1)}/10
                      </Text>
                    </View>
                  )}

                  {selectedPlace.price && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={20} color={colors.primary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {'$'.repeat(selectedPlace.price)}
                      </Text>
                    </View>
                  )}

                  {selectedPlace.categories && selectedPlace.categories.length > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name={getCategoryIcon(selectedPlace.categories)} size={20} color={colors.primary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {selectedPlace.categories[0].name}
                      </Text>
                    </View>
                  )}

                  {placeDetails[selectedPlace.fsq_id]?.hours && renderHours(placeDetails[selectedPlace.fsq_id].hours)}

                  {placeDetails[selectedPlace.fsq_id]?.tel && (
                    <TouchableOpacity
                      style={styles.detailRow}
                      onPress={() => openPhone(placeDetails[selectedPlace.fsq_id].tel)}
                    >
                      <Ionicons name="call" size={20} color={colors.primary} />
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {placeDetails[selectedPlace.fsq_id].tel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => openInMaps(selectedPlace)}
                  >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>

                  {placeDetails[selectedPlace.fsq_id]?.website && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => openWebsite(placeDetails[selectedPlace.fsq_id].website)}
                    >
                      <Ionicons name="globe" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Website</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => toggleFavorite(selectedPlace.fsq_id)}
                  >
                    <Ionicons
                      name={favorites.some(fav => fav.fsq_id === selectedPlace.fsq_id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.actionButtonText}>
                      {favorites.some(fav => fav.fsq_id === selectedPlace.fsq_id) ? 'Remove' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  filterButton: {
    padding: 8,
  },
  themeButton: {
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  mapContainer: {
    height: height * 0.4,
    width: width,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    padding: 8,
    maxWidth: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  placeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  placeInfo: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
  },
  favoriteButton: {
    padding: 4,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  address: {
    fontSize: 14,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  filtersContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterRow: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 14,
  },
  priceRange: {
    flexDirection: 'row',
    gap: 10,
  },
  priceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  priceButtonText: {
    fontSize: 14,
  },
  filterToggle: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  filterToggleText: {
    fontSize: 14,
  },
  recentSearchesContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  recentSearchText: {
    fontSize: 14,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedMarker: {
    backgroundColor: '#1A237E',
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  familyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  familyText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
}); 