import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore } from '@store/tripStore';
import { useAuthStore } from '@store/authStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/types';

const ProfileScreen: React.FC = () => {
  const { config, selectedItinerary, itineraries, resetTrip } = useTripStore();
  const { currentUser, logout } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const activeItinerary = selectedItinerary || (itineraries && itineraries[0]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} MAD`;
  
  const getTripDuration = () => {
    if (config.startDate && config.endDate) {
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      const diffTime = end.getTime() - start.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Not set';
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            resetTrip();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleResetTrip = () => {
    Alert.alert(
      'Reset Trip',
      'Are you sure you want to reset your trip configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetTrip(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser?.username || 'Guest'}</Text>
              <Text style={styles.userLocation}>
                📍 {currentUser?.city}, {currentUser?.country}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.title}>My Trip</Text>
          <Text style={styles.subtitle}>{config.destination}</Text>
        </View>

        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Destination</Text>
            <Text style={styles.summaryValue}>{config.destination}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Travelers</Text>
            <Text style={styles.summaryValue}>{config.groupSize} people</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>{formatCurrency(config.budget)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Start Date</Text>
            <Text style={styles.summaryValue}>{formatDate(config.startDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>End Date</Text>
            <Text style={styles.summaryValue}>{formatDate(config.endDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Travel Style</Text>
            <Text style={styles.summaryValue}>
              {config.preferences.travelStyle.charAt(0).toUpperCase() +
                config.preferences.travelStyle.slice(1)}
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Accommodation Type</Text>
              <Text style={styles.preferenceValue}>
                {config.preferences.accommodationType.charAt(0).toUpperCase() +
                  config.preferences.accommodationType.slice(1)}
              </Text>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Interests</Text>
              <Text style={styles.preferenceValue}>
                {config.preferences.interests.length > 0
                  ? config.preferences.interests.join(', ')
                  : 'None specified'}
              </Text>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Dietary Restrictions</Text>
              <Text style={styles.preferenceValue}>
                {config.preferences.dietaryRestrictions.length > 0
                  ? config.preferences.dietaryRestrictions.join(', ')
                  : 'None'}
              </Text>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Accessibility</Text>
              <Text style={styles.preferenceValue}>
                {config.preferences.accessibility ? 'Required' : 'Not required'}
              </Text>
            </View>
          </View>
        </View>

        {/* Itinerary Info */}
        {activeItinerary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Itinerary</Text>
            <View style={styles.itineraryCard}>
              <Text style={styles.itineraryName}>{activeItinerary.name}</Text>
              <View style={styles.itineraryStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{activeItinerary.activities.length}</Text>
                  <Text style={styles.statLabel}>Activities</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {formatCurrency(activeItinerary.totalCost)}
                  </Text>
                  <Text style={styles.statLabel}>Total Cost</Text>
                </View>
                <View style={styles.stat}>
                  <Text
                    style={[
                      styles.statValue,
                      activeItinerary.isWithinBudget ? styles.withinBudget : styles.overBudget,
                    ]}
                  >
                    {activeItinerary.isWithinBudget ? 'Yes' : 'No'}
                  </Text>
                  <Text style={styles.statLabel}>On Budget</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Blog-Style Trip Summary */}
        {activeItinerary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 My Trip Blog</Text>
            <View style={styles.blogCard}>
              {/* Trip Header Image Placeholder */}
              <View style={styles.blogHeader}>
                <Text style={styles.blogDestination}>📍 {config.destination}</Text>
                <Text style={styles.blogDates}>
                  {formatDate(config.startDate)} - {formatDate(config.endDate)}
                </Text>
              </View>
              
              {/* Trip Overview */}
              <View style={styles.blogContent}>
                <Text style={styles.blogTitle}>{activeItinerary.name}</Text>
                <Text style={styles.blogDescription}>
                  A {getTripDuration()}-day journey exploring the beauty of Fès with 
                  {activeItinerary.activities.length} amazing activities and stays at {activeItinerary.accommodation.name}.
                </Text>
                
                {/* Trip Stats */}
                <View style={styles.blogStats}>
                  <View style={styles.blogStat}>
                    <Text style={styles.blogStatNumber}>{getTripDuration()}</Text>
                    <Text style={styles.blogStatLabel}>Days</Text>
                  </View>
                  <View style={styles.blogStat}>
                    <Text style={styles.blogStatNumber}>{activeItinerary.activities.length}</Text>
                    <Text style={styles.blogStatLabel}>Activities</Text>
                  </View>
                  <View style={styles.blogStat}>
                    <Text style={styles.blogStatNumber}>{activeItinerary.restaurants?.length || 0}</Text>
                    <Text style={styles.blogStatLabel}>Restaurants</Text>
                  </View>
                  <View style={styles.blogStat}>
                    <Text style={styles.blogStatNumber}>{formatCurrency(activeItinerary.totalCost)}</Text>
                    <Text style={styles.blogStatLabel}>Total</Text>
                  </View>
                </View>
                
                {/* Accommodation Preview */}
                <View style={styles.blogAccommodation}>
                  <Text style={styles.blogSectionTitle}>🏨 Where You'll Stay</Text>
                  <Text style={styles.blogAccommodationName}>{activeItinerary.accommodation.name}</Text>
                  <Text style={styles.blogAccommodationDetails}>
                    {activeItinerary.accommodation.type} • {activeItinerary.accommodation.rating}⭐ • {formatCurrency(activeItinerary.accommodation.pricePerNight)}/night
                  </Text>
                </View>
                
                {/* Highlights */}
                <View style={styles.blogHighlights}>
                  <Text style={styles.blogSectionTitle}>✨ Trip Highlights</Text>
                  {activeItinerary.activities.slice(0, 3).map((activity, index) => (
                    <View key={activity.id} style={styles.blogHighlightItem}>
                      <Text style={styles.blogHighlightNumber}>{index + 1}</Text>
                      <Text style={styles.blogHighlightText}>{activity.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Voice Transcript */}
        {config.voiceTranscript && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Input</Text>
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptText}>{config.voiceTranscript}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetTrip}>
            <Text style={styles.resetButtonText}>Start New Trip</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>DALIL</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>Your AI-powered guide to Morocco</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2E8E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  subtitle: {
    fontSize: 16,
    color: '#724838',
    marginTop: 4,
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
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#5D3C30',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B365D',
    flex: 1,
    textAlign: 'right',
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
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#5D3C30',
    flex: 1,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B365D',
    flex: 1,
    textAlign: 'right',
  },
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itineraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 16,
  },
  itineraryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  statLabel: {
    fontSize: 12,
    color: '#724838',
    marginTop: 4,
  },
  withinBudget: {
    color: '#22C55E',
  },
  overBudget: {
    color: '#EF4444',
  },
  transcriptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transcriptText: {
    fontSize: 14,
    color: '#5D3C30',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#C65D3B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E6D5CC',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  appVersion: {
    fontSize: 14,
    color: '#A66D4A',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 12,
    color: '#724838',
    marginTop: 4,
  },
  // User card styles
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B365D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#724838',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  blogHeader: {
    backgroundColor: '#1B365D',
    padding: 20,
  },
  blogDestination: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  blogDates: {
    fontSize: 14,
    color: '#C9A961',
    marginTop: 4,
  },
  blogContent: {
    padding: 20,
  },
  blogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B365D',
    marginBottom: 8,
  },
  blogDescription: {
    fontSize: 14,
    color: '#5D3C30',
    lineHeight: 22,
    marginBottom: 16,
  },
  blogStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  blogStat: {
    alignItems: 'center',
  },
  blogStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  blogStatLabel: {
    fontSize: 11,
    color: '#724838',
    marginTop: 4,
  },
  blogAccommodation: {
    marginBottom: 20,
  },
  blogSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C65D3B',
    marginBottom: 8,
  },
  blogAccommodationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
  },
  blogAccommodationDetails: {
    fontSize: 13,
    color: '#724838',
    marginTop: 4,
  },
  blogHighlights: {
    marginTop: 8,
  },
  blogHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blogHighlightNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C9A961',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  blogHighlightText: {
    fontSize: 14,
    color: '#5D3C30',
    flex: 1,
  },
});

export default ProfileScreen;
