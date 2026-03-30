import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Trip Configuration Types
 */
export interface TripConfig {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number;
  groupSize: number;
  preferences: {
    accommodationType: 'riad' | 'hotel' | 'apartment' | 'any';
    travelStyle: 'luxury' | 'comfort' | 'budget' | 'adventure';
    transportType: 'taxi' | 'personal';
    interests: string[];
    dietaryRestrictions: string[];
    accessibility: boolean;
  };
  voiceTranscript: string;
}

interface TripState {
  // Current trip configuration
  config: TripConfig;
  
  // UI States
  isLoading: boolean;
  loadingMessages: string[];
  currentLoadingIndex: number;
  
  // Generated itineraries
  itineraries: Itinerary[] | null;
  selectedItinerary: Itinerary | null;
  
  // Actions
  updateConfig: (config: Partial<TripConfig>) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingMessages: (messages: string[]) => void;
  setItineraries: (itineraries: Itinerary[]) => void;
  selectItinerary: (itinerary: Itinerary) => void;
  resetTrip: () => void;
  
  // Validation
  isConfigValid: () => boolean;
  getTripDuration: () => number;
}

export interface Itinerary {
  id: string;
  name: string;
  totalCost: number;
  currency: string;
  flight: FlightSegment;
  accommodation: Accommodation;
  activities: Activity[];
  restaurants: Restaurant[];
  transport: TransportSegment[];
  isWithinBudget: boolean;
}

interface FlightSegment {
  airline: string;
  flightNumber: string;
  departure: string;
  departureAirport: string;
  arrival: string;
  arrivalAirport: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  class: 'economy' | 'business' | 'first';
}

interface Accommodation {
  name: string;
  type: 'riad' | 'hotel' | 'apartment';
  location: string;
  address: string;
  pricePerNight: number;
  totalPrice: number;
  rating: number;
  stars: number;
  imageUrl?: string;
  amenities: string[];
  phoneNumber?: string;
  mapsUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  price: number;
  duration: string;
  description: string;
  guideName?: string | null;
  guidePhone?: string | null;
  mapsUrl?: string;
  images?: string[];
}

export interface TransportSegment {
  type: 'taxi' | 'bus' | 'train' | 'walking' | 'personal';
  company?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: string;
  from: string;
  to: string;
  fromCoordinates?: { latitude: number; longitude: number };
  toCoordinates?: { latitude: number; longitude: number };
  price: number;
  duration: string;
  mapsUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  priceRange: 'budget' | 'moderate' | 'expensive';
  minPrice: number;
  maxPrice: number;
  rating: number;
  specialties: string[];
  phoneNumber?: string | null;
  mapsUrl?: string;
  recommendedDishes?: string[];
}

const initialConfig: TripConfig = {
  destination: 'Fès, Morocco',
  startDate: null,
  endDate: null,
  budget: 0,
  groupSize: 1,
  preferences: {
    accommodationType: 'any',
    travelStyle: 'comfort',
    transportType: 'taxi',
    interests: [],
    dietaryRestrictions: [],
    accessibility: false,
  },
  voiceTranscript: '',
};

/**
 * Trip Store - Manages trip configuration, loading states, and generated itineraries
 */
export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      config: initialConfig,
      isLoading: false,
      loadingMessages: [],
      currentLoadingIndex: 0,
      itineraries: null,
      selectedItinerary: null,

      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setLoadingMessages: (messages) =>
        set({ loadingMessages: messages, currentLoadingIndex: 0 }),

      setItineraries: (itineraries) =>
        set({ itineraries, isLoading: false }),

      selectItinerary: (itinerary) =>
        set({ selectedItinerary: itinerary }),

      resetTrip: () =>
        set({
          config: initialConfig,
          itineraries: null,
          selectedItinerary: null,
          isLoading: false,
        }),

      isConfigValid: () => {
        const { config } = get();
        return (
          config.destination.length > 0 &&
          config.startDate !== null &&
          config.endDate !== null &&
          config.budget > 0 &&
          config.groupSize > 0
        );
      },

      getTripDuration: () => {
        const { config } = get();
        if (!config.startDate || !config.endDate) return 0;
        const diffTime = config.endDate.getTime() - config.startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },
    }),
    {
      name: 'dalil-trip-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        config: state.config,
        selectedItinerary: state.selectedItinerary,
      }),
    }
  )
);
