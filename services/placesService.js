import { Client } from '@googlemaps/google-maps-services-js';
import { GOOGLE_PLACES_API_KEY, SEARCH_RADIUS } from '../config';

const client = new Client({});

export const searchNearbyPlaces = async (location, searchIntent) => {
  try {
    const { type, keywords, requirements } = searchIntent;
    
    // Construct the search query
    const query = `${type} ${keywords.join(' ')} ${requirements.join(' ')}`;
    
    const response = await client.textSearch({
      params: {
        query,
        location: `${location.latitude},${location.longitude}`,
        radius: SEARCH_RADIUS,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    // Get detailed information for each place
    const places = await Promise.all(
      response.data.results.map(async (place) => {
        const details = await client.placeDetails({
          params: {
            place_id: place.place_id,
            fields: ['name', 'formatted_address', 'rating', 'opening_hours', 'geometry'],
            key: GOOGLE_PLACES_API_KEY,
          },
        });

        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating,
          isOpen: details.data.result.opening_hours?.isOpen() ?? null,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
        };
      })
    );

    return places;
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}; 