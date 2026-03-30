import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore, Activity, TransportSegment } from '@store/tripStore';
import DetailModal, { InfoRow, Section, openInGoogleMaps, callPhone } from '@components/common/DetailModal';

const TimelineScreen: React.FC = () => {
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

  // Calculate actual trip duration from dates
  const getTripDuration = () => {
    if (config.startDate && config.endDate) {
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(diffDays, 1);
    }
    // Fallback: calculate from itinerary activities if dates not set
    return activeItinerary?.activities.length 
      ? Math.max(3, Math.ceil(activeItinerary.activities.length / 2))
      : 3;
  };

  const tripDuration = getTripDuration();

  // Render modal content
  const renderModalContent = () => {
    if (!selectedItem) return null;
    const { type, data } = selectedItem;

    switch (type) {
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
                    <TouchableOpacity style={styles.mapsButton} onPress={() => callPhone(data.guidePhone)}>
                      <Text style={styles.mapsButtonText}>📞 Call Guide</Text>
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
                    <TouchableOpacity style={styles.mapsButton} onPress={() => callPhone(data.driverPhone)}>
                      <Text style={styles.mapsButtonText}>📞 Call Driver</Text>
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
          <Text style={styles.emptyTitle}>No Timeline Available</Text>
          <Text style={styles.emptyText}>
            Configure your trip first to see the day-by-day timeline.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Build timeline with airport transfers and activities distributed across actual days
  const buildTimeline = () => {
    const days: { day: number; items: Array<{type: 'activity' | 'transport', data: any, time: string}> }[] = [];
    
    // Get airport transfers
    const airportTransfer = activeItinerary.transport.find(t => 
      t.from.includes('Airport') || t.to.includes('Airport')
    );
    
  // Distribute activities across days based on actual trip duration
    const totalActivityDays = Math.max(1, tripDuration - 2); // -2 for arrival/departure days
    const activitiesPerDay = Math.ceil(activeItinerary.activities.length / totalActivityDays);
    let activityIndex = 0;
    
    for (let dayNum = 1; dayNum <= tripDuration; dayNum++) {
      const dayItems: Array<{type: 'activity' | 'transport', data: any, time: string}> = [];
      
      // Day 1: Arrival
      if (dayNum === 1 && airportTransfer) {
        dayItems.push({
          type: 'transport',
          data: airportTransfer,
          time: '12:00',
        });
        // Add 1-2 activities for arrival day
        for (let i = 0; i < Math.min(2, activeItinerary.activities.length - activityIndex); i++) {
          if (activityIndex < activeItinerary.activities.length) {
            dayItems.push({
              type: 'activity',
              data: activeItinerary.activities[activityIndex],
              time: `${14 + i * 3}:00`,
            });
            activityIndex++;
          }
        }
      }
      // Last day: Departure
      else if (dayNum === tripDuration && airportTransfer) {
        // Add 1 activity before departure
        if (activityIndex < activeItinerary.activities.length) {
          dayItems.push({
            type: 'activity',
            data: activeItinerary.activities[activityIndex],
            time: '09:00',
          });
          activityIndex++;
        }
        dayItems.push({
          type: 'transport',
          data: airportTransfer,
          time: '15:00',
        });
      }
      // Middle days: Full activities
      else {
        const startHour = 9;
        for (let i = 0; i < activitiesPerDay && activityIndex < activeItinerary.activities.length; i++) {
          dayItems.push({
            type: 'activity',
            data: activeItinerary.activities[activityIndex],
            time: `${startHour + i * 3}:00`,
          });
          activityIndex++;
        }
      }
      
      days.push({ day: dayNum, items: dayItems });
    }
    
    return days;
  };

  const days = buildTimeline();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trip Timeline</Text>
          <Text style={styles.subtitle}>
            {config.destination} • {tripDuration} days
          </Text>
          {config.startDate && config.endDate && (
            <Text style={styles.dateRange}>
              {new Date(config.startDate).toLocaleDateString()} - {new Date(config.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {days.map((day) => (
            <View key={day.day} style={styles.dayContainer}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayNumberContainer}>
                  <Text style={styles.dayNumber}>Day {day.day}</Text>
                </View>
                <View style={styles.dayLine} />
              </View>

              {/* Day Items */}
              <View style={styles.dayContent}>
                {day.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={`${item.type}-${itemIndex}`}
                    style={styles.activityContainer}
                    onPress={() => openDetail(item.type, item.data)}
                    activeOpacity={0.8}
                  >
                    {/* Time indicator */}
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>

                    {/* Item Card */}
                    <View style={[
                      styles.activityCard,
                      item.type === 'transport' && styles.transportCard
                    ]}>
                      {item.type === 'transport' ? (
                        <>
                          <Text style={styles.transportLabel}>✈️ Airport Transfer</Text>
                          <Text style={styles.activityName}>{item.data.from} → {item.data.to}</Text>
                          <Text style={styles.activityType}>{item.data.type === 'personal' ? 'Personal Driver' : item.data.type}</Text>
                          <View style={styles.activityFooter}>
                            <Text style={styles.activityDuration}>{item.data.duration}</Text>
                            <Text style={styles.activityPrice}>{formatCurrency(item.data.price)}</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <Text style={styles.activityName}>{item.data.name}</Text>
                          <Text style={styles.activityType}>{item.data.type}</Text>
                          <Text style={styles.activityLocation}>{item.data.location}</Text>
                          <View style={styles.activityFooter}>
                            <Text style={styles.activityDuration}>{item.data.duration}</Text>
                            <Text style={styles.activityPrice}>{formatCurrency(item.data.price)}</Text>
                          </View>
                        </>
                      )}
                      <Text style={styles.tapHint}>👆 Tap for details</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          visible={modalVisible}
          onClose={closeDetail}
          title={selectedItem.type === 'activity' ? selectedItem.data.name : 'Transport Details'}
          subtitle={selectedItem.type === 'activity' ? selectedItem.data.type : `${selectedItem.data.from} → ${selectedItem.data.to}`}
          icon={selectedItem.type === 'activity' ? '🎯' : '✈️'}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  subtitle: {
    fontSize: 16,
    color: '#724838',
    marginTop: 4,
  },
  timeline: {
    paddingLeft: 8,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayNumberContainer: {
    backgroundColor: '#1B365D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E6D5CC',
    marginLeft: 12,
  },
  dayContent: {
    paddingLeft: 8,
  },
  activityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeContainer: {
    width: 50,
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#A66D4A',
    fontWeight: '600',
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#C9A961',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 4,
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
  dateRange: {
    fontSize: 14,
    color: '#A66D4A',
    marginTop: 4,
  },
  transportCard: {
    borderLeftColor: '#1B365D',
  },
  transportLabel: {
    fontSize: 12,
    color: '#1B365D',
    fontWeight: '600',
    marginBottom: 4,
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
  descriptionText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 22,
  },
});

export default TimelineScreen;
