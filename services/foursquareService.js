import {
  FOURSQUARE_API_KEY,
  FOURSQUARE_API_VERSION,
  FOURSQUARE_API_URL,
  SEARCH_RADIUS,
} from '../config';

const headers = {
  'Accept': 'application/json',
  'Authorization': FOURSQUARE_API_KEY
};

export const searchNearbyPlaces = async (location, query = '') => {
  try {
    const params = new URLSearchParams({
      query: query,
      ll: `${location.coords.latitude},${location.coords.longitude}`,
      radius: SEARCH_RADIUS,
      sort: 'RATING',
      limit: '50',
      v: FOURSQUARE_API_VERSION,
      fields: 'fsq_id,name,location,categories,stats,rating,price,tel,website,hours,photos,geocodes,features'
    });

    const response = await fetch(`${FOURSQUARE_API_URL}/places/search?${params}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch places');
    }

    return data.results.map(place => ({
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      categories: place.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      })) || [],
      rating: place.rating || 0,
      price: place.price || 0,
      stats: place.stats || {},
      contact: {
        phone: place.tel,
        website: place.website
      },
      hours: place.hours || {},
      photos: place.photos || [],
      features: place.features || [],
      coordinates: {
        latitude: place.geocodes?.main?.latitude,
        longitude: place.geocodes?.main?.longitude
      },
      bestTimeToVisit: calculateBestTimeToVisit(place.hours),
      touristTips: generateTouristTips(place),
      accessibility: getAccessibilityInfo(place)
    }));
  } catch (error) {
    console.error('Foursquare API error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const params = new URLSearchParams({
      v: FOURSQUARE_API_VERSION,
      fields: 'fsq_id,name,location,categories,stats,rating,price,tel,website,hours,photos,geocodes,features'
    });

    const response = await fetch(`${FOURSQUARE_API_URL}/places/${placeId}?${params}`, { headers });
    const place = await response.json();

    if (!response.ok) {
      throw new Error(place.message || 'Failed to fetch place details');
    }

    // Get nearby attractions
    const nearbyAttractions = await getNearbyAttractions(place.geocodes.main);

    return {
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      categories: place.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      })) || [],
      rating: place.rating || 0,
      price: place.price || 0,
      stats: place.stats || {},
      contact: {
        phone: place.tel,
        website: place.website
      },
      hours: place.hours || {},
      photos: place.photos || [],
      features: place.features || [],
      coordinates: {
        latitude: place.geocodes?.main?.latitude,
        longitude: place.geocodes?.main?.longitude
      },
      bestTimeToVisit: calculateBestTimeToVisit(place.hours),
      touristTips: generateTouristTips(place),
      accessibility: getAccessibilityInfo(place),
      nearbyAttractions
    };
  } catch (error) {
    console.error('Foursquare API error:', error);
    throw error;
  }
};

const calculateBestTimeToVisit = (hours) => {
  if (!hours || !hours.regular) {
    return {
      recommended: 'Morning (9 AM - 11 AM)',
      reason: 'Based on typical tourist patterns'
    };
  }

  const regularHours = hours.regular;
  const currentDay = new Date().getDay();
  const todayHours = regularHours.find(h => h.day === currentDay);

  if (!todayHours) {
    return {
      recommended: 'Morning (9 AM - 11 AM)',
      reason: 'Based on typical tourist patterns'
    };
  }

  const openTime = new Date(`1970-01-01T${todayHours.open}`);
  const closeTime = new Date(`1970-01-01T${todayHours.close}`);
  const totalHours = (closeTime - openTime) / (1000 * 60 * 60);

  let recommendedTime;
  let reason;

  if (totalHours <= 4) {
    recommendedTime = 'Early morning';
    reason = 'Short operating hours';
  } else if (totalHours <= 8) {
    recommendedTime = 'Mid-morning to early afternoon';
    reason = 'Moderate operating hours';
  } else {
    recommendedTime = 'Late morning to early evening';
    reason = 'Extended operating hours';
  }

  return {
    recommended: recommendedTime,
    reason
  };
};

const generateTouristTips = (place) => {
  const tips = [];

  // Add tips based on features
  if (place.features && Array.isArray(place.features)) {
    if (place.features.includes('wheelchair_accessible')) {
      tips.push('Wheelchair accessible');
    }
    if (place.features.includes('parking')) {
      tips.push('Parking available');
    }
    if (place.features.includes('public_transport')) {
      tips.push('Near public transport');
    }
  }

  // Add tips based on hours
  if (place.hours && place.hours.regular) {
    const currentDay = new Date().getDay();
    const todayHours = place.hours.regular.find(h => h.day === currentDay);
    if (todayHours) {
      tips.push(`Open today from ${todayHours.open} to ${todayHours.close}`);
    }
  }

  // Add tips based on price
  if (place.price) {
    const priceLevel = '💰'.repeat(place.price);
    tips.push(`Price level: ${priceLevel}`);
  }

  return tips;
};

const getAccessibilityInfo = (place) => {
  const info = {
    wheelchairAccessible: false,
    parking: false,
    publicTransport: false
  };

  if (place.features && Array.isArray(place.features)) {
    info.wheelchairAccessible = place.features.includes('wheelchair_accessible');
    info.parking = place.features.includes('parking');
    info.publicTransport = place.features.includes('public_transport');
  }

  return info;
};

const getNearbyAttractions = async (coordinates) => {
  try {
    const params = new URLSearchParams({
      ll: `${coordinates.latitude},${coordinates.longitude}`,
      radius: '1000',
      sort: 'RATING',
      limit: '5',
      v: FOURSQUARE_API_VERSION,
      fields: 'fsq_id,name,location,categories,rating,photos'
    });

    const response = await fetch(`${FOURSQUARE_API_URL}/places/search?${params}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch nearby attractions');
    }

    return data.results.map(place => ({
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      categories: place.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      })) || [],
      rating: place.rating || 0,
      photos: place.photos || []
    }));
  } catch (error) {
    console.error('Error fetching nearby attractions:', error);
    return [];
  }
}; 