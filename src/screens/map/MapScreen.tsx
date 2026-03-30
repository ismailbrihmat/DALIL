import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { useTripStore } from '@store/tripStore';
import { openInGoogleMaps } from '@components/common/DetailModal';

const { width, height } = Dimensions.get('window');

// Mock coordinates for Fès locations (approximate)
const LOCATION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'Fès El Bali': { latitude: 34.0633, longitude: -4.9780 },
  'Medina': { latitude: 34.0633, longitude: -4.9780 },
  'Fès El-Bali Medina': { latitude: 34.0633, longitude: -4.9780 },
  'Fès Jdid': { latitude: 34.0461, longitude: -4.9962 },
  'City Walls': { latitude: 34.0616, longitude: -4.9838 },
  'Ain Nokbi': { latitude: 34.0289, longitude: -5.0064 },
  'Meknès Region': { latitude: 33.8950, longitude: -5.5547 },
  'Riad Terrace': { latitude: 34.0630, longitude: -4.9775 },
  'Between Fès El Bali and Jedid': { latitude: 34.0550, longitude: -4.9870 },
  'Batha': { latitude: 34.0600, longitude: -4.9800 },
  'Chouara': { latitude: 34.0668, longitude: -4.9734 },
  'Palais Faraj': { latitude: 34.0620, longitude: -4.9780 },
  'Riad Fès': { latitude: 34.0625, longitude: -4.9790 },
  'Borj Nord': { latitude: 34.0700, longitude: -4.9820 },
  'Al-Attarine Madrasa': { latitude: 34.0655, longitude: -4.9740 },
  'Nejjarine Museum': { latitude: 34.0650, longitude: -4.9745 },
  'Jnan Sbil Gardens': { latitude: 34.0580, longitude: -4.9800 },
  'Royal Palace Gates': { latitude: 34.0520, longitude: -4.9950 },
  'Bab Bou Jeloud': { latitude: 34.0625, longitude: -4.9780 },
  'Chouara Tannery': { latitude: 34.0668, longitude: -4.9734 },
  'Dar El Makhzen': { latitude: 34.0520, longitude: -4.9950 },
  'Riad Laarous': { latitude: 34.0618, longitude: -4.9795 },
  'Fès-Saïss Airport': { latitude: 33.9271, longitude: -4.9776 },
};

// Default Fès coordinates
const FES_REGION = {
  latitude: 34.0633,
  longitude: -4.9780,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

interface MapLocation {
  id: string;
  name: string;
  type: string;
  coordinate: { latitude: number; longitude: number };
  description?: string;
}

const MapScreen: React.FC = () => {
  const { config, selectedItinerary, itineraries } = useTripStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const activeItinerary = selectedItinerary || (itineraries && itineraries[0]);

  // Helper function to get price range text - must be defined before use
  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'budget': return '💰';
      case 'moderate': return '💰💰';
      case 'expensive': return '💰💰💰';
      default: return '';
    }
  };

  if (!activeItinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Map Available</Text>
          <Text style={styles.emptyText}>
            Configure your trip first to see locations on the map.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Build locations with coordinates - include accommodation, activities, and restaurants
  const mapLocations: MapLocation[] = [
    {
      id: 'accommodation',
      name: activeItinerary.accommodation.name,
      type: 'hotel',
      coordinate: LOCATION_COORDINATES[activeItinerary.accommodation.location] || FES_REGION,
      description: `${activeItinerary.accommodation.type} in ${activeItinerary.accommodation.location}`,
    },
    ...activeItinerary.activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      type: activity.type,
      coordinate: activity.coordinates || LOCATION_COORDINATES[activity.location] || {
        latitude: FES_REGION.latitude + (Math.random() - 0.5) * 0.01,
        longitude: FES_REGION.longitude + (Math.random() - 0.5) * 0.01,
      },
      description: activity.description,
    })),
    ...(activeItinerary.restaurants?.map((restaurant) => ({
      id: `restaurant-${restaurant.id}`,
      name: restaurant.name,
      type: 'food',
      coordinate: restaurant.coordinates || LOCATION_COORDINATES[restaurant.location] || {
        latitude: FES_REGION.latitude + (Math.random() - 0.5) * 0.01,
        longitude: FES_REGION.longitude + (Math.random() - 0.5) * 0.01,
      },
      description: `${restaurant.cuisine} • ${getPriceRangeText(restaurant.priceRange)}`,
    })) || []),
  ];

  // Get marker color based on type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return '#C65D3B';
      case 'culture':
      case 'cultural':
        return '#1B365D';
      case 'food':
        return '#C9A961';
      case 'shopping':
        return '#A66D4A';
      case 'nature':
        return '#22C55E';
      case 'history':
        return '#724838';
      case 'wellness':
        return '#EC4899';
      case 'excursion':
        return '#8B5CF6';
      default:
        return '#5D3C30';
    }
  };

  // Get marker icon based on type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return '🏨';
      case 'culture':
      case 'cultural':
        return '🏛️';
      case 'food':
        return '🍽️';
      case 'shopping':
        return '🛍️';
      case 'nature':
        return '🌿';
      case 'history':
        return '📜';
      case 'wellness':
        return '💆';
      case 'excursion':
        return '🚌';
      default:
        return '📍';
    }
  };

  const handleMarkerPress = (location: MapLocation) => {
    setSelectedLocation(location.id);
  };

  const handleGetDirections = (location: MapLocation) => {
    openInGoogleMaps(undefined, `${location.name}, ${config.destination}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={FES_REGION}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {mapLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={location.coordinate}
              pinColor={getMarkerColor(location.type)}
              onPress={() => handleMarkerPress(location)}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(location.type) }]}>
                <Text style={styles.markerIcon}>{getMarkerIcon(location.type)}</Text>
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{location.name}</Text>
                  <Text style={styles.calloutType}>
                    {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                  </Text>
                  {location.description && (
                    <Text style={styles.calloutDescription}>{location.description}</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}

          {/* Draw route line connecting locations */}
          <Polyline
            coordinates={mapLocations.map((loc) => loc.coordinate)}
            strokeColor="#C65D3B"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapTypeButton}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Text style={styles.mapTypeButtonText}>
              {mapType === 'standard' ? '🛰️' : '🗺️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Count Badge */}
        <View style={styles.locationCountBadge}>
          <Text style={styles.locationCountText}>
            {mapLocations.length} locations
          </Text>
        </View>
      </View>

      {/* Bottom Sheet - Location List */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{config.destination}</Text>
          <Text style={styles.bottomSheetSubtitle}>
            Tap a marker to see details
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationsList}
        >
          {mapLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationChip,
                selectedLocation === location.id && styles.locationChipSelected,
              ]}
              onPress={() => handleGetDirections(location)}
            >
              <Text style={styles.locationChipIcon}>
                {getMarkerIcon(location.type)}
              </Text>
              <View style={styles.locationChipInfo}>
                <Text style={styles.locationChipName} numberOfLines={1}>
                  {location.name}
                </Text>
                <Text style={styles.locationChipType}>
                  {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transport Section */}
        <View style={styles.transportSection}>
          <Text style={styles.transportTitle}>Transport Routes</Text>
          <ScrollView style={styles.transportList}>
            {activeItinerary.transport.map((segment, index) => (
              <View key={index} style={styles.transportItem}>
                <Text style={styles.transportIcon}>
                  {segment.type === 'taxi' && '🚕'}
                  {segment.type === 'bus' && '🚌'}
                  {segment.type === 'train' && '🚆'}
                  {segment.type === 'walking' && '🚶'}
                  {segment.type === 'personal' && '👤'}
                </Text>
                <View style={styles.transportInfo}>
                  <Text style={styles.transportRoute}>
                    {segment.from} → {segment.to}
                  </Text>
                  <Text style={styles.transportDetails}>
                    {segment.duration} • {segment.type}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#724838',
    textAlign: 'center',
  },
  mapContainer: {
    height: height * 0.55,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  mapTypeButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapTypeButtonText: {
    fontSize: 20,
  },
  locationCountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1B365D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  calloutContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 12,
    color: '#C65D3B',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#724838',
    lineHeight: 16,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6D5CC',
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#724838',
    marginTop: 4,
  },
  locationsList: {
    padding: 16,
    gap: 12,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 150,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationChipSelected: {
    borderColor: '#C65D3B',
    backgroundColor: '#F2E8E5',
  },
  locationChipIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  locationChipInfo: {
    flex: 1,
  },
  locationChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  locationChipType: {
    fontSize: 12,
    color: '#A66D4A',
    textTransform: 'capitalize',
  },
  transportSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 12,
  },
  transportList: {
    maxHeight: 120,
  },
  transportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  transportIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  transportInfo: {
    flex: 1,
  },
  transportRoute: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B365D',
  },
  transportDetails: {
    fontSize: 12,
    color: '#A66D4A',
  },
});

export default MapScreen;
