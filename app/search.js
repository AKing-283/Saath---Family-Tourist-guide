import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from './context/ThemeContext';

const FAMILY_CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', icon: 'restaurant' },
  { id: 'attractions', name: 'Attractions', icon: 'compass' },
  { id: 'parks', name: 'Parks', icon: 'leaf' },
  { id: 'museums', name: 'Museums', icon: 'school' },
  { id: 'shopping', name: 'Shopping', icon: 'cart' },
  { id: 'hotels', name: 'Hotels', icon: 'bed' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller' },
  { id: 'education', name: 'Education', icon: 'book' },
];

const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('restaurants');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [places, setPlaces] = useState([]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.foursquare.com/v3/places/search?query=${searchQuery}&categories=${selectedCategory}&limit=10`);
      const data = await response.json();
      setPlaces(data.results);
    } catch (e) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const renderPlaceCard = ({ item }) => (
    <View style={[localStyles.placeCard, { backgroundColor: colors.cardBackground }]}>
      {/* Render your place card component here */}
    </View>
  );

  return (
    <View style={[localStyles.container, { backgroundColor: colors.background }]}>
      <View style={localStyles.header}>
        <Text style={[localStyles.title, { color: colors.text }]}>
          Where shall we go together?
        </Text>
        <Text style={[localStyles.subtitle, { color: colors.textSecondary }]}>
          Discover family-friendly places around you
        </Text>
      </View>

      <View style={localStyles.searchContainer}>
        <View style={[localStyles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[localStyles.searchInput, { color: colors.text }]}
            placeholder="Search for places..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={localStyles.categoriesContainer}
        >
          {FAMILY_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                localStyles.categoryButton,
                selectedCategory === category.id && localStyles.selectedCategory,
                { backgroundColor: colors.cardBackground }
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  localStyles.categoryText,
                  {
                    color: selectedCategory === category.id
                      ? colors.primary
                      : colors.textSecondary,
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={localStyles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[localStyles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[localStyles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Text style={localStyles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={places}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.fsq_id}
          contentContainerStyle={localStyles.placesList}
          ListEmptyComponent={
            <View style={localStyles.emptyContainer}>
              <Ionicons name="map" size={48} color={colors.textSecondary} />
              <Text style={[localStyles.emptyText, { color: colors.text }]}>
                No places found
              </Text>
              <Text style={[localStyles.emptySubtext, { color: colors.textSecondary }]}>
                Try searching for something else
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  placesList: {
    padding: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default SearchScreen; 