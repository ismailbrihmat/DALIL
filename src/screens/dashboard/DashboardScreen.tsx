import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore, Itinerary, Activity, TransportSegment } from '@store/tripStore';
import DetailModal, { InfoRow, Section, openInGoogleMaps, callPhone } from '@components/common/DetailModal';

const DashboardScreen: React.FC = () => {
  const { config, selectedItinerary, itineraries } = useTripStore();
  const [selectedItem, setSelectedItem] = useState<{ type: string; data: any } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const activeItinerary = selectedItinerary || (itineraries && itineraries[0]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} MAD`;

  const openDetail = (type: string, data: any) => {
    setSelectedItem({ type, data });
    setModalVisible(true);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Render modal content based on item type
  const renderModalContent = () => {
    if (!selectedItem) return null;

    const { type, data } = selectedItem;

    switch (type) {
      case 'accommodation':
        return (
          <>
            <Section title="Hotel Details">
              <InfoRow label="Name" value={data.name} />
              <InfoRow label="Type" value={data.type.charAt(0).toUpperCase() + data.type.slice(1)} />
              <InfoRow label="Stars" value={'⭐'.repeat(data.stars)} />
              <InfoRow label="Rating" value={`${data.rating}/5`} />
              <InfoRow label="Address" value={data.address} />
              <InfoRow label="Phone" value={data.phoneNumber || 'N/A'} />
            </Section>
            <Section title="Pricing">
              <InfoRow label="Per Night" value={formatCurrency(data.pricePerNight)} />
              <InfoRow label="Total Stay" value={formatCurrency(data.totalPrice)} />
            </Section>
            {data.amenities && (
              <Section title="Amenities">
                <Text style={styles.amenitiesText}>{data.amenities.join(' • ')}</Text>
              </Section>
            )}
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => openInGoogleMaps(data.mapsUrl, data.name)}
            >
              <Text style={styles.mapsButtonText}>📍 View on Google Maps</Text>
            </TouchableOpacity>
            {data.phoneNumber && (
              <TouchableOpacity style={styles.callButton} onPress={() => callPhone(data.phoneNumber)}>
                <Text style={styles.callButtonText}>📞 Call Hotel</Text>
              </TouchableOpacity>
            )}
          </>
        );

      case 'flight':
        return (
          <>
            <Section title="Flight Details">
              <InfoRow label="Airline" value={data.airline} />
              <InfoRow label="Flight Number" value={data.flightNumber} />
              <InfoRow label="Class" value={data.class.charAt(0).toUpperCase() + data.class.slice(1)} />
              <InfoRow label="Duration" value={data.duration} />
              <InfoRow label="Price" value={formatCurrency(data.price)} />
            </Section>
            <Section title="Route">
              <InfoRow label="From" value={`${data.departureAirport} (${data.departure})`} />
              <InfoRow label="Departure Time" value={data.departureTime} />
              <InfoRow label="To" value={`${data.arrivalAirport} (${data.arrival})`} />
              <InfoRow label="Arrival Time" value={data.arrivalTime} />
            </Section>
          </>
        );

      case 'activity':
        return (
          <>
            <Section title="Activity Details">
              <InfoRow label="Name" value={data.name} />
              <InfoRow label="Type" value={data.type.charAt(0).toUpperCase() + data.type.slice(1)} />
              <InfoRow label="Duration" value={data.duration} />
              <InfoRow label="Price" value={formatCurrency(data.price)} />
              <InfoRow label="Address" value={data.address} />
            </Section>
            <Section title="About">
              <Text style={styles.descriptionText}>{data.description}</Text>
            </Section>
            {data.guideName && data.guideName !== 'Self-guided' && (
              <Section title="Your Guide">
                <InfoRow label="Name" value={data.guideName} />
                {data.guidePhone && (
                  <>
                    <InfoRow label="Phone" value={data.guidePhone} />
                    <TouchableOpacity style={styles.callButton} onPress={() => callPhone(data.guidePhone)}>
                      <Text style={styles.callButtonText}>📞 Call Guide</Text>
                    </TouchableOpacity>
                  </>
                )}
              </Section>
            )}
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => openInGoogleMaps(data.mapsUrl, data.name)}
            >
              <Text style={styles.mapsButtonText}>📍 View on Google Maps</Text>
            </TouchableOpacity>
          </>
        );

      case 'transport':
        return (
          <>
            <Section title="Transport Details">
              <InfoRow label="Type" value={data.type.charAt(0).toUpperCase() + data.type.slice(1)} />
              <InfoRow label="Route" value={`${data.from} → ${data.to}`} />
              <InfoRow label="Duration" value={data.duration} />
              <InfoRow label="Price" value={formatCurrency(data.price)} />
            </Section>
            {data.type === 'personal' && (
              <Section title="Driver Information">
                <InfoRow label="Company" value={data.company || 'N/A'} />
                <InfoRow label="Driver Name" value={data.driverName || 'N/A'} />
                <InfoRow label="Vehicle" value={data.vehicleInfo || 'N/A'} />
                {data.driverPhone && (
                  <>
                    <InfoRow label="Phone" value={data.driverPhone} />
                    <TouchableOpacity style={styles.callButton} onPress={() => callPhone(data.driverPhone)}>
                      <Text style={styles.callButtonText}>📞 Call Driver</Text>
                    </TouchableOpacity>
                  </>
                )}
              </Section>
            )}
            {data.mapsUrl && (
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={() => openInGoogleMaps(data.mapsUrl)}
              >
                <Text style={styles.mapsButtonText}>📍 View Route on Google Maps</Text>
              </TouchableOpacity>
            )}
          </>
        );

      default:
        return null;
    }
  };

  if (!activeItinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Itinerary Yet</Text>
          <Text style={styles.emptyText}>
            Go back and configure your trip to generate an itinerary.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.destination}>{config.destination}</Text>
          <Text style={styles.budget}>
            Budget: {formatCurrency(config.budget)}
          </Text>
          <Text style={styles.groupSize}>
            {config.groupSize} traveler{config.groupSize > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(activeItinerary.totalCost)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <Text
              style={[
                styles.summaryValue,
                activeItinerary.isWithinBudget
                  ? styles.withinBudget
                  : styles.overBudget,
              ]}
            >
              {activeItinerary.isWithinBudget ? 'Within Budget' : 'Over Budget'}
            </Text>
          </View>
        </View>

        {/* Accommodation - Clickable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accommodation</Text>
          <TouchableOpacity
            style={styles.accommodationCard}
            onPress={() => openDetail('accommodation', activeItinerary.accommodation)}
            activeOpacity={0.8}
          >
            <Text style={styles.accommodationName}>
              {activeItinerary.accommodation.name}
            </Text>
            <Text style={styles.accommodationType}>
              {activeItinerary.accommodation.type} • {activeItinerary.accommodation.location}
            </Text>
            <Text style={styles.accommodationPrice}>
              {formatCurrency(activeItinerary.accommodation.pricePerNight)} / night
            </Text>
            <Text style={styles.accommodationRating}>
              Rating: {activeItinerary.accommodation.rating}/5
            </Text>
            <Text style={styles.tapHint}>👆 Tap for details & maps</Text>
          </TouchableOpacity>
        </View>

        {/* Flight - Clickable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight</Text>
          <TouchableOpacity
            style={styles.flightCard}
            onPress={() => openDetail('flight', activeItinerary.flight)}
            activeOpacity={0.8}
          >
            <Text style={styles.flightAirline}>{activeItinerary.flight.airline}</Text>
            <View style={styles.flightRoute}>
              <Text style={styles.flightPoint}>{activeItinerary.flight.departure}</Text>
              <Text style={styles.flightArrow}>→</Text>
              <Text style={styles.flightPoint}>{activeItinerary.flight.arrival}</Text>
            </View>
            <View style={styles.flightDetails}>
              <Text style={styles.flightDetail}>
                Duration: {activeItinerary.flight.duration}
              </Text>
              <Text style={styles.flightPrice}>
                {formatCurrency(activeItinerary.flight.price)}
              </Text>
            </View>
            <Text style={styles.tapHint}>👆 Tap for full details</Text>
          </TouchableOpacity>
        </View>

        {/* Activities - Clickable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Activities ({activeItinerary.activities.length})
          </Text>
          {activeItinerary.activities.map((activity, index) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => openDetail('activity', activity)}
              activeOpacity={0.8}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityNumber}>{index + 1}</Text>
                <Text style={styles.activityName}>{activity.name}</Text>
              </View>
              <Text style={styles.activityType}>{activity.type}</Text>
              <Text style={styles.activityLocation}>{activity.location}</Text>
              <Text style={styles.activityDescription}>
                {activity.description}
              </Text>
              <View style={styles.activityFooter}>
                <Text style={styles.activityDuration}>{activity.duration}</Text>
                <Text style={styles.activityPrice}>
                  {formatCurrency(activity.price)}
                </Text>
              </View>
              <Text style={styles.tapHint}>👆 Tap for guide info & maps</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transport - Clickable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Transport</Text>
          {activeItinerary.transport.map((segment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.transportCard}
              onPress={() => openDetail('transport', segment)}
              activeOpacity={0.8}
            >
              <Text style={styles.transportType}>
                {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
              </Text>
              <Text style={styles.transportRoute}>
                {segment.from} → {segment.to}
              </Text>
              <View style={styles.transportFooter}>
                <Text style={styles.transportDuration}>{segment.duration}</Text>
                <Text style={styles.transportPrice}>
                  {formatCurrency(segment.price)}
                </Text>
              </View>
              <Text style={styles.tapHint}>👆 Tap for details</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          visible={modalVisible}
          onClose={closeDetail}
          title={
            selectedItem.type === 'accommodation'
              ? selectedItem.data.name
              : selectedItem.type === 'flight'
              ? 'Flight Details'
              : selectedItem.type === 'activity'
              ? selectedItem.data.name
              : 'Transport Details'
          }
          subtitle={
            selectedItem.type === 'accommodation'
              ? 'Hotel Information'
              : selectedItem.type === 'flight'
              ? `${selectedItem.data.airline} ${selectedItem.data.flightNumber}`
              : selectedItem.type === 'activity'
              ? selectedItem.data.type.charAt(0).toUpperCase() + selectedItem.data.type.slice(1)
              : `${selectedItem.data.from} → ${selectedItem.data.to}`
          }
          icon={
            selectedItem.type === 'accommodation'
              ? '🏨'
              : selectedItem.type === 'flight'
              ? '✈️'
              : selectedItem.type === 'activity'
              ? '🎯'
              : '🚗'
          }
        >
          {renderModalContent()}
        </DetailModal>
      )}
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
  destination: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  budget: {
    fontSize: 16,
    color: '#724838',
    marginTop: 4,
  },
  groupSize: {
    fontSize: 14,
    color: '#A66D4A',
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
  },
  withinBudget: {
    color: '#22C55E',
  },
  overBudget: {
    color: '#EF4444',
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
  accommodationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 4,
  },
  accommodationType: {
    fontSize: 14,
    color: '#724838',
    marginBottom: 8,
  },
  accommodationPrice: {
    fontSize: 14,
    color: '#C65D3B',
    fontWeight: '600',
  },
  accommodationRating: {
    fontSize: 12,
    color: '#C9A961',
    marginTop: 4,
  },
  tapHint: {
    fontSize: 11,
    color: '#A66D4A',
    marginTop: 8,
    fontStyle: 'italic',
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
  amenitiesText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 22,
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
  flightAirline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 12,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  flightPoint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
  },
  flightArrow: {
    fontSize: 20,
    color: '#C65D3B',
    marginHorizontal: 16,
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightDetail: {
    fontSize: 14,
    color: '#724838',
  },
  flightPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C65D3B',
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityNumber: {
    backgroundColor: '#1B365D',
    color: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    color: '#C65D3B',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  activityLocation: {
    fontSize: 14,
    color: '#724838',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#5D3C30',
    marginBottom: 12,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
    paddingTop: 8,
  },
  activityDuration: {
    fontSize: 12,
    color: '#A66D4A',
  },
  activityPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
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
  transportType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 4,
  },
  transportRoute: {
    fontSize: 14,
    color: '#724838',
    marginBottom: 8,
  },
  transportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transportDuration: {
    fontSize: 12,
    color: '#A66D4A',
  },
  transportPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C65D3B',
  },
});

export default DashboardScreen;
