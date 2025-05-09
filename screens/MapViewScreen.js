import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import PlaceCard from '../components/PlaceCard';

const { width, height } = Dimensions.get('window');

const MapViewScreen = ({ route, navigation }) => {
  const { places } = route.params;
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef(null);

  const initialRegion = {
    latitude: places[0]?.location?.latitude || 0,
    longitude: places[0]?.location?.longitude || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
    mapRef.current?.animateToRegion({
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handlePlacePress = (place) => {
    navigation.navigate('PlaceDetails', { place });
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.location.latitude,
              longitude: place.location.longitude,
            }}
            onPress={() => handleMarkerPress(place)}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                selectedPlace?.id === place.id && styles.selectedMarker
              ]}>
                <Text style={styles.markerText}>
                  {place.name.charAt(0)}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1A202C" />
      </TouchableOpacity>

      {selectedPlace && (
        <View style={styles.bottomDrawer}>
          <View style={styles.drawerHandle} />
          <PlaceCard
            place={selectedPlace}
            onPress={() => handlePlacePress(selectedPlace)}
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePlacePress(selectedPlace)}
            >
              <Ionicons name="information-circle" size={24} color="#4CAF50" />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                const { latitude, longitude } = selectedPlace.location;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                Linking.openURL(url);
              }}
            >
              <Ionicons name="navigate" size={24} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
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
  map: {
    width,
    height,
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default MapViewScreen; 