import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/authStore';

type AuthNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

// List of countries with their major cities
const COUNTRIES_WITH_CITIES: Record<string, string[]> = {
  'France': ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Malaga', 'Bilbao', 'Zaragoza'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Boston', 'Seattle'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Quebec City'],
  'Morocco': ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Tetouan', 'Oujda', 'Kenitra'],
  'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna'],
  'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabes'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Sharm El-Sheikh', 'Luxor', 'Aswan'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege', 'Bruges'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne'],
  'Portugal': ['Lisbon', 'Porto', 'Braga', 'Faro', 'Coimbra', 'Setubal'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Adana'],
  'Senegal': ['Dakar', 'Touba', 'Thies', 'Kaolack', 'Mbour', 'Saint-Louis'],
  'Ivory Coast': ['Abidjan', 'Bouake', 'Daloa', 'San-Pedro', 'Yamoussoukro'],
  'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Segou'],
  'Niger': ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora'],
  'Togo': ['Lome', 'Sokode', 'Kara', 'Atakpame', 'Kpalime'],
  'Benin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon'],
};

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const availableCities = country ? COUNTRIES_WITH_CITIES[country] || [] : [];

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!country || !city) {
      Alert.alert('Error', 'Please select your country and city');
      return;
    }

    setIsLoading(true);
    const result = register(username, country, city, password);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Welcome!',
        `Your account has been created successfully.`,
        [{ text: 'Continue', onPress: () => navigation.replace('Onboarding') }]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🌍</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DALIL and discover Morocco</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                placeholderTextColor="#A66D4A"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Country</Text>
              <TouchableOpacity 
                style={styles.countryButton}
                onPress={() => {
                  setShowCountryPicker(!showCountryPicker);
                  setShowCityPicker(false);
                }}
              >
                <Text style={country ? styles.countryButtonText : styles.countryButtonPlaceholder}>
                  {country || 'Select your country'}
                </Text>
                <Text style={styles.arrow}>{showCountryPicker ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              
              {showCountryPicker && (
                <View style={styles.countryList}>
                  <ScrollView style={styles.countryScroll} nestedScrollEnabled>
                    {Object.keys(COUNTRIES_WITH_CITIES).map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.countryItem,
                          country === c && styles.countryItemActive
                        ]}
                        onPress={() => {
                          setCountry(c);
                          setCity('');
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.countryItemText,
                          country === c && styles.countryItemTextActive
                        ]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your City</Text>
              <TouchableOpacity 
                style={[styles.countryButton, !country && styles.countryButtonDisabled]}
                onPress={() => {
                  if (country) {
                    setShowCityPicker(!showCityPicker);
                    setShowCountryPicker(false);
                  }
                }}
                disabled={!country}
              >
                <Text style={city ? styles.countryButtonText : styles.countryButtonPlaceholder}>
                  {city || (country ? 'Select your city' : 'First select a country')}
                </Text>
                <Text style={styles.arrow}>{showCityPicker ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              
              {showCityPicker && country && (
                <View style={styles.countryList}>
                  <ScrollView style={styles.countryScroll} nestedScrollEnabled>
                    {availableCities.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.countryItem,
                          city === c && styles.countryItemActive
                        ]}
                        onPress={() => {
                          setCity(c);
                          setShowCityPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.countryItemText,
                          city === c && styles.countryItemTextActive
                        ]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password (min 6 chars)"
                  placeholderTextColor="#A66D4A"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A66D4A"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
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
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D3C30',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6D5CC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1B365D',
  },
  countryButton: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6D5CC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryButtonText: {
    fontSize: 16,
    color: '#1B365D',
  },
  countryButtonPlaceholder: {
    fontSize: 16,
    color: '#A66D4A',
  },
  arrow: {
    fontSize: 16,
    color: '#724838',
  },
  countryList: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6D5CC',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  countryScroll: {
    paddingVertical: 8,
  },
  countryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryItemActive: {
    backgroundColor: '#F2E8E5',
  },
  countryItemText: {
    fontSize: 16,
    color: '#5D3C30',
  },
  countryItemTextActive: {
    color: '#1B365D',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#1B365D',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1B365D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#724838',
  },
  countryButtonDisabled: {
    backgroundColor: '#F0E8E4',
    borderWidth: 1,
    borderColor: '#E6D5CC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6D5CC',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1B365D',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginLink: {
    fontSize: 14,
    color: '#C65D3B',
    fontWeight: '600',
  },
});

export default RegisterScreen;
