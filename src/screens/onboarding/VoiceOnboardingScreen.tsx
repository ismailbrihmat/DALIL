import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useTripStore } from '@store/tripStore';
import { RootStackParamList } from '@navigation/types';
import VoiceVisualizer from '@components/voice/VoiceVisualizer';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const extractTripParams = (transcript: string): Partial<import('@store/tripStore').TripConfig> => {
  const lowerTranscript = transcript.toLowerCase();
  const budgetMatch = transcript.match(/(\d+)[\s,]*(\d*)\s*(dh|mad|usd|\$|euro|€)/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1] + (budgetMatch[2] || '')) : 0;
  const groupMatch = transcript.match(/(\d+)\s*(people|person|travelers?|guests?)/i);
  const groupSize = groupMatch ? parseInt(groupMatch[1]) : 1;
  let accommodationType: 'riad' | 'hotel' | 'apartment' | 'any' = 'any';
  if (lowerTranscript.indexOf('riad') >= 0) accommodationType = 'riad';
  else if (lowerTranscript.indexOf('hotel') >= 0) accommodationType = 'hotel';
  else if (lowerTranscript.indexOf('apartment') >= 0) accommodationType = 'apartment';
  let travelStyle: 'luxury' | 'comfort' | 'budget' | 'adventure' = 'comfort';
  if (lowerTranscript.indexOf('luxury') >= 0 || lowerTranscript.indexOf('high-end') >= 0) travelStyle = 'luxury';
  else if (lowerTranscript.indexOf('budget') >= 0 || lowerTranscript.indexOf('cheap') >= 0) travelStyle = 'budget';
  else if (lowerTranscript.indexOf('adventure') >= 0) travelStyle = 'adventure';
  const interests: string[] = [];
  const interestKeywords = ['history', 'culture', 'food', 'cuisine', 'shopping', 'souks', 'architecture', 'artisan', 'medina', 'museums', 'nature', 'hiking'];
  interestKeywords.forEach(interest => {
    if (lowerTranscript.indexOf(interest) >= 0) interests.push(interest);
  });
  return {
    budget,
    groupSize,
    preferences: {
      accommodationType,
      travelStyle,
      transportType: 'taxi' as const,
      interests,
      dietaryRestrictions: [],
      accessibility: lowerTranscript.indexOf('accessible') >= 0 || lowerTranscript.indexOf('wheelchair') >= 0,
    },
    voiceTranscript: transcript,
  };
};

const VoiceOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { updateConfig } = useTripStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualBudget, setManualBudget] = useState('');
  const [manualGroupSize, setManualGroupSize] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelStyle, setTravelStyle] = useState<'comfort' | 'luxury' | 'budget' | 'adventure'>('comfort');
  const [accommodationType, setAccommodationType] = useState<'any' | 'riad' | 'hotel' | 'apartment'>('any');
  const [transportType, setTransportType] = useState<'taxi' | 'personal'>('taxi');

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useSpeechRecognitionEvent('result', (event) => {
    const resultEvent = event as any;
    if (resultEvent.results && resultEvent.results.length > 0) {
      const transcript = resultEvent.results[0][0]?.transcript || '';
      setTranscript(transcript);
    }
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    const errorEvent = event as any;
    setVoiceError(errorEvent.message || errorEvent.error || 'Speech recognition error');
    setIsListening(false);
  });

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setVoiceError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) {
          setVoiceError('Microphone permission required for voice input');
          setShowManualInput(true);
        }
      } catch (e) {
        console.error('Permission error:', e);
        setShowManualInput(true);
      }
    };
    checkPermissions();
  }, []);

  const startListening = useCallback(async () => {
    try {
      setTranscript('');
      setVoiceError(null);
      setAudioLevel(0);
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });
    } catch (e) {
      setVoiceError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Stop error:', e);
    }
  }, []);

  const processTripConfig = useCallback(async () => {
    setIsProcessing(true);
    try {
      let config: Partial<import('@store/tripStore').TripConfig>;
      if (transcript && !showManualInput) {
        config = extractTripParams(transcript);
      } else {
        config = {
          budget: parseInt(manualBudget) || 0,
          groupSize: parseInt(manualGroupSize) || 1,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          preferences: {
            accommodationType: accommodationType,
            travelStyle: travelStyle,
            transportType: transportType,
            interests: [],
            dietaryRestrictions: [],
            accessibility: false,
          },
          voiceTranscript: `Manual entry: Budget ${manualBudget} MAD, ${manualGroupSize} travelers, ${travelStyle} style, ${transportType} transport`,
        };
      }
      updateConfig(config);
      if (config.budget && config.budget > 0) {
        navigation.navigate('SmartLoading');
      } else {
        Alert.alert('Missing Information', 'Please provide a budget for your trip.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process your trip configuration.');
    } finally {
      setIsProcessing(false);
    }
  }, [transcript, showManualInput, manualBudget, manualGroupSize, updateConfig, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to DALIL</Text>
            <Text style={styles.subtitle}>Your AI-powered guide to Morocco.{'\n'}Starting with Fès.</Text>
          </View>

          <View style={styles.voiceSection}>
            <Text style={styles.instruction}>
              Tell us about your dream trip to Fès.{'\n'}Include: budget, dates, group size, and preferences.
            </Text>

            {isListening && (
              <View style={styles.visualizerContainer}>
                <VoiceVisualizer audioLevel={audioLevel} isListening={isListening} />
                <Text style={styles.listeningText}>Listening...</Text>
              </View>
            )}

            {transcript && !isListening && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>I heard:</Text>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
            )}

            {voiceError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{voiceError}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]} 
              onPress={isListening ? stopListening : startListening}
              disabled={isProcessing}>
              <Text style={styles.voiceButtonText}>
                {isListening ? '🎙️ Stop Listening' : '🎤 Start Voice Input'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManualInput(!showManualInput)}>
              <Text style={styles.manualToggleText}>{showManualInput ? '↑ Hide Manual Input' : '↓ Show Manual Input'}</Text>
            </TouchableOpacity>
          </View>

          {showManualInput && (
            <View style={styles.manualForm}>
              <Text style={styles.manualFormTitle}>Trip Details</Text>
              
              {/* Budget */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget (MAD)</Text>
                <TextInput 
                  style={styles.input} 
                  value={manualBudget} 
                  onChangeText={setManualBudget} 
                  keyboardType="numeric" 
                  placeholder="e.g., 15000" 
                  placeholderTextColor="#A66D4A" 
                />
              </View>

              {/* Group Size */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Travelers</Text>
                <TextInput 
                  style={styles.input} 
                  value={manualGroupSize} 
                  onChangeText={setManualGroupSize} 
                  keyboardType="numeric" 
                  placeholder="e.g., 2" 
                  placeholderTextColor="#A66D4A" 
                />
              </View>

              {/* Dates */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={startDate ? styles.dateButtonText : styles.dateButtonPlaceholder}>
                      {startDate ? new Date(startDate).toLocaleDateString() : 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={endDate ? styles.dateButtonText : styles.dateButtonPlaceholder}>
                      {endDate ? new Date(endDate).toLocaleDateString() : 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate ? new Date(startDate) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_event: any, selectedDate?: Date) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate ? new Date(endDate) : new Date()}
                  mode="date"
                  display="default"
                  minimumDate={startDate ? new Date(startDate) : new Date()}
                  onChange={(_event: any, selectedDate?: Date) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setEndDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}

              {/* Travel Style */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Travel Style</Text>
                <View style={styles.styleButtons}>
                  {(['budget', 'comfort', 'luxury', 'adventure'] as const).map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.styleButton,
                        travelStyle === style && styles.styleButtonActive,
                      ]}
                      onPress={() => setTravelStyle(style)}
                    >
                      <Text style={[
                        styles.styleButtonText,
                        travelStyle === style && styles.styleButtonTextActive,
                      ]}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Transport Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Transport Preference</Text>
                <View style={styles.styleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.styleButton,
                      transportType === 'taxi' && styles.styleButtonActive,
                    ]}
                    onPress={() => setTransportType('taxi')}
                  >
                    <Text style={[
                      styles.styleButtonText,
                      transportType === 'taxi' && styles.styleButtonTextActive,
                    ]}>
                      🚕 Taxi
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.styleButton,
                      transportType === 'personal' && styles.styleButtonActive,
                    ]}
                    onPress={() => setTransportType('personal')}
                  >
                    <Text style={[
                      styles.styleButtonText,
                      transportType === 'personal' && styles.styleButtonTextActive,
                    ]}>
                      👤 Personal Driver
                    </Text>
                  </TouchableOpacity>
                </View>
                {transportType === 'personal' && (
                  <Text style={styles.transportNote}>
                    ✓ Professional driver from Fès Transport Premium will be assigned
                  </Text>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.proceedButton, isProcessing && styles.proceedButtonDisabled]} onPress={processTripConfig} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.proceedButtonText}>{transcript ? 'Plan My Trip ✨' : 'Continue'}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1B365D', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#724838', textAlign: 'center', lineHeight: 24 },
  voiceSection: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  instruction: { fontSize: 16, color: '#5D3C30', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  visualizerContainer: { alignItems: 'center', marginBottom: 16 },
  listeningText: { marginTop: 12, fontSize: 14, color: '#C65D3B', fontWeight: '600' },
  transcriptContainer: { backgroundColor: '#F2E8E5', borderRadius: 12, padding: 16, marginBottom: 16 },
  transcriptLabel: { fontSize: 12, color: '#8B573D', fontWeight: '600', marginBottom: 8 },
  transcriptText: { fontSize: 16, color: '#1B365D', lineHeight: 22 },
  errorContainer: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 14, color: '#DC2626' },
  voiceButton: { backgroundColor: '#1B365D', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', alignSelf: 'center' },
  voiceButtonActive: { backgroundColor: '#C65D3B' },
  voiceButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  manualToggle: { alignSelf: 'center', marginTop: 16, padding: 8 },
  manualToggleText: { color: '#A66D4A', fontSize: 14, textDecorationLine: 'underline' },
  manualForm: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  manualFormTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B365D', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#5D3C30', marginBottom: 8 },
  input: { backgroundColor: '#FAF7F2', borderWidth: 1, borderColor: '#E6D5CC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1B365D' },
  dateButton: { 
    backgroundColor: '#FAF7F2', 
    borderWidth: 1, 
    borderColor: '#E6D5CC', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    justifyContent: 'center'
  },
  dateButtonText: { fontSize: 16, color: '#1B365D' },
  dateButtonPlaceholder: { fontSize: 16, color: '#A66D4A' },
  transportNote: {
    fontSize: 12,
    color: '#22C55E',
    marginTop: 8,
    fontStyle: 'italic'
  },
  styleButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleButton: { 
    backgroundColor: '#FAF7F2', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6D5CC'
  },
  styleButtonActive: { 
    backgroundColor: '#1B365D', 
    borderColor: '#1B365D'
  },
  styleButtonText: { 
    fontSize: 14, 
    color: '#5D3C30',
    fontWeight: '500'
  },
  styleButtonTextActive: { 
    color: '#FFFFFF',
    fontWeight: '600'
  },
  proceedButton: { backgroundColor: '#C9A961', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#C9A961', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  proceedButtonDisabled: { opacity: 0.6 },
  proceedButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default VoiceOnboardingScreen;
