import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { searchNearbyPlaces } from '../services/foursquareService';
import PlaceCard from '../components/PlaceCard';

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { location, error: locationError, loading: locationLoading } = useLocation();

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (!location) {
        throw new Error('Location not available. Please enable location services.');
      }
      
      const results = await searchNearbyPlaces(location, query);
      if (results.length === 0) {
        setError('No places found. Try a different search term.');
      } else {
        setPlaces(results);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Error searching for places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { place });
  };

  const handleMapView = () => {
    navigation.navigate('MapView', { places });
  };

  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="location-off" size={48} color="#E53E3E" />
          <Text style={styles.errorText}>{locationError}</Text>
          <Text style={styles.errorSubtext}>
            Please enable location services to use this app
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search for places..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic" size={24} color="#4A5568" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!query.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Searching nearby places...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#E53E3E" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : places.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{places.length} places found</Text>
            <TouchableOpacity style={styles.mapButton} onPress={handleMapView}>
              <Ionicons name="map" size={20} color="#4CAF50" />
              <Text style={styles.mapButtonText}>Map View</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.resultsContainer}>
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onPress={() => handlePlacePress(place)}
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#4A5568" />
          <Text style={styles.emptyText}>
            Search for places to get started
          </Text>
          <Text style={styles.emptySubtext}>
            Try searching for restaurants, cafes, or attractions
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1A202C',
  },
  micButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  errorSubtext: {
    color: '#4A5568',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#4A5568',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultsCount: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  mapButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsContainer: {
    flex: 1,
  },
});

export default HomeScreen; 