/**
 * Smart Loading Screen
 * 
 * An engaging, dynamic loading screen that displays what the AI
 * is working on in real-time. Replaces boring spinners with
 * contextual, Fès-specific status messages.
 * 
 * Features:
 * - Dynamic rotating messages about AI progress
 * - Progress bar with estimated completion
 * - Smooth animations between message transitions
 * - Moroccan-inspired visual design
 * - Auto-navigation when processing complete
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTripStore } from '@store/tripStore';
import { useAuthStore } from '@store/authStore';
import { RootStackParamList } from '@navigation/types';
import {
  LOADING_MESSAGES,
  LoadingMessage,
} from '@constants/loadingMessages';

type LoadingNavigationProp = StackNavigationProp<RootStackParamList, 'SmartLoading'>;

const SmartLoadingScreen: React.FC = () => {
  const navigation = useNavigation<LoadingNavigationProp>();
  const { config, setItineraries, setLoading } = useTripStore();
  
  // Animation values
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // Processing state
  const [isComplete, setIsComplete] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<LoadingMessage[]>([]);

  // Initialize with shuffled messages
  useEffect(() => {
    const shuffled = [...LOADING_MESSAGES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    setDisplayedMessages(shuffled);
  }, []);

  // Calculate total duration
  const totalDuration = displayedMessages.reduce(
    (acc, msg) => acc + msg.duration,
    0
  );

  // Animate progress bar
  useEffect(() => {
    if (displayedMessages.length === 0) return;

    Animated.timing(progress, {
      toValue: 1,
      duration: totalDuration,
      useNativeDriver: false,
    }).start();
  }, [displayedMessages, totalDuration, progress]);

  // Rotate through messages
  useEffect(() => {
    if (displayedMessages.length === 0 || currentMessageIndex >= displayedMessages.length) {
      return;
    }

    const currentMessage = displayedMessages[currentMessageIndex];
    
    // Animate message transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      { iterations: Math.floor(currentMessage.duration / 1000) }
    ).start();

    // Schedule next message
    const timer = setTimeout(() => {
      if (currentMessageIndex < displayedMessages.length - 1) {
        setCurrentMessageIndex((prev) => prev + 1);
      } else {
        // All messages complete - simulate API completion
        handleCompletion();
      }
    }, currentMessage.duration);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, displayedMessages, fadeAnim, scaleAnim]);

  // Handle completion and generate mock itineraries
  const handleCompletion = useCallback(async () => {
    setIsComplete(true);
    setLoading(false);

    // Simulate API call to generate itineraries
    // In production, this would be a real API call to your LLM backend
    const mockItineraries = generateMockItineraries(config.budget, config.groupSize);
    
    // Small delay for smooth transition
    setTimeout(() => {
      setItineraries(mockItineraries);
      navigation.replace('ItinerarySelection');
    }, 800);
  }, [config.budget, config.groupSize, navigation, setItineraries, setLoading]);

  const { currentUser } = useAuthStore();

  // Generate mock itineraries with detailed information for clickable items
  const generateMockItineraries = useCallback((budget: number, groupSize: number) => {
    const userCountry = currentUser?.country || 'Your Country';
    
    // Calculate actual trip duration from dates
    const getTripDuration = () => {
      if (config.startDate && config.endDate) {
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(diffDays, 1);
      }
      return 3; // Default 3 days if no dates set
    };
    
    const tripDuration = getTripDuration();
    const numNights = Math.max(tripDuration - 1, 1);
    const roomsNeeded = Math.ceil(groupSize / 2);
    
    // Budget tiers - ensure hotels fit within budget
    const flightBudget = budget * 0.35; // 35% for flights
    const hotelBudget = budget * 0.30; // 30% for accommodation
    const activitiesBudget = budget * 0.20; // 20% for activities
    const transportBudget = budget * 0.15; // 15% for transport
    
    // Calculate max per-night hotel price based on budget
    const maxPerNight = Math.floor((hotelBudget / numNights) / roomsNeeded);
    
    // Hotel tiers based on budget
    const budgetHotelPrice = Math.min(350, Math.max(200, maxPerNight * 0.5));
    const midHotelPrice = Math.min(800, Math.max(400, maxPerNight * 0.8));
    const luxuryHotelPrice = Math.min(2500, Math.max(1200, maxPerNight));
    
    // Cost tiers for total itinerary pricing
    const baseCost = Math.min(budget * 0.6, 15000);
    const midCost = Math.min(budget * 0.8, 22000);
    const maxCost = Math.min(budget, 30000);
    
    // Transport prices based on realistic Fès rates
    const isPersonal = config.preferences.transportType === 'personal';
    const taxiAirportPrice = 120 + (groupSize > 3 ? 50 : 0); // 120-170 MAD for airport taxi
    const personalAirportPrice = 350 + (groupSize > 4 ? 150 : 0); // 350-500 MAD for private driver
    
    // Common Fès coordinates
    const fesAirportCoords = { latitude: 33.9271, longitude: -4.9776 };
    const medinaCoords = { latitude: 34.0623, longitude: -4.9786 };
    const palaisFarajCoords = { latitude: 34.0620, longitude: -4.9780 };
    const riadFesCoords = { latitude: 34.0625, longitude: -4.9790 };

    return [
      {
        id: '1',
        name: 'Essential Fès Experience',
        totalCost: baseCost * groupSize,
        currency: 'MAD',
        isWithinBudget: baseCost * groupSize <= budget,
        flight: {
          airline: 'Royal Air Maroc',
          flightNumber: 'AT912',
          departure: userCountry,
          departureAirport: `${userCountry} International`,
          arrival: 'Fès, Morocco',
          arrivalAirport: 'Fès-Saïss Airport (FEZ)',
          price: 3200 * groupSize,
          duration: '2h 45m',
          departureTime: '08:30',
          arrivalTime: '11:15',
          class: 'economy' as const,
        },
        accommodation: {
          name: 'Riad Tara',
          type: 'riad' as const,
          location: 'Fès El-Bali Medina',
          address: 'Fès El-Bali Medina, Fès 30110',
          pricePerNight: budgetHotelPrice,
          totalPrice: budgetHotelPrice * numNights * roomsNeeded,
          rating: 4.4,
          stars: 3,
          amenities: ['Breakfast Included', 'Traditional Decor', 'Central Courtyard', 'Rooftop Terrace', 'Friendly Hosts'],
          phoneNumber: '+212 535 747900',
          mapsUrl: 'https://maps.google.com/?q=Riad+Tara+Fès',
        },
        activities: [
          {
            id: 'a1',
            name: 'Medina Guided Tour',
            type: 'culture',
            location: 'Fès El Bali',
            address: 'Bab Bou Jeloud, Fès',
            coordinates: { latitude: 34.0623, longitude: -4.9786 },
            price: 350 * groupSize,
            duration: '4 hours',
            description: 'Explore the ancient medina with a certified local expert. Walk through the narrow alleys, discover hidden souks, and learn about the 1200-year history of Fès.',
            guideName: 'Ahmed Benali',
            guidePhone: '+212 612 345 678',
            mapsUrl: 'https://maps.google.com/?q=Bab+Bou+Jeloud+Fès',
          },
          {
            id: 'a2',
            name: 'Chouara Tannery Visit',
            type: 'culture',
            location: 'Medina',
            address: 'Chouara Tannery, Rue de la Tannerie, Fès',
            coordinates: { latitude: 34.0668, longitude: -4.9734 },
            price: 150 * groupSize,
            duration: '1 hour',
            description: 'Witness the ancient art of leather tanning using natural dyes and traditional methods that have remained unchanged for centuries.',
            guideName: 'Mohammed Tazi',
            guidePhone: '+212 623 456 789',
            mapsUrl: 'https://maps.google.com/?q=Chouara+Tannery+Fès',
          },
          {
            id: 'a3',
            name: 'Bou Inania Madrasa',
            type: 'history',
            location: 'Medina',
            address: 'Bou Inania Madrasa, Rue Talaa Kebira, Fès',
            coordinates: { latitude: 34.0652, longitude: -4.9739 },
            price: 50 * groupSize,
            duration: '1 hour',
            description: 'Marvel at stunning Marinid architecture and intricate woodwork at this 14th-century Islamic school.',
            guideName: 'Fatima Zahra',
            guidePhone: '+212 634 567 890',
            mapsUrl: 'https://maps.google.com/?q=Bou+Inania+Madrasa+Fès',
          },
          {
            id: 'a4',
            name: 'Dar Batha Museum',
            type: 'culture',
            location: 'Fès Jdid',
            address: 'Place du Batha, Fès',
            coordinates: { latitude: 34.0615, longitude: -4.9805 },
            price: 20 * groupSize,
            duration: '2 hours',
            description: 'Discover Moroccan arts and crafts including traditional ceramics, woodwork, and embroidery in this beautiful 19th-century palace.',
            guideName: 'Amina Lahbabi',
            guidePhone: '+212 645 678 901',
            mapsUrl: 'https://maps.google.com/?q=Dar+Batha+Museum+Fès',
          },
          {
            id: 'a5',
            name: 'Souk Shopping Experience',
            type: 'shopping',
            location: 'Medina',
            address: 'Souk el Attarine, Talaa Kebira, Fès',
            coordinates: { latitude: 34.0645, longitude: -4.9750 },
            price: 200 * groupSize,
            duration: '3 hours',
            description: 'Navigate the labyrinthine markets with a local guide. Shop for authentic spices, argan oil, carpets, and handcrafted ceramics.',
            guideName: 'Omar Idrissi',
            guidePhone: '+212 656 789 012',
            mapsUrl: 'https://maps.google.com/?q=Souk+el+Attarine+Fès',
          },
          {
            id: 'a6',
            name: 'Pottery Workshop',
            type: 'culture',
            location: 'Ain Nokbi',
            address: 'Ain Nokbi Pottery District, Route de Sefrou, Fès',
            coordinates: { latitude: 34.0333, longitude: -4.9833 },
            price: 400 * groupSize,
            duration: '3 hours',
            description: 'Create your own Fassi pottery with master artisans. Learn the techniques passed down through generations.',
            guideName: 'Hassan El Amrani',
            guidePhone: '+212 667 890 123',
            mapsUrl: 'https://maps.google.com/?q=Ain+Nokbi+Pottery+Fès',
          },
        ],
        restaurants: [
          {
            id: 'r1',
            name: 'Dar Hatim',
            cuisine: 'Traditional Fassi',
            location: 'Medina',
            address: '7 Derb Ben Salem, Douh, Fès',
            coordinates: { latitude: 34.0630, longitude: -4.9780 },
            priceRange: 'moderate' as const,
            minPrice: 120,
            maxPrice: 350,
            rating: 4.7,
            specialties: ['Pastilla', 'Tanjia', 'Rfissa', 'Couscous Fassi'],
            phoneNumber: '+212 535 63 20 12',
            mapsUrl: 'https://maps.google.com/?q=Dar+Hatim+Restaurant+Fès',
            recommendedDishes: ['Chicken Pastilla', 'Beef Tanjia', 'Vegetable Tagine'],
          },
          {
            id: 'r2',
            name: 'Café Clock',
            cuisine: 'Fusion / Modern Moroccan',
            location: 'Talaa Kebira',
            address: '7 Derb el Magana, Talaa Kebira, Fès',
            coordinates: { latitude: 34.0650, longitude: -4.9745 },
            priceRange: 'moderate' as const,
            minPrice: 80,
            maxPrice: 250,
            rating: 4.5,
            specialties: ['Camel Burger', 'Harira Soup', 'Date Milkshake'],
            phoneNumber: '+212 535 63 78 53',
            mapsUrl: 'https://maps.google.com/?q=Cafe+Clock+Fès',
            recommendedDishes: ['Camel Burger', 'Moroccan Pancakes', 'Mint Lemonade'],
          },
          {
            id: 'r3',
            name: 'Le Tarbouche',
            cuisine: 'Moroccan Fine Dining',
            location: 'Fès El Bali',
            address: '15 Rue Sidi El Khiyat, Fès',
            coordinates: { latitude: 34.0625, longitude: -4.9795 },
            priceRange: 'expensive' as const,
            minPrice: 300,
            maxPrice: 800,
            rating: 4.6,
            specialties: ['Royal Couscous', 'Lamb Tagine with Prunes', 'Seafood Pastilla'],
            phoneNumber: '+212 535 74 00 78',
            mapsUrl: 'https://maps.google.com/?q=Le+Tarbouche+Fès',
            recommendedDishes: ['Royal Couscous', 'Lamb Tagine', 'Fruit Pastilla'],
          },
          {
            id: 'r4',
            name: 'Thami\'s',
            cuisine: 'Street Food',
            location: 'Bab Bou Jeloud',
            address: 'Near Bab Bou Jeloud, Fès',
            coordinates: { latitude: 34.0623, longitude: -4.9786 },
            priceRange: 'budget' as const,
            minPrice: 20,
            maxPrice: 80,
            rating: 4.3,
            specialties: ['Briouats', 'Msemmen', 'Harira', 'Mint Tea'],
            phoneNumber: '+212 612 345 999',
            mapsUrl: 'https://maps.google.com/?q=Bab+Bou+Jeloud+Fès',
            recommendedDishes: ['Briouats with Cheese', 'Msemmen with Honey', 'Harira Soup'],
          },
        ],
        transport: isPersonal ? [
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Karim Benbrahim',
            driverPhone: '+212 661 234 567',
            vehicleInfo: 'Mercedes V-Class (7 seats)',
            from: 'Fès-Saïss Airport',
            to: 'Riad Verus',
            fromCoordinates: fesAirportCoords,
            toCoordinates: medinaCoords,
            price: personalAirportPrice,
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Riad+Verus',
          },
          {
            type: 'walking' as const,
            from: 'Riad',
            to: 'Medina Sites',
            price: 0,
            duration: '5-15 min',
          },
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Karim Benbrahim',
            driverPhone: '+212 661 234 567',
            vehicleInfo: 'Mercedes V-Class (7 seats)',
            from: 'Riad Verus',
            to: 'Fès-Saïss Airport',
            fromCoordinates: medinaCoords,
            toCoordinates: fesAirportCoords,
            price: personalAirportPrice,
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Riad+Verus+Fès+Airport',
          },
        ] : [
          {
            type: 'taxi' as const,
            from: 'Fès-Saïss Airport',
            to: 'Riad Verus',
            fromCoordinates: fesAirportCoords,
            toCoordinates: medinaCoords,
            price: taxiAirportPrice,
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Riad+Verus',
          },
          {
            type: 'walking' as const,
            from: 'Riad',
            to: 'Medina Sites',
            price: 0,
            duration: '5-15 min',
          },
          {
            type: 'taxi' as const,
            from: 'Riad Verus',
            to: 'Fès-Saïss Airport',
            fromCoordinates: medinaCoords,
            toCoordinates: fesAirportCoords,
            price: taxiAirportPrice,
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Riad+Verus+Fès+Airport',
          },
        ],
      },
      {
        id: '2',
        name: 'Premium Moroccan Journey',
        totalCost: midCost * groupSize,
        currency: 'MAD',
        isWithinBudget: midCost * groupSize <= budget,
        flight: {
          airline: 'Royal Air Maroc',
          flightNumber: 'AT914',
          departure: userCountry,
          departureAirport: `${userCountry} International`,
          arrival: 'Fès, Morocco',
          arrivalAirport: 'Fès-Saïss Airport (FEZ)',
          price: 3800 * groupSize,
          duration: '2h 45m',
          departureTime: '14:20',
          arrivalTime: '17:05',
          class: 'economy' as const,
        },
        accommodation: {
          name: 'Riad Zamane & Spa',
          type: 'riad' as const,
          location: 'Fès El-Bali Medina',
          address: 'Fès El-Bali Medina, Fès 30110',
          pricePerNight: midHotelPrice,
          totalPrice: midHotelPrice * numNights * roomsNeeded,
          rating: 4.5,
          stars: 4,
          amenities: ['Fountain Courtyard', 'Rooftop Terrace with City Views', 'Spa Services', 'Princess Style Rooms', 'Warm Hospitality'],
          phoneNumber: '+212 535 740700',
          mapsUrl: 'https://maps.google.com/?q=Riad+Zamane+Fès',
        },
        activities: [
          {
            id: 'a1',
            name: 'Private Medina Tour',
            type: 'culture',
            location: 'Fès El Bali',
            address: 'Private tour starting from your hotel',
            coordinates: { latitude: 34.0623, longitude: -4.9786 },
            price: 650 * groupSize,
            duration: '6 hours',
            description: 'Exclusive guided tour with a historian specializing in Moroccan architecture and Islamic art. Includes private access to restricted areas.',
            guideName: 'Dr. Youssef Mansouri',
            guidePhone: '+212 612 456 789',
            mapsUrl: 'https://maps.google.com/?q=Fès+Medina',
          },
          {
            id: 'a2',
            name: 'Traditional Cooking Class',
            type: 'food',
            location: 'Medina',
            address: 'Private kitchen in restored Dar (traditional house)',
            coordinates: { latitude: 34.0635, longitude: -4.9775 },
            price: 550 * groupSize,
            duration: '4 hours',
            description: 'Learn to prepare authentic Fassi dishes with a local chef. Market visit included to select fresh ingredients.',
            guideName: 'Chef Nadia Bennani',
            guidePhone: '+212 623 567 890',
            mapsUrl: 'https://maps.google.com/?q=Fès+Cooking+Class',
          },
          {
            id: 'a3',
            name: 'Luxury Hammam Experience',
            type: 'wellness',
            location: 'Medina',
            address: 'Palais Faraj Spa',
            coordinates: { latitude: 34.0620, longitude: -4.9780 },
            price: 450 * groupSize,
            duration: '2.5 hours',
            description: 'Traditional Moroccan spa ritual including black soap scrub, ghassoul mask, and argan oil massage.',
            guideName: 'Spa Therapist Fatima',
            guidePhone: '+212 534 567 891',
            mapsUrl: 'https://maps.google.com/?q=Palais+Faraj+Spa',
          },
          {
            id: 'a4',
            name: 'Al-Attarine Madrasa',
            type: 'history',
            location: 'Medina',
            address: 'Al-Attarine Madrasa, Rue Talaa Kebira, Fès',
            coordinates: { latitude: 34.0655, longitude: -4.9740 },
            price: 30 * groupSize,
            duration: '1.5 hours',
            description: 'Beautiful 14th-century Islamic school with stunning zellige tilework and carved cedar ceilings.',
            guideName: 'Karim El Fassi',
            guidePhone: '+212 645 678 901',
            mapsUrl: 'https://maps.google.com/?q=Al-Attarine+Madrasa',
          },
          {
            id: 'a5',
            name: 'Nejjarine Museum',
            type: 'culture',
            location: 'Medina',
            address: 'Place Nejjarine, Fès',
            coordinates: { latitude: 34.0650, longitude: -4.9745 },
            price: 30 * groupSize,
            duration: '1.5 hours',
            description: 'Wooden arts and crafts museum housed in a beautifully restored fondouk (caravanserai).',
            guideName: 'Saida Moussaoui',
            guidePhone: '+212 656 789 012',
            mapsUrl: 'https://maps.google.com/?q=Nejjarine+Museum',
          },
          {
            id: 'a6',
            name: 'Sunset at Borj Nord',
            type: 'nature',
            location: 'City Walls',
            address: 'Borj Nord, Fès',
            coordinates: { latitude: 34.0700, longitude: -4.9820 },
            price: 50 * groupSize,
            duration: '2 hours',
            description: 'Panoramic sunset views over the medina from this historic fort. Photography opportunity with golden light.',
            guideName: 'Younes El Amrani',
            guidePhone: '+212 667 890 123',
            mapsUrl: 'https://maps.google.com/?q=Borj+Nord+Fès',
          },
        ],
        restaurants: [
          {
            id: 'r1',
            name: 'L\'Amandier Palais Faraj',
            cuisine: 'Gourmet Moroccan',
            location: 'Palais Faraj',
            address: '16-18 Quartier Ziat, Derb Bensouda, Fès',
            coordinates: { latitude: 34.0620, longitude: -4.9780 },
            priceRange: 'expensive' as const,
            minPrice: 400,
            maxPrice: 1200,
            rating: 4.8,
            specialties: ['Modern Moroccan Cuisine', 'Tasting Menu', 'Wine Pairing'],
            phoneNumber: '+212 535 63 53 56',
            mapsUrl: 'https://maps.google.com/?q=Palais+Faraj+Restaurant',
            recommendedDishes: ['Lamb Shank with Prunes', 'Seafood Pastilla', 'Vegetable Couscous'],
          },
          {
            id: 'r2',
            name: 'Restaurant Numero 1',
            cuisine: 'Traditional Fassi',
            location: 'Medina',
            address: '1 Rue Sidi El Khiyat, Fès',
            coordinates: { latitude: 34.0625, longitude: -4.9790 },
            priceRange: 'moderate' as const,
            minPrice: 150,
            maxPrice: 450,
            rating: 4.6,
            specialties: ['Authentic Fassi Cuisine', 'Traditional Pastilla', 'Tanjia'],
            phoneNumber: '+212 535 74 07 37',
            mapsUrl: 'https://maps.google.com/?q=Restaurant+Numero+1+Fès',
            recommendedDishes: ['Chicken Pastilla', 'Mechoui', 'Tanjia'],
          },
          {
            id: 'r3',
            name: 'The Ruined Garden',
            cuisine: 'Mediterranean / Moroccan',
            location: 'Medina',
            address: 'Siaj, Riad Laarous, Fès',
            coordinates: { latitude: 34.0618, longitude: -4.9795 },
            priceRange: 'moderate' as const,
            minPrice: 120,
            maxPrice: 350,
            rating: 4.7,
            specialties: ['Garden Setting', 'Fresh Ingredients', 'Vegetarian Options'],
            phoneNumber: '+212 535 63 82 76',
            mapsUrl: 'https://maps.google.com/?q=Ruined+Garden+Fès',
            recommendedDishes: ['Garden Salad', 'Grilled Vegetables', 'Fresh Bread'],
          },
          {
            id: 'r4',
            name: 'Chouara Food Stalls',
            cuisine: 'Street Food',
            location: 'Chouara',
            address: 'Near Chouara Tannery, Fès',
            coordinates: { latitude: 34.0668, longitude: -4.9734 },
            priceRange: 'budget' as const,
            minPrice: 15,
            maxPrice: 60,
            rating: 4.4,
            specialties: ['Fresh Grilled Meats', 'Bread', 'Harira'],
            phoneNumber: null,
            mapsUrl: 'https://maps.google.com/?q=Chouara+Fès',
            recommendedDishes: ['Lamb Brochettes', 'Khobz Bread', 'Spicy Harira'],
          },
        ],
        transport: config.preferences.transportType === 'personal' ? [
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Karim Benbrahim',
            driverPhone: '+212 661 234 567',
            vehicleInfo: 'Mercedes V-Class (7 seats)',
            from: 'Fès-Saïss Airport',
            to: 'Palais Faraj',
            fromCoordinates: fesAirportCoords,
            toCoordinates: { latitude: 34.0620, longitude: -4.9780 },
            price: 400 * Math.ceil(groupSize / 6),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Palais+Faraj',
          },
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Karim Benbrahim',
            driverPhone: '+212 661 234 567',
            vehicleInfo: 'Mercedes V-Class (7 seats)',
            from: 'Palais Faraj',
            to: 'Fès-Saïss Airport',
            fromCoordinates: { latitude: 34.0620, longitude: -4.9780 },
            toCoordinates: fesAirportCoords,
            price: 400 * Math.ceil(groupSize / 6),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Palais+Faraj+Fès+Airport',
          },
        ] : [
          {
            type: 'taxi' as const,
            from: 'Fès-Saïss Airport',
            to: 'Palais Faraj',
            fromCoordinates: fesAirportCoords,
            toCoordinates: { latitude: 34.0620, longitude: -4.9780 },
            price: 200 * Math.ceil(groupSize / 3),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Palais+Faraj',
          },
          {
            type: 'walking' as const,
            from: 'Palais Faraj',
            to: 'Medina Sites',
            price: 0,
            duration: '5-10 min',
          },
          {
            type: 'taxi' as const,
            from: 'Palais Faraj',
            to: 'Fès-Saïss Airport',
            fromCoordinates: { latitude: 34.0620, longitude: -4.9780 },
            toCoordinates: fesAirportCoords,
            price: 200 * Math.ceil(groupSize / 3),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Palais+Faraj+Fès+Airport',
          },
        ],
      },
      {
        id: '3',
        name: 'Luxury Fès & Beyond',
        totalCost: maxCost * groupSize,
        currency: 'MAD',
        isWithinBudget: maxCost * groupSize <= budget,
        flight: {
          airline: 'Royal Air Maroc',
          flightNumber: 'AT910',
          departure: userCountry,
          departureAirport: `${userCountry} International`,
          arrival: 'Fès, Morocco',
          arrivalAirport: 'Fès-Saïss Airport (FEZ)',
          price: 7500 * groupSize,
          duration: '2h 45m',
          departureTime: '10:00',
          arrivalTime: '12:45',
          class: 'business' as const,
        },
        accommodation: {
          name: 'Riad Fès - Relais & Châteaux',
          type: 'riad' as const,
          location: 'Fès El-Bali Medina',
          address: '5 Derb Ben Slimane, Zerbtana, Fès 30110',
          pricePerNight: luxuryHotelPrice,
          totalPrice: luxuryHotelPrice * numNights * roomsNeeded,
          rating: 4.7,
          stars: 5,
          amenities: ['Panoramic Terrace Views', 'Traditional Fassi Architecture', 'Spa', 'Gourmet Restaurant', 'Authentic Courtyard', 'Relais & Châteaux Collection'],
          phoneNumber: '+212 535 741600',
          mapsUrl: 'https://maps.google.com/?q=Riad+Fès+Relais+Châteaux',
        },
        activities: [
          {
            id: 'a1',
            name: 'Exclusive Medina Access',
            type: 'culture',
            location: 'Fès El Bali',
            address: 'Private access tour',
            coordinates: { latitude: 34.0623, longitude: -4.9786 },
            price: 1200 * groupSize,
            duration: 'Full Day',
            description: 'VIP access to normally restricted areas including private palaces and artisan workshops. Personal historian guide included.',
            guideName: 'Prof. Abdelhak El Fassi',
            guidePhone: '+212 612 789 456',
            mapsUrl: 'https://maps.google.com/?q=Fès+Medina',
          },
          {
            id: 'a2',
            name: 'Private Chef Dinner',
            type: 'food',
            location: 'Riad Fès',
            address: 'Private dining room, Riad Fès',
            coordinates: { latitude: 34.0625, longitude: -4.9790 },
            price: 1800 * groupSize,
            duration: '3 hours',
            description: 'Michelin-level gourmet Fassi dining experience prepared by executive chef. Wine pairing available.',
            guideName: 'Chef Yannick',
            guidePhone: '+212 535 74 01 01',
            mapsUrl: 'https://maps.google.com/?q=Riad+Fès+Restaurant',
          },
          {
            id: 'a3',
            name: 'Meknès & Volubilis Day Trip',
            type: 'excursion',
            location: 'Meknès Region',
            address: 'Volubilis Archaeological Site',
            coordinates: { latitude: 34.0711, longitude: -5.5547 },
            price: 2500 * groupSize,
            duration: '10 hours',
            description: 'Private guided tour of ancient Roman ruins at Volubilis and Imperial City of Meknès. Includes gourmet lunch.',
            guideName: 'Archaeologist Dr. Samira',
            guidePhone: '+212 623 890 123',
            mapsUrl: 'https://maps.google.com/?q=Volubilis+Morocco',
          },
          {
            id: 'a4',
            name: 'Master Artisan Workshop',
            type: 'culture',
            location: 'Medina',
            address: 'Private workshop in Medina',
            coordinates: { latitude: 34.0630, longitude: -4.9780 },
            price: 900 * groupSize,
            duration: '4 hours',
            description: 'One-on-one session with master artisans in zellige, woodworking, or metalwork. Create a piece to take home.',
            guideName: 'Master Hassan El Haddad',
            guidePhone: '+212 634 901 234',
            mapsUrl: 'https://maps.google.com/?q=Fès+Artisan+Workshop',
          },
          {
            id: 'a5',
            name: 'Jnan Sbil Gardens',
            type: 'nature',
            location: 'Between Fès El Bali and Jedid',
            address: 'Jnan Sbil Gardens, Fès',
            coordinates: { latitude: 34.0580, longitude: -4.9800 },
            price: 0,
            duration: '1.5 hours',
            description: 'Peaceful botanical gardens with Andalusian-style fountains, eucalyptus trees, and rose gardens.',
            guideName: 'Self-guided',
            guidePhone: null,
            mapsUrl: 'https://maps.google.com/?q=Jnan+Sbil+Gardens',
          },
          {
            id: 'a6',
            name: 'Royal Palace Gates',
            type: 'history',
            location: 'Fès Jdid',
            address: 'Dar El Makhzen, Fès Jdid',
            coordinates: { latitude: 34.0520, longitude: -4.9950 },
            price: 0,
            duration: '45 min',
            description: 'Admire the magnificent golden gates of the Royal Palace. External viewing only.',
            guideName: 'Self-guided',
            guidePhone: null,
            mapsUrl: 'https://maps.google.com/?q=Royal+Palace+Fès',
          },
        ],
        restaurants: [
          {
            id: 'r1',
            name: 'L\'Ambre at Riad Fès',
            cuisine: 'Fine Dining Moroccan',
            location: 'Riad Fès',
            address: '5 Derb Ben Slimane, Zerbtana, Fès',
            coordinates: { latitude: 34.0625, longitude: -4.9790 },
            priceRange: 'expensive' as const,
            minPrice: 500,
            maxPrice: 1500,
            rating: 4.9,
            specialties: ['Michelin-Quality Moroccan', 'Tasting Menu', 'Wine Pairing'],
            phoneNumber: '+212 535 74 01 01',
            mapsUrl: 'https://maps.google.com/?q=Riad+Fès+Restaurant',
            recommendedDishes: ['Seven-Vegetable Couscous', 'Lamb Medallions', 'Pastilla with Pigeon'],
          },
          {
            id: 'r2',
            name: 'Dar Roumana',
            cuisine: 'Modern Moroccan',
            location: 'Fès El Bali',
            address: '30 Derb el Amer, Zkak Roumane, Fès',
            coordinates: { latitude: 34.0635, longitude: -4.9775 },
            priceRange: 'expensive' as const,
            minPrice: 350,
            maxPrice: 900,
            rating: 4.8,
            specialties: ['Farm-to-Table', 'Seasonal Menu', 'Organic Ingredients'],
            phoneNumber: '+212 535 63 90 47',
            mapsUrl: 'https://maps.google.com/?q=Dar+Roumana+Fès',
            recommendedDishes: ['Tasting Menu', 'Local Cheese Selection', 'Seasonal Vegetables'],
          },
          {
            id: 'r3',
            name: 'Les Mérinides',
            cuisine: 'International / Moroccan',
            location: 'Batha',
            address: 'Avenue des Mérinides, Fès',
            coordinates: { latitude: 34.0600, longitude: -4.9800 },
            priceRange: 'expensive' as const,
            minPrice: 400,
            maxPrice: 1000,
            rating: 4.6,
            specialties: ['Panoramic Views', 'Gourmet Cuisine', 'Sunset Dining'],
            phoneNumber: '+212 535 64 56 56',
            mapsUrl: 'https://maps.google.com/?q=Hotel+Les+Mérinides+Fès',
            recommendedDishes: ['Grilled Seafood', 'Beef Tagine', 'Moroccan Pastries'],
          },
          {
            id: 'r4',
            name: 'La Maison Bleue',
            cuisine: 'Traditional Fassi',
            location: 'Medina',
            address: '2 Place de l\'Istiqlal, Batha, Fès',
            coordinates: { latitude: 34.0610, longitude: -4.9810 },
            priceRange: 'expensive' as const,
            minPrice: 300,
            maxPrice: 800,
            rating: 4.7,
            specialties: ['Authentic Fassi', 'Historic Setting', 'Traditional Music'],
            phoneNumber: '+212 535 74 18 43',
            mapsUrl: 'https://maps.google.com/?q=Maison+Bleue+Fès',
            recommendedDishes: ['Royal Couscous', 'Lamb with Prunes', 'Fruit Pastilla'],
          },
        ],
        transport: config.preferences.transportType === 'personal' ? [
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Hassan Bennani',
            driverPhone: '+212 662 345 678',
            vehicleInfo: 'Mercedes S-Class or Range Rover',
            from: 'Fès-Saïss Airport',
            to: 'Riad Fès',
            fromCoordinates: fesAirportCoords,
            toCoordinates: { latitude: 34.0625, longitude: -4.9790 },
            price: 600 * Math.ceil(groupSize / 4),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Riad+Fès',
          },
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Hassan Bennani',
            driverPhone: '+212 662 345 678',
            vehicleInfo: 'Mercedes S-Class or Range Rover',
            from: 'Riad Fès',
            to: 'Volubilis/Meknès',
            fromCoordinates: { latitude: 34.0625, longitude: -4.9790 },
            toCoordinates: { latitude: 34.0711, longitude: -5.5547 },
            price: 2000,
            duration: '1 hour each way',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Volubilis',
          },
          {
            type: 'personal' as const,
            company: 'Fès Transport Premium',
            driverName: 'Hassan Bennani',
            driverPhone: '+212 662 345 678',
            vehicleInfo: 'Mercedes S-Class or Range Rover',
            from: 'Riad Fès',
            to: 'Fès-Saïss Airport',
            fromCoordinates: { latitude: 34.0625, longitude: -4.9790 },
            toCoordinates: fesAirportCoords,
            price: 600 * Math.ceil(groupSize / 4),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Riad+Fès+Fès+Airport',
          },
        ] : [
          {
            type: 'taxi' as const,
            from: 'Fès-Saïss Airport',
            to: 'Riad Fès',
            fromCoordinates: fesAirportCoords,
            toCoordinates: { latitude: 34.0625, longitude: -4.9790 },
            price: 250 * Math.ceil(groupSize / 3),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Airport+Riad+Fès',
          },
          {
            type: 'taxi' as const,
            from: 'Riad Fès',
            to: 'Volubilis/Meknès',
            price: 1200,
            duration: '1 hour',
            mapsUrl: 'https://maps.google.com/?dir=Fès+Volubilis',
          },
          {
            type: 'taxi' as const,
            from: 'Riad Fès',
            to: 'Fès-Saïss Airport',
            fromCoordinates: { latitude: 34.0625, longitude: -4.9790 },
            toCoordinates: fesAirportCoords,
            price: 250 * Math.ceil(groupSize / 3),
            duration: '30 min',
            mapsUrl: 'https://maps.google.com/?dir=Riad+Fès+Fès+Airport',
          },
        ],
      },
    ];
  }, [config.preferences.transportType, currentUser?.country]);

  // Get current message
  const currentMessage = displayedMessages[currentMessageIndex];

  // Interpolate progress bar width
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Planning Your Journey</Text>
          <Text style={styles.subtitle}>
            Our AI is crafting your perfect Moroccan experience
          </Text>
        </View>

        {/* Central Animation Area */}
        <View style={styles.animationContainer}>
          {currentMessage && (
            <>
              {/* Animated Icon */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.icon}>{currentMessage.icon}</Text>
              </Animated.View>

              {/* Dynamic Message */}
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.messageText}>{currentMessage.text}</Text>
              </Animated.View>
            </>
          )}

          {/* Loading Indicator */}
          {!isComplete && (
            <ActivityIndicator
              size="small"
              color="#C65D3B"
              style={styles.spinner}
            />
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressWidth },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {isComplete
              ? 'Complete!'
              : `Step ${currentMessageIndex + 1} of ${displayedMessages.length}`}
          </Text>
        </View>

        {/* Budget Indicator */}
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Your Budget</Text>
          <Text style={styles.budgetValue}>
            {config.budget.toLocaleString()} MAD
          </Text>
          <Text style={styles.budgetNote}>
            for {config.groupSize} traveler{config.groupSize > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipTitle}>💡 Did you know?</Text>
          <Text style={styles.tipText}>
            Fès is home to the world's oldest university, Al-Qarawiyyin, founded in 859 AD.
          </Text>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
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
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C65D3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B365D',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 26,
  },
  spinner: {
    marginTop: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E6D5CC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C65D3B',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8B573D',
    textAlign: 'center',
  },
  budgetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#8B573D',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B365D',
  },
  budgetNote: {
    fontSize: 12,
    color: '#A66D4A',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#F2E8E5',
    borderRadius: 12,
    padding: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D3C30',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#724838',
    lineHeight: 20,
  },
});

export default SmartLoadingScreen;
