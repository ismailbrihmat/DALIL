import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore, Restaurant } from '@store/tripStore';
import DetailModal, { InfoRow, Section, openInGoogleMaps, callPhone } from '@components/common/DetailModal';

const LogisticsScreen: React.FC = () => {
  const { config, selectedItinerary, itineraries } = useTripStore();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const activeItinerary = selectedItinerary || (itineraries && itineraries[0]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} MAD`;

  const openRestaurantDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setSelectedRestaurant(null);
  };

  const getPriceRangeText = (restaurant: Restaurant) => {
    const range = restaurant.priceRange;
    const min = restaurant.minPrice;
    const max = restaurant.maxPrice;
    const priceText = `${min.toLocaleString()} - ${max.toLocaleString()} MAD`;
    
    switch (range) {
      case 'budget': return `💰 ${priceText}`;
      case 'moderate': return `💰💰 ${priceText}`;
      case 'expensive': return `💰💰💰 ${priceText}`;
      default: return priceText;
    }
  };

  if (!activeItinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Logistics Available</Text>
          <Text style={styles.emptyText}>
            Configure your trip first to see logistics details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAccommodation = activeItinerary.accommodation.totalPrice;
  const totalTransport = activeItinerary.transport.reduce((sum, t) => sum + t.price, 0);
  const totalFlight = activeItinerary.flight.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Logistics</Text>
          <Text style={styles.subtitle}>Travel arrangements & bookings</Text>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Cost Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Flight</Text>
            <Text style={styles.costValue}>{formatCurrency(totalFlight)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Accommodation</Text>
            <Text style={styles.costValue}>{formatCurrency(totalAccommodation)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Local Transport</Text>
            <Text style={styles.costValue}>{formatCurrency(totalTransport)}</Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(activeItinerary.totalCost)}
            </Text>
          </View>
        </View>

        {/* Accommodation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accommodation</Text>
          <View style={styles.accommodationCard}>
            <View style={styles.accommodationHeader}>
              <Text style={styles.accommodationName}>
                {activeItinerary.accommodation.name}
              </Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {activeItinerary.accommodation.rating}/5
                </Text>
              </View>
            </View>
            <Text style={styles.accommodationType}>
              {activeItinerary.accommodation.type.toUpperCase()} •{' '}
              {activeItinerary.accommodation.location}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price per night:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(activeItinerary.accommodation.pricePerNight)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(activeItinerary.accommodation.totalPrice)}
              </Text>
            </View>
          </View>
        </View>

        {/* Flight Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Details</Text>
          <View style={styles.flightCard}>
            <Text style={styles.airlineName}>{activeItinerary.flight.airline}</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>DEP</Text>
                <Text style={styles.routeName}>{activeItinerary.flight.departure}</Text>
              </View>
              <View style={styles.routeLine}>
                <Text style={styles.routeArrow}>✈</Text>
                <Text style={styles.routeDuration}>{activeItinerary.flight.duration}</Text>
              </View>
              <View style={styles.routePoint}>
                <Text style={styles.routeCode}>ARR</Text>
                <Text style={styles.routeName}>{activeItinerary.flight.arrival}</Text>
              </View>
            </View>
            <View style={styles.flightPriceRow}>
              <Text style={styles.flightPriceLabel}>Ticket Price:</Text>
              <Text style={styles.flightPriceValue}>
                {formatCurrency(activeItinerary.flight.price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Local Transport */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Transport</Text>
          {activeItinerary.transport.map((segment, index) => (
            <View key={index} style={styles.transportCard}>
              <View style={styles.transportHeader}>
                <View style={styles.transportIcon}>
                  <Text style={styles.transportIconText}>
                    {segment.type === 'taxi' && '🚕'}
                    {segment.type === 'bus' && '🚌'}
                    {segment.type === 'train' && '🚆'}
                    {segment.type === 'walking' && '🚶'}
                    {segment.type === 'personal' && '👤'}
                  </Text>
                </View>
                <Text style={styles.transportType}>
                  {segment.type === 'personal' ? 'Personal Driver' : segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
                </Text>
              </View>
              <View style={styles.transportRoute}>
                <Text style={styles.transportFrom}>{segment.from}</Text>
                <Text style={styles.transportArrow}>→</Text>
                <Text style={styles.transportTo}>{segment.to}</Text>
              </View>
              {segment.type === 'personal' && segment.driverName && (
                <Text style={styles.driverInfo}>Driver: {segment.driverName}</Text>
              )}
              <View style={styles.transportFooter}>
                <Text style={styles.transportDuration}>{segment.duration}</Text>
                <Text style={styles.transportPrice}>
                  {formatCurrency(segment.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Restaurant Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Recommended Restaurants</Text>
          {activeItinerary.restaurants?.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => openRestaurantDetail(restaurant)}
              activeOpacity={0.8}
            >
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{restaurant.rating}⭐</Text>
                </View>
              </View>
              <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
              <Text style={styles.restaurantLocation}>{restaurant.location}</Text>
              <View style={styles.restaurantFooter}>
                <Text style={styles.priceRange}>{getPriceRangeText(restaurant)}</Text>
                <Text style={styles.tapHint}>👆 Tap for details</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Restaurant Detail Modal */}
        {selectedRestaurant && (
          <DetailModal
            visible={modalVisible}
            onClose={closeDetail}
            title={selectedRestaurant.name}
            subtitle={`${selectedRestaurant.cuisine} • ${selectedRestaurant.location}`}
            icon="🍽️"
          >
            <Section title="Restaurant Details">
              <InfoRow label="Cuisine" value={selectedRestaurant.cuisine} />
              <InfoRow label="Location" value={selectedRestaurant.location} />
              <InfoRow label="Address" value={selectedRestaurant.address} />
              <InfoRow label="Rating" value={`${selectedRestaurant.rating}/5 ⭐`} />
              <InfoRow label="Price Range" value={getPriceRangeText(selectedRestaurant)} />
              {selectedRestaurant.phoneNumber && (
                <InfoRow label="Phone" value={selectedRestaurant.phoneNumber} />
              )}
            </Section>
            
            <Section title="Specialties">
              <Text style={styles.specialtiesText}>
                {selectedRestaurant.specialties.join(' • ')}
              </Text>
            </Section>

            {selectedRestaurant.recommendedDishes && (
              <Section title="Recommended Dishes">
                <Text style={styles.dishesText}>
                  {selectedRestaurant.recommendedDishes.join(' • ')}
                </Text>
              </Section>
            )}

            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => openInGoogleMaps(selectedRestaurant.mapsUrl, selectedRestaurant.name)}
            >
              <Text style={styles.mapsButtonText}>📍 View on Google Maps</Text>
            </TouchableOpacity>
            
            {selectedRestaurant.phoneNumber && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => selectedRestaurant.phoneNumber && callPhone(selectedRestaurant.phoneNumber)}
              >
                <Text style={styles.callButtonText}>📞 Call Restaurant</Text>
              </TouchableOpacity>
            )}
          </DetailModal>
        )}

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Important Notes</Text>
          <Text style={styles.notesText}>
            • Check-in at hotel is typically at 2:00 PM{'\n'}
            • Airport check-in recommended 3 hours before flight{'\n'}
            • Keep digital copies of all bookings{'\n'}
            • Local currency: Moroccan Dirham (MAD)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  subtitle: {
    fontSize: 16,
    color: '#724838',
  },
  costCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  costTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  costValue: {
    fontSize: 14,
    color: '#1B365D',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C65D3B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 12,
  },
  accommodationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accommodationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accommodationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#C9A961',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accommodationType: {
    fontSize: 14,
    color: '#724838',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
  },
  routeCode: {
    fontSize: 12,
    color: '#A66D4A',
    fontWeight: '600',
  },
  routeName: {
    fontSize: 14,
    color: '#1B365D',
    fontWeight: '500',
  },
  routeLine: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  routeArrow: {
    fontSize: 20,
    color: '#C65D3B',
  },
  routeDuration: {
    fontSize: 12,
    color: '#724838',
    marginTop: 4,
  },
  flightPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingTop: 12,
  },
  flightPriceLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  flightPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C65D3B',
  },
  transportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2E8E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  transportIconText: {
    fontSize: 16,
  },
  transportType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
  },
  transportRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transportFrom: {
    fontSize: 14,
    color: '#1B365D',
    fontWeight: '500',
  },
  transportArrow: {
    fontSize: 14,
    color: '#C65D3B',
    marginHorizontal: 8,
  },
  transportTo: {
    fontSize: 14,
    color: '#1B365D',
    fontWeight: '500',
  },
  transportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingTop: 8,
  },
  transportDuration: {
    fontSize: 12,
    color: '#A66D4A',
  },
  transportPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  driverInfo: {
    fontSize: 12,
    color: '#22C55E',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    flex: 1,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#C65D3B',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 13,
    color: '#724838',
    marginBottom: 8,
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingTop: 8,
  },
  priceRange: {
    fontSize: 13,
    color: '#5D3C30',
  },
  tapHint: {
    fontSize: 11,
    color: '#A66D4A',
    fontStyle: 'italic',
  },
  specialtiesText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 20,
  },
  dishesText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 20,
  },
  mapsButton: {
    backgroundColor: '#1B365D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  mapsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#C65D3B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C9A961',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 22,
  },
});

export default LogisticsScreen;
