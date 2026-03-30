import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTripStore, Itinerary } from '@store/tripStore';
import { RootStackParamList } from '@navigation/types';

type ItinerarySelectionNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width } = Dimensions.get('window');

const ItinerarySelectionScreen: React.FC = () => {
  const navigation = useNavigation<ItinerarySelectionNavigationProp>();
  const { itineraries, selectItinerary, config, resetTrip } = useTripStore();
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} MAD`;

  const handleSelectItinerary = (itinerary: Itinerary) => {
    setSelectedItineraryId(itinerary.id);
  };

  const handleConfirm = () => {
    if (selectedItineraryId) {
      const selected = itineraries?.find(i => i.id === selectedItineraryId);
      if (selected) {
        selectItinerary(selected);
        navigation.replace('Main');
      }
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Leave Plan Selection?',
      'You will return to the trip configuration. Any selected plan will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            resetTrip();
            navigation.navigate('Onboarding');
          }
        },
      ]
    );
  };

  if (!itineraries || itineraries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Itineraries Available</Text>
          <Text style={styles.emptyText}>
            Please go back and configure your trip first.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getItineraryIcon = (index: number) => {
    switch (index) {
      case 0:
        return '💎';
      case 1:
        return '⭐';
      case 2:
        return '👑';
      default:
        return '📍';
    }
  };

  const getItineraryTag = (index: number, isWithinBudget: boolean) => {
    if (!isWithinBudget) return { text: 'Over Budget', color: '#EF4444' };
    switch (index) {
      case 0:
        return { text: 'Best Value', color: '#22C55E' };
      case 1:
        return { text: 'Most Popular', color: '#C9A961' };
      case 2:
        return { text: 'Luxury', color: '#8B5CF6' };
      default:
        return { text: 'Custom', color: '#1B365D' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Close and Confirm buttons */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleClose}
        >
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <TouchableOpacity 
          style={[styles.headerButton, styles.headerButtonConfirm, !selectedItineraryId && styles.headerButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedItineraryId}
        >
          <Text style={[styles.headerButtonText, styles.headerButtonTextConfirm]}>✓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            We found {itineraries?.length} perfect itineraries for your trip to {config.destination}
          </Text>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Your Budget</Text>
            <Text style={styles.budgetValue}>{formatCurrency(config.budget)}</Text>
          </View>
        </View>

        {/* Itinerary Cards */}
        <View style={styles.cardsContainer}>
          {itineraries.map((itinerary, index) => {
            const tag = getItineraryTag(index, itinerary.isWithinBudget);
            return (
              <TouchableOpacity
                key={itinerary.id}
                style={[
                  styles.card,
                  !itinerary.isWithinBudget && styles.cardOverBudget,
                  selectedItineraryId === itinerary.id && styles.cardSelected,
                ]}
                onPress={() => handleSelectItinerary(itinerary)}
                activeOpacity={0.9}
              >
                {/* Selection Indicator */}
                {selectedItineraryId === itinerary.id && (
                  <View style={styles.selectionIndicator}>
                    <Text style={styles.selectionIndicatorText}>✓ Selected</Text>
                  </View>
                )}
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{getItineraryIcon(index)}</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    <Text style={[styles.tag, { backgroundColor: tag.color + '20', color: tag.color }]}>
                      {tag.text}
                    </Text>
                  </View>
                </View>

                {/* Card Content */}
                <Text style={styles.cardTitle}>{itinerary.name}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{itinerary.activities.length}</Text>
                    <Text style={styles.statLabel}>Activities</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {formatCurrency(itinerary.totalCost)}
                    </Text>
                    <Text style={styles.statLabel}>Total Cost</Text>
                  </View>
                </View>

                {/* Accommodation Preview */}
                <View style={styles.accommodationPreview}>
                  <Text style={styles.previewLabel}>Stay at</Text>
                  <Text style={styles.previewValue}>{itinerary.accommodation.name}</Text>
                  <Text style={styles.previewSubvalue}>
                    {itinerary.accommodation.type} • {itinerary.accommodation.rating}⭐
                  </Text>
                </View>

                {/* Activities Preview */}
                <View style={styles.activitiesPreview}>
                  <Text style={styles.previewLabel}>Top Activities</Text>
                  {itinerary.activities.slice(0, 3).map((activity, i) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.activityName} numberOfLines={1}>
                        {activity.name}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    !itinerary.isWithinBudget && styles.selectButtonOverBudget,
                    selectedItineraryId === itinerary.id && styles.selectButtonSelected,
                  ]}
                  onPress={() => handleSelectItinerary(itinerary)}
                >
                  <Text style={[
                    styles.selectButtonText,
                    selectedItineraryId === itinerary.id && styles.selectButtonTextSelected
                  ]}>
                    {selectedItineraryId === itinerary.id ? '✓ Selected' : (itinerary.isWithinBudget ? 'Select This Itinerary' : 'Select Anyway')}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How We Chose These</Text>
          <Text style={styles.infoText}>
            Our AI analyzed your budget of {formatCurrency(config.budget)} for {config.groupSize} traveler
            {config.groupSize > 1 ? 's' : ''} and curated these options based on your preferences.
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6D5CC',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2E8E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonConfirm: {
    backgroundColor: '#22C55E',
  },
  headerButtonDisabled: {
    backgroundColor: '#E6D5CC',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#1B365D',
    fontWeight: 'bold',
  },
  headerButtonTextConfirm: {
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  scrollContent: {
    padding: 20,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#724838',
    marginBottom: 16,
    lineHeight: 22,
  },
  budgetInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  cardOverBudget: {
    borderWidth: 2,
    borderColor: '#EF4444',
    opacity: 0.9,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectionIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2E8E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  tagContainer: {},
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E6D5CC',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  statLabel: {
    fontSize: 12,
    color: '#A66D4A',
    marginTop: 4,
  },
  accommodationPreview: {
    backgroundColor: '#F2E8E5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#A66D4A',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
  },
  previewSubvalue: {
    fontSize: 12,
    color: '#724838',
    marginTop: 2,
  },
  activitiesPreview: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bullet: {
    color: '#C65D3B',
    marginRight: 8,
    fontSize: 16,
  },
  activityName: {
    fontSize: 14,
    color: '#5D3C30',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#1B365D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectButtonOverBudget: {
    backgroundColor: '#EF4444',
  },
  selectButtonSelected: {
    backgroundColor: '#22C55E',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C9A961',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 20,
  },
});

export default ItinerarySelectionScreen;
