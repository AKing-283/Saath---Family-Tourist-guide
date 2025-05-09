import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // First, check if we have permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied. Please enable location services in your device settings.');
          setLoading(false);
          return;
        }

        // Get the current position
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 15000,
        });

        // Get the address information
        const [address] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        setLocation({
          coords: currentLocation.coords,
          address: address ? {
            city: address.city,
            country: address.country,
            district: address.district,
            isoCountryCode: address.isoCountryCode,
            name: address.name,
            postalCode: address.postalCode,
            region: address.region,
            street: address.street,
            streetNumber: address.streetNumber,
            subregion: address.subregion,
            timezone: address.timezone,
          } : null,
        });
        setErrorMsg(null);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Unable to get your location. Please check your device settings and try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshLocation = async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation({
        coords: currentLocation.coords,
        address: address ? {
          city: address.city,
          country: address.country,
          district: address.district,
          isoCountryCode: address.isoCountryCode,
          name: address.name,
          postalCode: address.postalCode,
          region: address.region,
          street: address.street,
          streetNumber: address.streetNumber,
          subregion: address.subregion,
          timezone: address.timezone,
        } : null,
      });
      setErrorMsg(null);
    } catch (error) {
      console.error('Error refreshing location:', error);
      setErrorMsg('Unable to refresh location. Please check your device settings and try again.');
    } finally {
      setLoading(false);
    }
  };

  return { location, errorMsg, loading, refreshLocation };
}; 